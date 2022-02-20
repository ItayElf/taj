import os
import random
import sqlite3
import time
import zlib

from taj.orm.connections import main_connection, ROOT_PATH
from hashlib import md5
from string import ascii_letters, digits, punctuation

_pool = ascii_letters + digits + punctuation
_blank_profile_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "blank profile.jpg")
_interval = 172800  # Two hours

_insert_token = """
INSERT INTO tokens(user_id, token, tstamp)
SELECT u.id, ?, ?
FROM users u
WHERE u.username = ?;
"""


def validate_user(name: str, password: str) -> bool:
    """Checks whether the username password combination is correct"""
    conn = main_connection()
    c = conn.cursor()
    c.execute("SELECT password, salt FROM users WHERE username=?", (name,))
    tup = c.fetchone()
    conn.close()
    if not tup:
        raise FileNotFoundError(f"No user named {name}")
    res = md5((password + tup[1]).encode()).hexdigest() == tup[0]
    return res


def insert_user(name: str, password: str) -> None:
    """Inserts a user to the db if the name is not already taken"""
    conn = main_connection()
    try:
        salt = "".join(random.choices(_pool, k=8))
        password = md5((password + salt).encode()).hexdigest()
        conn.execute("INSERT INTO users(username, password, salt) VALUES(?, ?, ?)", (name, password, salt))
        if not os.path.isdir(os.path.join(ROOT_PATH, "dbs", "users", name)):
            os.mkdir(os.path.join(ROOT_PATH, "dbs", "users", name))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise FileExistsError(f"The username {name} is already taken.")
    except OSError:
        conn.close()
        raise ValueError("Invalid username")
    conn.close()


def get_profile_pic(name: str = "", idx: int = -1) -> bytes:
    """Returns the profile pic for a user from the database if it has one, else returns the default one"""
    assert (name and idx == -1 and type(name) is str) or (not name and idx > 0)
    conn = main_connection()
    c = conn.cursor()
    c.execute("SELECT profile_pic FROM users WHERE username=? OR id=?", (name, idx))
    tup = c.fetchone()
    conn.close()
    if not tup:
        raise FileNotFoundError(f"No user named {name} or with index {idx}")
    if tup[0]:
        return zlib.decompress(tup[0])
    return open(_blank_profile_path, "rb").read()


def does_user_exist(name: str) -> bool:
    """Returns whether a user with the given username exists"""
    conn = main_connection()
    c = conn.cursor()
    c.execute("SELECT username FROM users WHERE username=?", (name,))
    tup = c.fetchone()
    conn.close()
    return not not tup


def add_token_if_not_exists(name: str) -> str:
    """Adds a token for a user if the user has no other token and return it"""
    done = False
    conn = main_connection()
    c = conn.cursor()
    c.execute(
        "SELECT token, tstamp FROM tokens JOIN users u ON u.id=tokens.user_id WHERE u.username=? ORDER BY tstamp DESC",
        (name,))
    tup = c.fetchone()
    if tup and tup[1] > time.time():
        return tup[0]
    while not done:
        t = _generate_token()
        tstamp = int(time.time()) + _interval
        try:
            conn.execute(_insert_token, (t, tstamp, name))
            conn.commit()
            conn.close()
            done = True
            return t
        except sqlite3.IntegrityError:
            ...


def validate_token(name: str, token: str) -> bool:
    """Returns true if the given token matches the given user and is not expired"""
    conn = main_connection()
    c = conn.cursor()
    c.execute("SELECT token, tstamp FROM tokens JOIN users u ON u.id = tokens.user_id WHERE u.username=?", (name,))
    lst = c.fetchall()
    now = time.time()
    for (t, tstamp) in lst:
        if t == token and tstamp > now:
            return True
    return False


def _generate_token() -> str:
    """Returns a random string for auth token"""
    return "".join(random.choices(_pool, k=16))
