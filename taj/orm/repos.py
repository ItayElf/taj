import os.path
from typing import List, Dict, Union

from taj.orm.classes import Repo, FileChange
from taj.orm.commit import get_commit_by_hash
from taj.orm.connections import main_connection, repo_connection, repo_settings
from taj.orm.file_change import get_all_changes_prior_to, get_full_file_content

_get_repo = """
SELECT r.name, r.description, u2.username ,GROUP_CONCAT(u.username) 
FROM repos r 
JOIN users_repos ur ON ur.repo_id = r.id
JOIN users u ON ur.user_id = u.id
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


def get_repo(name: str) -> Repo:
    """Returns a repo based on its name"""
    conn = main_connection()
    c = conn.cursor()
    c.execute(_get_repo, (name,))
    tup = c.fetchone()
    if not tup:
        raise FileNotFoundError(f"No repo named {name}")
    return Repo(tup[0], tup[1], tup[2], tup[3].split(","))


def get_all_repos() -> List[Repo]:
    """Returns all available repositories"""
    conn = main_connection()
    c = conn.cursor()
    c.execute(_get_all_repos)
    lst = c.fetchall()
    return [Repo(tup[0], tup[1], tup[2], tup[3].split(",")) for tup in lst]


def get_repos_of(name: str) -> List[Repo]:
    """Returns all repos for specific user"""
    return [r for r in get_all_repos() if name in r.contributors]


def get_files_of_repo(repo: str, directory: str = "") -> List[Dict[str, Union[str, bytes, bool]]]:
    # directory = os.path.normpath(directory) if directory else directory
    directory = directory.replace("/", os.path.sep)
    directory = directory.replace("\\", os.path.sep)
    r = get_repo(repo)
    conn = repo_connection(r.creator, repo)
    last_hash = repo_settings(r.creator, repo)["last_commit"]
    c = get_commit_by_hash(conn, last_hash)
    changes = get_all_changes_prior_to(conn, c.timestamp)
    grouped: Dict[str, List[FileChange]] = {}
    for change in changes:
        if change.name in grouped:
            grouped[os.path.normpath(change.name)].append(change)
        else:
            grouped[os.path.normpath(change.name)] = [change]
    res = []
    files = set()
    for file in grouped:
        if file.startswith(directory):
            rel = file[len(directory):]
            name = rel.split(os.path.sep)[0]
            if name in files:
                continue
            if os.path.sep in rel:
                res.append({"name": name, "type": "dir", "content": "", "binary": False})
            else:
                content = get_full_file_content(grouped[file])
                binary = False
                try:
                    content = content.decode("utf-8")
                except UnicodeDecodeError:
                    content = content.hex()
                    binary = True
                res.append(
                    {"name": name, "type": "file", "content": content, "binary": binary})
            files.add(name)
    return res
