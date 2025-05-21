import uuid
from sqlmodel import Session, select
from backend.db.models import *
from langchain_core.messages import AIMessage, HumanMessage

_uuid = lambda: str(uuid.uuid4())


def create_conversation(title: str | None, db: Session) -> Conversation:
    conv = Conversation(id=_uuid(), title=title)
    db.add(conv)
    db.commit()

    root_branch = Branch(id=conv.id, conversation_id=conv.id,
                         root_message_id=conv.id, title=title)
    db.add(root_branch);
    db.commit()
    return conv


def create_branch(conv_id: str, parent_msg_id: str, title: str | None, db: Session) -> Branch:
    parent_msg = db.get(Message, parent_msg_id)
    br = Branch(id=_uuid(), conversation_id=conv_id,
                parent_branch_id=parent_msg.branch_id,
                root_message_id=parent_msg_id,
                title=title)
    db.add(br)
    db.commit()
    return br


def add_message(conv_id: str, branch_id: str | None, role: str,
                content: str, parent_id: str | None, db: Session) -> Message:
    msg = Message(id=_uuid(), conversation_id=conv_id, branch_id=branch_id,
                  parent_id=parent_id, role=role, content=content)
    db.add(msg)
    db.commit()
    return msg


def list_conversations(db: Session):
    return db.exec(
        select(Conversation).order_by(Conversation.created_at.desc())
    ).all()


# 获取指定会话所有消息（主干+分支扁平），按时间升序
def get_conversation_messages(conv_id: str, db: Session):
    return db.exec(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
    ).all()


def rename_conversation(conv_id: str, new_title: str, db: Session) -> Conversation:
    conv = db.get(Conversation, conv_id)
    if not conv:
        raise ValueError("Conversation not found")
    conv.title = new_title
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def delete_conversation(conv_id: str, db: Session):
    conv = db.get(Conversation, conv_id)
    if not conv:
        raise ValueError("Conversation not found")

    # 删除关联的消息
    db.exec(select(Message).where(Message.conversation_id == conv_id)).all()
    db.exec(select(Branch).where(Branch.conversation_id == conv_id)).all()

    db.query(Message).filter(Message.conversation_id == conv_id).delete()
    db.query(Branch).filter(Branch.conversation_id == conv_id).delete()

    # 删除会话本体
    db.delete(conv)
    db.commit()


def _to_lc(m: Message):
    return HumanMessage(content=m.content) if m.role == "user" else AIMessage(content=m.content)


def load_context(conv_id: str, branch_id: str | None, db: Session):
    main = db.exec(
        select(Message).where(Message.conversation_id == conv_id,
                              Message.branch_id.is_(None))
        .order_by(Message.created_at)).all()

    if branch_id is None:
        return list(map(_to_lc, main))

    chain, cur = [], db.get(Branch, branch_id)
    while cur:
        chain.append(cur.id)
        cur = db.get(Branch, cur.parent_branch_id) if cur.parent_branch_id else None
    chain.reverse()

    ctx: list[Message] = []
    for bid in chain:
        br = db.get(Branch, bid)
        root_ts = db.get(Message, br.root_message_id).created_at
        if not ctx:
            ctx.extend([m for m in main if m.created_at <= root_ts])
        ctx.extend(
            db.exec(select(Message)
                    .where(Message.branch_id == bid)
                    .order_by(Message.created_at)).all())
    return list(map(_to_lc, ctx))
