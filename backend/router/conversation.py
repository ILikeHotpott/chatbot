from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.db.engine import get_db
from backend.services.chat_repo import (
    create_conversation, create_branch,
    list_conversations, get_conversation_messages
)

router = APIRouter()


class NewConv(BaseModel):
    title: str | None = None


@router.post("/api/new_conversation")
def new_conversation(body: NewConv, db: Session = Depends(get_db)):
    conv = create_conversation(body.title, db)
    return {"conversation_id": conv.id}


class NewBranch(BaseModel):
    conversation_id: str
    parent_message_id: str
    title: str | None = None


@router.post("/api/new_branch")
def new_branch(body: NewBranch, db: Session = Depends(get_db)):
    br = create_branch(body.conversation_id, body.parent_message_id, body.title, db)
    return {"branch_id": br.id}


@router.get("/api/get_conversation_list")
def get_conversation_list(db: Session = Depends(get_db)):
    rows = list_conversations(db)
    return [
        {
            "id": r.id,
            "title": r.title or "(untitled)",
            "created_at": r.created_at
        }
        for r in rows
    ]


@router.get("/conversation/{cid}")
def api_get_messages(cid: str, db: Session = Depends(get_db)):
    rows = get_conversation_messages(cid, db)
    return [
        {
            "id": m.id,
            "branch_id": m.branch_id,
            "parent_id": m.parent_id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at
        }
        for m in rows
    ]


class RenameConv(BaseModel):
    title: str


@router.patch("/api/rename_conversation/{conv_id}")
def patch_conversation_title(conv_id: str, body: RenameConv, db: Session = Depends(get_db)):
    from backend.services.chat_repo import rename_conversation
    try:
        conv = rename_conversation(conv_id, body.title, db)
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"id": conv.id, "title": conv.title}


@router.delete("/api/delete_conversation/{conv_id}")
def delete_conv(conv_id: str, db: Session = Depends(get_db)):
    from backend.services.chat_repo import delete_conversation
    try:
        delete_conversation(conv_id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": f"Conversation {conv_id} deleted"}
