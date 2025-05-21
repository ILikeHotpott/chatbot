from __future__ import annotations
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship
)
from sqlalchemy import Integer, Text, String, ForeignKey


def ms() -> int:
    return int(datetime.utcnow().timestamp() * 1000)


# ---------- 基础 ----------
class Base(DeclarativeBase):
    pass


# ---------- Conversation ----------
class Conversation(Base):
    __tablename__ = "conversations"

    id:        Mapped[str]  = mapped_column(String, primary_key=True)
    title:     Mapped[Optional[str]]
    created_at:Mapped[int]  = mapped_column(Integer, default=ms)

    branches:  Mapped[List["Branch"]]  = relationship(back_populates="conversation")
    messages:  Mapped[List["Message"]] = relationship(back_populates="conversation")


# ---------- Branch ----------
class Branch(Base):
    __tablename__ = "branches"

    id:          Mapped[str] = mapped_column(String, primary_key=True)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("conversations.id"))
    parent_branch_id: Mapped[Optional[str]] = mapped_column(ForeignKey("branches.id"))
    root_message_id:  Mapped[str]           # 先占位，建立后回填
    title:       Mapped[Optional[str]]
    created_at:  Mapped[int] = mapped_column(Integer, default=ms)

    conversation: Mapped[Conversation]     = relationship(back_populates="branches")
    parent:       Mapped[Optional["Branch"]] = relationship(
        remote_side="Branch.id", backref="children"
    )
    messages:     Mapped[List["Message"]]    = relationship(back_populates="branch")


# ---------- Message ----------
class Message(Base):
    __tablename__ = "messages"

    id:        Mapped[str] = mapped_column(String, primary_key=True)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("conversations.id"))
    branch_id:       Mapped[Optional[str]] = mapped_column(ForeignKey("branches.id"))
    parent_id:       Mapped[Optional[str]] = mapped_column(ForeignKey("messages.id"))
    role:      Mapped[str]
    content:   Mapped[str] = mapped_column(Text)
    model:     Mapped[Optional[str]]
    tokens:    Mapped[Optional[int]]
    status:    Mapped[str] = mapped_column(default="done")
    created_at:Mapped[int] = mapped_column(Integer, default=ms)

    conversation: Mapped[Conversation] = relationship(back_populates="messages")
    branch:       Mapped[Optional[Branch]] = relationship(back_populates="messages")
    parent:       Mapped[Optional["Message"]] = relationship(
        remote_side="Message.id", backref="children"
    )
