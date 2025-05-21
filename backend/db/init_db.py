from pathlib import Path
import sqlite3

DDL_FILE = Path(__file__).with_name("DDL.sql")
DB_PATH = Path(__file__).with_name("chatbot.db")


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn, open(DDL_FILE) as ddl:
        conn.executescript(ddl.read())
    print("SQLite initialised ➜", DB_PATH.resolve())


if __name__ == "__main__":
    init_db()
