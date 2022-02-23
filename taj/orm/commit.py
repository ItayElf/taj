import sqlite3
from typing import List

from taj.orm.classes import Commit
from taj.orm.file_change import get_all_changes_commit

_get_all_commits_sql = """
SELECT id, author, message, last_hash, "timestamp"
FROM commits
ORDER BY timestamp DESC;
"""


def get_commit_by_hash(conn: sqlite3.Connection, commit_hash: str) -> Commit:
    """Returns a commit by its hash.
    :raises FileNotFoundError, ValueError"""
    c = conn.cursor()
    c.execute("SELECT id, author, message, last_hash, \"timestamp\" FROM commits WHERE hash LIKE ? || '%'",
              (commit_hash,))
    lst = c.fetchall()
    if not lst:
        raise FileNotFoundError(f"No commit with hash {commit_hash}")
    elif len(lst) != 1:
        raise ValueError("Given hash is too short. Use full hash.")
    idx, author, message, last_hash, timestamp = lst[0]
    changes = get_all_changes_commit(conn, idx)
    return Commit(author, message, last_hash, changes, timestamp, idx)


def get_all_commits(conn: sqlite3.Connection) -> List[Commit]:
    """Returns all commits in the db ordered by their timestamp from newest to oldest"""
    c = conn.cursor()
    c.execute(_get_all_commits_sql)
    lst = c.fetchall()
    res = []
    for tup in lst:
        idx, author, message, last_hash, timestamp = tup
        changes = get_all_changes_commit(conn, idx)
        res.append(Commit(author, message, last_hash, changes, timestamp, idx))
    return res
