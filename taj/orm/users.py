import os
import random
import sqlite3

from taj.orm.connections import main_connection, ROOT_PATH
from hashlib import md5
from string import ascii_letters, digits, punctuation

_pool = ascii_letters + digits + punctuation


def validate_user(name: str, password: str) -> bool:
    """Checks whether the username password combination is correct"""
    conn = main_connection()
    c = conn.cursor()
    c.execute("SELECT password, salt FROM users WHERE username=?", (name,))
    tup = c.fetchone()
    if not tup:
        raise FileNotFoundError(f"No user named {name}")
    res = md5((password + tup[1]).encode()).hexdigest() == tup[0]
    conn.close()
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
