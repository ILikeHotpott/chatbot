from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage


def get_openai_streaming_model(model_name: str):
    return ChatOpenAI(
        model=model_name,
        streaming=True,
        temperature=0.7,
    )
