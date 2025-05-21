from abc import ABC, abstractmethod
from typing import AsyncGenerator


class BaseLLM(ABC):
    @abstractmethod
    async def stream_chat(self, message: str) -> AsyncGenerator[str, None]:
        pass
