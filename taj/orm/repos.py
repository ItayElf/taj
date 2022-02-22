from typing import List

from taj.orm.classes import Repo
from taj.orm.connections import main_connection

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
