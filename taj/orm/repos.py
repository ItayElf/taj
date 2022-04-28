import os.path
from typing import List, Dict, Union, Any

from taj.orm.classes import Repo, FileChange, Commit, DeleteFileException
from taj.orm.commit import get_commit_by_hash, get_all_commits
from taj.orm.connections import main_connection, repo_connection, repo_settings
from taj.orm.file_change import get_all_changes_prior_to, get_full_file_content, get_last_update_commit
from taj.orm.users import does_user_exist

_get_repo = """
SELECT r.name, r.description, u2.username ,GROUP_CONCAT(u.username) 
FROM repos r 
LEFT JOIN users_repos ur ON ur.repo_id = r.id
LEFT JOIN users u ON ur.user_id = u.id
JOIN users u2 ON u2.id = r.creator_id 
WHERE r.name=?
GROUP BY r.name;
"""

_get_all_repos = """
SELECT r.name, r.description, u2.username ,GROUP_CONCAT(u.username) 
FROM repos r 
JOIN users_repos ur ON ur.repo_id = r.id
JOIN users u ON ur.user_id = u.id
JOIN users u2 ON u2.id = r.creator_id 
GROUP BY r.name;
"""

_get_repo_query = """
SELECT r.name, r.description, u2.username ,GROUP_CONCAT(u.username) 
FROM repos r 
LEFT JOIN users_repos ur ON ur.repo_id = r.id
LEFT JOIN users u ON ur.user_id = u.id
JOIN users u2 ON u2.id = r.creator_id 
WHERE r.name LIKE ?
GROUP BY r.name;
"""


def get_repo(name: str) -> Repo:
    """Returns a repo based on its name"""
    conn = main_connection()
    c = conn.cursor()
    c.execute(_get_repo, (name,))
    tup = c.fetchone()
    conn.close()
    if not tup:
        raise FileNotFoundError(f"No repo named {name}")
    return Repo(tup[0], tup[1], tup[2], tup[3].split(",") if tup[3] else [])


def get_all_repos() -> List[Repo]:
    """Returns all available repositories"""
    conn = main_connection()
    c = conn.cursor()
    c.execute(_get_all_repos)
    lst = c.fetchall()
    conn.close()
    return [Repo(tup[0], tup[1], tup[2], tup[3].split(",")) for tup in lst]


def get_repos_of(name: str) -> List[Repo]:
    """Returns all repos for specific user"""
    return [r for r in get_all_repos() if name in r.contributors]


def get_files_of_repo(repo: str, directory: str = "", commit: str = "") -> List[Dict[str, Any]]:
    """Return data about the files in a specific directory of a repository"""
    directory = directory.replace("/", os.path.sep)
    directory = directory.replace("\\", os.path.sep)
    r = get_repo(repo)
    conn = repo_connection(r.creator, repo)
    commit_hash = commit if commit else repo_settings(r.creator, repo)["last_commit"]
    c = get_commit_by_hash(conn, commit_hash)
    changes = get_all_changes_prior_to(conn, c.timestamp)
    grouped: Dict[str, List[FileChange]] = {}
    for change in changes:
        if change.name in grouped:
            grouped[os.path.normpath(change.name)].append(change)
        else:
            grouped[os.path.normpath(change.name)] = [change]
    last_commits = {k: {**v.__dict__, **{"file_changes": []}} for k, v in
                    get_last_update_commit(conn, c.timestamp).items()}
    res = []
    files = set()
    for file in grouped:
        if file.startswith(directory):
            rel = file[len(directory):]
            name = rel.split(os.path.sep)[0]
            if name in files:
                continue
            deleted = False
            if os.path.sep in rel:
                res.append({
                    "name": name,
                    "type": "dir",
                    "content": "",
                    "binary": False,
                    "commit": last_commits[file]
                })
            else:
                try:
                    content = get_full_file_content(grouped[file])
                    binary = False
                    try:
                        content = content.decode("utf-8")
                    except UnicodeDecodeError:
                        content = content.hex()
                        binary = True
                    res.append({
                        "name": name,
                        "type": "file",
                        "content": content,
                        "binary": binary,
                        "commit": last_commits[file],
                    })
                except DeleteFileException:
                    deleted = True
            files.add(name)
    conn.close()
    return res


def get_all_files(repo: str, commit: str = "") -> Dict[str, bytes]:
    """Returns all files of the repo, as <filename>: <content>"""
    r = get_repo(repo)
    conn = repo_connection(r.creator, repo)
    commit_hash = commit if commit else repo_settings(r.creator, repo)["last_commit"]
    c = get_commit_by_hash(conn, commit_hash)
    changes = get_all_changes_prior_to(conn, c.timestamp)
    grouped = {}
    for change in changes:
        if change.name in grouped:
            grouped[os.path.normpath(change.name)].append(change)
        else:
            grouped[os.path.normpath(change.name)] = [change]
    for f in grouped:
        grouped[f] = get_full_file_content(grouped[f])
    return grouped


def is_contributor(username: str, repo: str) -> bool:
    """Checks whether a user is already a contributor of a repo"""
    conn = main_connection()
    c = conn.cursor()
    c.execute(
        "SELECT ur.user_id, ur.repo_id FROM users_repos ur JOIN users u on u.id=ur.user_id JOIN repos r ON r.id=ur.repo_id WHERE u.username=? AND r.name=?",
        (username, repo))
    tup = c.fetchone()
    conn.close()
    return not not tup


def add_contributor(username: str, repo: str) -> None:
    """Adds a user as a contributor for a repo if it's not already"""
    if is_contributor(username, repo):
        return
    get_repo(repo)
    does_user_exist(username)
    conn = main_connection()
    uid = conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()[0]
    repo_id = conn.execute("SELECT id FROM repos WHERE name=?", (repo,)).fetchone()[0]
    conn.execute(
        "INSERT INTO users_repos(user_id, repo_id) VALUES(?, ?)",
        (uid, repo_id))
    conn.commit()
    conn.close()


def insert_repo(username: str, name: str) -> None:
    """Inserts a new repo to the database"""
    if not does_user_exist(username):
        raise FileNotFoundError("User was not found")
    conn = main_connection()
    conn.execute("INSERT INTO repos(creator_id, name, description) SELECT id, ?, ? FROM users WHERE username=?",
                 (name, "", username))
    conn.commit()
    conn.close()


def get_file_content(repo: str, file: str, commit: str = "") -> Dict[str, Union[str, bool]]:
    """Returns a dict with file content and metadata"""
    file = file.replace("/", os.path.sep)
    file = file.replace("\\", os.path.sep)
    r = get_repo(repo)
    conn = repo_connection(r.creator, repo)
    commit_hash = commit if commit else repo_settings(r.creator, repo)["last_commit"]
    c = get_commit_by_hash(conn, commit_hash)
    changes = list(filter(lambda x: os.path.normpath(x.name) == file, get_all_changes_prior_to(conn, c.timestamp)))
    if not changes:
        raise FileNotFoundError(f"No file named {file} was found in the given commit")
    content = get_full_file_content(changes)
    binary = False
    size = len(content)
    try:
        content = content.decode()
    except UnicodeDecodeError:
        content = content.hex()
        binary = True
    return {
        "content": content,
        "binary": binary,
        "lines": content.count("\n") + 1 if not binary else -1,
        "size": size,
    }


def reset_contributors(repo: str):
    """Removes all contributors for a repo except its creator"""
    r = get_repo(repo)
    conn = main_connection()
    conn.execute(
        "DELETE FROM users_repos WHERE user_id != (SELECT id FROM users WHERE username=? ) AND repo_id=(SELECT id FROM repos WHERE name=?)",
        (r.creator, repo))
    conn.commit()
    conn.close()


def update_repo(r: Repo):
    """Updates a repo in the db according to the given object, assuming a repo with this name already exists"""
    conn = main_connection()
    conn.execute("UPDATE repos SET description=? WHERE name=?", (r.description, r.name))
    conn.commit()
    reset_contributors(r.name)
    for c in r.contributors:
        if does_user_exist(c):
            add_contributor(c, r.name)
        else:
            raise FileNotFoundError(f"No user named {c}")
    conn.close()


def get_commits_of(name: str) -> List[Commit]:
    """Returns all commits of a repository"""
    r = get_repo(name)
    conn = repo_connection(r.creator, r.name)
    commits = get_all_commits(conn)
    conn.close()
    return commits


def search_repos(query: str) -> List[Repo]:
    """Returns all repos that match the given query"""
    conn = main_connection()
    c = conn.cursor()
    query = f"%{query}%"
    c.execute(_get_repo_query, (query,))
    lst = c.fetchall()
    conn.close()
    return [Repo(tup[0], tup[1], tup[2], tup[3].split(",")) for tup in lst]
