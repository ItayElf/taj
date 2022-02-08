import os
import sqlite3
import sys

_root_path = os.path.dirname(sys.modules['__main__'].__file__)


def main_connection() -> sqlite3.Connection:
    """Returns a connection for main.db"""
    return sqlite3.connect(os.path.join(_root_path, "dbs", "main.db"))
