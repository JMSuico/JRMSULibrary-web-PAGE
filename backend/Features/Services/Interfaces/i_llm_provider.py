from __future__ import annotations

# [Layer: Services/Interfaces] -- i_llm_provider.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, Generator, List, Optional


class ProviderUnavailableError(Exception):
    """Raised when an LLM provider fails, times out, or rejects authentication."""

    def __init__(
        self,
        provider_id: str,
        message: str,
        is_permanent_or_auth: bool = False,
        retry_after_seconds: int = 60,
        status_code: Optional[int] = None,
    ) -> None:
        self.provider_id = provider_id
        self.message = message
        self.is_permanent_or_auth = bool(is_permanent_or_auth)
        self.retry_after_seconds = max(1, int(retry_after_seconds))
        self.status_code = status_code
        super().__init__(f"[{provider_id}] {message}")


@dataclass(frozen=True)
class LLMGenerationConfig:
    """Immutable generation parameters shared across LLM provider strategies."""

    max_tokens: int = 550
    temperature: float = 0.2
    top_k: Optional[int] = 20
    top_p: Optional[float] = 0.85
    repeat_penalty: Optional[float] = 1.15
    num_ctx: Optional[int] = 2048
    num_thread: Optional[int] = 4
    connect_timeout_seconds: float = 6.0
    read_timeout_seconds: float = 60.0


class ILLMProviderStrategy(ABC):
    """Strategy interface (OCP) for pluggable LLM chat providers."""

    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Returns the unique lowercase identifier for this provider."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True when this provider has valid configuration to serve requests."""
        pass

    @abstractmethod
    def stream_chat(
        self,
        messages: List[Dict[str, str]],
        config: LLMGenerationConfig,
        session: Any,
    ) -> Generator[str, None, None]:
        """Streams response text deltas for a conversation message list."""
        pass

    @abstractmethod
    def complete_chat(
        self,
        messages: List[Dict[str, str]],
        config: LLMGenerationConfig,
        session: Any,
    ) -> str:
        """Executes a non-streaming chat completion and returns the response text."""
        pass
