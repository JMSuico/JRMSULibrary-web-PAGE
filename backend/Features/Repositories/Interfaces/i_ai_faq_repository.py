# [Layer: Repositories/Interfaces] — i_ai_faq_repository.py
from abc import ABC, abstractmethod
from typing import Any, Optional, List

class IAIFaqRepository(ABC):
    @abstractmethod
    def get_all(self) -> Any:
        pass

    @abstractmethod
    def find_by_question_exact(self, question_text: str) -> Optional[Any]:
        pass

    @abstractmethod
    def create(self, question: str, answers: list) -> Any:
        pass

    @abstractmethod
    def update_answers(self, faq_entry: Any, answer: str) -> None:
        pass

    @abstractmethod
    def update_last_accessed(self, faq_entry: Any) -> None:
        pass
