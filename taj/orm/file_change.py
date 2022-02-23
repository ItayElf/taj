import sqlite3
import zlib
from typing import List

from taj.orm.classes import FileChange, CFSimplified

_get_file_sql = """
SELECT fc.name, cb.changes, fc.is_full 
FROM file_changes fc 
INNER JOIN change_blobs cb ON cb.id=fc.change_id
WHERE fc.name=? AND fc.commit_id=?;
"""

_get_changes_commit_sql = """
SELECT fc.name, cb.changes, fc.is_full 
FROM file_changes fc 
INNER JOIN change_blobs cb ON cb.id=fc.change_id
WHERE fc.commit_id=?;
"""

_get_changes_name_sql = """
SELECT fc.name, cb.changes, fc.is_full
FROM file_changes fc 
INNER JOIN change_blobs cb ON cb.id=fc.change_id
INNER JOIN commits cm ON cm.id=fc.commit_id
WHERE fc.name=?
ORDER BY cm."timestamp" DESC;
"""

_get_changes_prior_to = """
SELECT fc.name, cb.changes, fc.is_full
FROM file_changes fc
INNER JOIN change_blobs cb ON cb.id=fc.change_id
INNER JOIN commits cm ON cm.id=fc.commit_id
WHERE cm."timestamp" <= ?
ORDER BY cm."timestamp" DESC;
"""


def get_file_change(conn: sqlite3.Connection, name: str, commit_id: int) -> FileChange:
    """Returns a file change from its name and commit
    :raise FileNotFoundError"""
    c = conn.cursor()
    c.execute(_get_file_sql, (name, commit_id))
    tup = c.fetchone()
    if not tup:
        raise FileNotFoundError(f"No file change with name {name} and commit id {commit_id}")
    return FileChange(name, zlib.decompress(tup[1]), bool(tup[2]))


def get_all_changes_commit(conn: sqlite3.Connection, commit_id: int) -> List[FileChange]:
    """Returns all changes for a commit"""
    c = conn.cursor()
    c.execute(_get_changes_commit_sql, (commit_id,))
    lst = c.fetchall()
    res = []
    for (name, change, is_full) in lst:
        change = zlib.decompress(change)
        is_full = not not is_full
        res.append(FileChange(name, change, is_full))
    return res


def get_all_changes_name(conn: sqlite3.Connection, name: str) -> List[FileChange]:
    """Returns all changes made to a file over time from newest to oldest"""
    c = conn.cursor()
    c.execute(_get_changes_name_sql, (name,))
    lst = c.fetchall()
    res = []
    for (name, change, is_full) in lst:
        change = zlib.decompress(change)
        is_full = not not is_full
        res.append(FileChange(name, change, is_full))
    return res


def get_all_changes_prior_to(conn: sqlite3.Connection, timestamp: int) -> List[FileChange]:
    """Returns all changes prior to the given timestamp (inclusive)"""
    c = conn.cursor()
    c.execute(_get_changes_prior_to, (timestamp,))
    lst = c.fetchall()
    res = []
    for (name, change, is_full) in lst:
        change = zlib.decompress(change)
        is_full = not not is_full
        res.append(FileChange(name, change, is_full))
    return res


def get_all_file_changes(conn: sqlite3.Connection) -> List[FileChange]:
    """Returns all file changes"""
    return get_all_changes_prior_to(conn, 9223372036854775807)


def get_full_file_content(changes: List[FileChange]) -> bytes:
    """Builds the file content from the given changes. changes must be sorted by chronological order, such that the first one is the newest"""
    file = b""
    for change in changes[::-1]:
        if change.is_full:
            file = change.changes
        else:
            cf = CFSimplified.from_encoded(change.changes)
            file = cf.apply(file)
    return file
