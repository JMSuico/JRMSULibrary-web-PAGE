from __future__ import annotations

# [Layer: Infrastructure/AiProviders] -- provider_registry.py
import logging
import os
from typing import Any, Dict, List, Optional, Tuple

from Features.Infrastructure.AiProviders.ollama_provider import OllamaLLMProvider
from Features.Services.Interfaces.i_llm_provider import ILLMProviderStrategy

try:
    from Features.Infrastructure.AiProviders.claude_provider import ClaudeLLMProvider
except ImportError:
    ClaudeLLMProvider = None  # type: ignore[assignment, misc]

try:
    from django.core.cache import cache as _django_cache
except ImportError:
    _django_cache = None

logger = logging.getLogger(__name__)

AI_PROVIDER_MODE_CACHE_KEY = "rizal:ai_provider_mode"
DEFAULT_AI_PROVIDER_MODE = "claude_first"

MODE_ORDER_MAP: Dict[str, Tuple[str, ...]] = {
    "local_first": ("ollama", "claude"),
    "claude_first": ("claude", "ollama"),
    "local_only": ("ollama",),
    "claude_only": ("claude",),
}

_BUILTIN_PROVIDER_IDS = {"ollama", "claude"}

_PERMANENT_REASON_TOKENS = (
    "401",
    "402",
    "403",
    "auth",
    "expired",
    "invalid key",
    "invalid api key",
    "credit",
    "billing",
    "permission",
)


class LLMProviderRegistry:
    """
    Resolves configured LLM provider strategies in dynamic runtime order
    and manages Redis-backed circuit breakers for resilient failover.
    """

    def __init__(
        self,
        providers: Optional[List[ILLMProviderStrategy]] = None,
        ollama_provider: Optional[ILLMProviderStrategy] = None,
        claude_provider: Optional[ILLMProviderStrategy] = None,
        cache_backend: Any = None,
    ) -> None:
        self._cache = cache_backend if cache_backend is not None else _django_cache
        self._strategies: Dict[str, ILLMProviderStrategy] = {}

        if providers is not None:
            for strategy in providers:
                self._strategies[strategy.provider_id] = strategy
        else:
            ollama = ollama_provider if ollama_provider is not None else OllamaLLMProvider()
            self._strategies[ollama.provider_id] = ollama

            if claude_provider is not None:
                self._strategies[claude_provider.provider_id] = claude_provider
            elif ClaudeLLMProvider is not None:
                claude = ClaudeLLMProvider()
                self._strategies[claude.provider_id] = claude

    @staticmethod
    def _circuit_key(provider_id: str) -> str:
        return f"ai:circuit:{provider_id}:tripped"

    def _cache_get(self, key: str, default: Any = None) -> Any:
        if self._cache is None:
            return default
        try:
            return self._cache.get(key, default)
        except Exception:
            return default

    def _cache_set(self, key: str, value: Any, timeout: Optional[int] = None) -> None:
        if self._cache is None:
            return
        try:
            self._cache.set(key, value, timeout=timeout)
        except Exception as exc:
            logger.debug("LLMProviderRegistry cache set ignored (%s): %s", key, exc)

    def _cache_delete(self, key: str) -> None:
        if self._cache is None:
            return
        try:
            self._cache.delete(key)
        except Exception as exc:
            logger.debug("LLMProviderRegistry cache delete ignored (%s): %s", key, exc)

    def resolve_mode(self, mode_override: Optional[str] = None) -> str:
        if mode_override is not None:
            normalized = str(mode_override).strip().lower()
            if normalized in MODE_ORDER_MAP:
                return normalized

        cached_mode = self._cache_get(AI_PROVIDER_MODE_CACHE_KEY)
        if isinstance(cached_mode, str):
            normalized_cached = cached_mode.strip().lower()
            if normalized_cached in MODE_ORDER_MAP:
                return normalized_cached

        env_mode = str(os.environ.get("AI_PROVIDER_MODE", DEFAULT_AI_PROVIDER_MODE)).strip().lower()
        if env_mode in MODE_ORDER_MAP:
            return env_mode

        return DEFAULT_AI_PROVIDER_MODE

    def get_provider(self, provider_id: str) -> Optional[ILLMProviderStrategy]:
        return self._strategies.get(provider_id)

    def is_tripped(self, provider_id: str) -> bool:
        return bool(self._cache_get(self._circuit_key(provider_id)))

    def is_permanently_tripped(self, provider_id: str) -> bool:
        val = self._cache_get(self._circuit_key(provider_id))
        if not val:
            return False
        if isinstance(val, dict):
            if val.get("is_permanent_or_auth"):
                return True
            reason = str(val.get("reason", "") or "").lower()
            return any(tok in reason for tok in _PERMANENT_REASON_TOKENS)
        if isinstance(val, str):
            lowered = val.lower()
            return any(tok in lowered for tok in _PERMANENT_REASON_TOKENS)
        return False

    def trip_circuit(
        self,
        provider_id: str,
        retry_after_seconds: int = 60,
        reason: str = "",
        is_permanent_or_auth: Optional[bool] = None,
    ) -> None:
        ttl = max(1, int(retry_after_seconds))
        reason_str = str(reason or "")
        permanent = (
            bool(is_permanent_or_auth)
            if is_permanent_or_auth is not None
            else any(tok in reason_str.lower() for tok in _PERMANENT_REASON_TOKENS)
        )
        payload = {
            "tripped": True,
            "reason": reason_str,
            "retry_after_seconds": ttl,
            "is_permanent_or_auth": permanent,
        }
        self._cache_set(self._circuit_key(provider_id), payload, timeout=ttl)

    def clear_circuit(self, provider_id: str) -> None:
        self._cache_delete(self._circuit_key(provider_id))

    def is_claude_green_light(self) -> bool:
        claude = self._strategies.get("claude")
        return bool(
            claude is not None
            and claude.is_configured()
            and not self.is_tripped("claude")
        )

    def get_provider_status_summary(self) -> Dict[str, Any]:
        claude_strategy = self._strategies.get("claude")
        ollama_strategy = self._strategies.get("ollama")
        claude_configured = bool(claude_strategy is not None and claude_strategy.is_configured())
        ollama_configured = bool(ollama_strategy is not None and ollama_strategy.is_configured())
        claude_green = self.is_claude_green_light()
        ollama_healthy = bool(ollama_configured and not self.is_tripped("ollama"))
        return {
            "mode": self.resolve_mode(),
            "primary_provider": "claude" if claude_green else ("ollama" if ollama_healthy else "none"),
            "claude_configured": claude_configured,
            "claude_green_light": claude_green,
            "ollama_configured": ollama_configured,
            "ollama_healthy": ollama_healthy,
            "strategy_approach": "Speculative Parallel Hedging with Priority Preemption & Write-Behind Shadow Caching",
        }

    def get_ordered_strategies(
        self,
        mode_override: Optional[str] = None,
        include_tripped_fallback: bool = True,
    ) -> List[ILLMProviderStrategy]:
        mode = self.resolve_mode(mode_override=mode_override)
        ordered_ids = MODE_ORDER_MAP.get(mode, MODE_ORDER_MAP[DEFAULT_AI_PROVIDER_MODE])

        configured: List[ILLMProviderStrategy] = []
        for pid in ordered_ids:
            strategy = self._strategies.get(pid)
            if strategy is not None and strategy.is_configured():
                configured.append(strategy)

        for pid, strategy in self._strategies.items():
            if pid not in ordered_ids and pid not in _BUILTIN_PROVIDER_IDS:
                if strategy is not None and strategy.is_configured():
                    configured.append(strategy)

        healthy: List[ILLMProviderStrategy] = []
        tripped: List[ILLMProviderStrategy] = []
        for strategy in configured:
            if self.is_tripped(strategy.provider_id):
                tripped.append(strategy)
            else:
                healthy.append(strategy)

        if healthy:
            return healthy

        if not include_tripped_fallback or not tripped:
            return []

        return [s for s in tripped if not self.is_permanently_tripped(s.provider_id)]
