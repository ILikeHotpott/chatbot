from pathlib import Path
from typing import Generator
from sqlmodel import create_engine, Session

DB_FILE = Path(__file__).parent / "chatbot.db"
engine = create_engine(
    f"sqlite:///{DB_FILE}",
    connect_args={"check_same_thread": False},
    echo=False,
)


def get_db() -> Generator[Session, None, None]:
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()
