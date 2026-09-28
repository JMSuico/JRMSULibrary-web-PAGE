# [Layer: Services/Interfaces] — i_ai_service.py
from abc import ABC, abstractmethod
from typing import Any, Optional, Generator

class IAIService(ABC):
    @abstractmethod
    def generate_chat_response(self, user_message: str, chat_history: Optional[list] = None, seen_answers: Optional[list] = None) -> str:
        pass

    @abstractmethod
    def generate_chat_stream(self, user_message: str, chat_history: Optional[list] = None, seen_answers: Optional[list] = None) -> Generator[str, None, None]:
        pass

    @abstractmethod
    def generate_email_reply_draft(self, message_data: dict) -> str:
        pass
