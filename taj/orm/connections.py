import os
import sqlite3
import sys

ROOT_PATH = os.path.normpath(os.path.dirname(sys.modules['__main__'].__file__))


def main_connection() -> sqlite3.Connection:
    """Returns a connection for main.db"""
    return sqlite3.connect(os.path.join(ROOT_PATH, "dbs", "main.db"))
