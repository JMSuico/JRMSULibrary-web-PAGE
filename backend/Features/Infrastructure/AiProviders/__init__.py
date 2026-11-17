from __future__ import annotations

# [Layer: Infrastructure/AiProviders] -- __init__.py
from .ollama_provider import OllamaLLMProvider
from .provider_registry import LLMProviderRegistry

try:
    from .claude_provider import ClaudeLLMProvider
except ImportError:
    ClaudeLLMProvider = None  # type: ignore[assignment, misc]

__all__ = [
    "OllamaLLMProvider",
    "ClaudeLLMProvider",
    "LLMProviderRegistry",
]
