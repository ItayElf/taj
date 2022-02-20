import os
import sqlite3

_db_script = """
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username text NOT NULL UNIQUE,
    password text NOT NULL,
    salt text NOT NULL,
    profile_pic BLOB
);
CREATE TABLE IF NOT EXISTS tokens(
    user_id INTEGER NOT NULL,
    token text NOT NULL UNIQUE,
    tstamp INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""


def init_db():
    """Initializes the db within 'dbs' folder"""
    if not os.path.isdir("dbs"):
        os.mkdir("dbs")
    with sqlite3.connect(os.path.join("dbs", "main.db")) as conn:
        conn.executescript(_db_script)
        conn.commit()
    conn.close()
    if not os.path.isdir(os.path.join("dbs", "users")):
        os.mkdir(os.path.join("dbs", "users"))
