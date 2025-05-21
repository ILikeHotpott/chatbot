from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage


def get_gemini_streaming_model(model_name: str):
    return ChatGoogleGenerativeAI(
        model=model_name,
        streaming=True,
        temperature=0.7,
    )
