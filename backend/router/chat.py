from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json
from langchain_core.messages import HumanMessage
from backend.db.engine import get_db
from backend.services.chat_repo import add_message, load_context
from backend.models.openai_model import get_openai_streaming_model
from backend.models.gemini_model import get_gemini_streaming_model

router = APIRouter(prefix="/api")


class ChatIn(BaseModel):
    conversation_id: str
    branch_id: str | None = None
    message: str
    model: str


def part(txt):   return f"0:{json.dumps(txt)}\n"


def finish():    return 'd:{"finishReason":"stop"}\n'


@router.post("/chat")
async def chat(body: ChatIn, db: Session = Depends(get_db)):
    if body.model.startswith("gpt"):
        llm = get_openai_streaming_model(body.model)
    elif body.model.startswith("gemini"):
        llm = get_gemini_streaming_model(body.model)
    else:
        return JSONResponse({"error": "unsupported model"}, 400)

    user_msg = add_message(body.conversation_id, body.branch_id,
                           "user", body.message, None, db)

    ctx = load_context(body.conversation_id, body.branch_id, db)
    messages = ctx + [HumanMessage(content=body.message)]
    stream = llm.astream(messages)

    async def gen():
        assistant = ""
        async for delta in stream:
            if delta.content:
                assistant += delta.content
                yield part(delta.content)
        add_message(body.conversation_id, body.branch_id,
                    "assistant", assistant, user_msg.id, db)
        yield finish()

    headers = {"x-vercel-ai-data-stream": "v1"}
    return StreamingResponse(gen(), media_type="text/plain", headers=headers)
