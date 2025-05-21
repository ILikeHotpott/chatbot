from typing import Generator
from sqlalchemy.orm import Session
from backend.db.engine import get_session


def get_db() -> Generator[Session, None, None]:
    db: Session = get_session()
    try:
        yield db
    finally:
        db.close()
