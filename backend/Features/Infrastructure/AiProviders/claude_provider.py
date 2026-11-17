from __future__ import annotations

# [Layer: Infrastructure/AiProviders] -- claude_provider.py
# Optional, self-contained Anthropic Messages API provider plugin.
import json
import logging
import os
from typing import Any, Dict, Generator, List, Optional, Tuple

import requests
from requests.adapters import HTTPAdapter

from Features.Services.Interfaces.i_llm_provider import (
    ILLMProviderStrategy,
    LLMGenerationConfig,
    ProviderUnavailableError,
)

logger = logging.getLogger(__name__)


class ClaudeLLMProvider(ILLMProviderStrategy):
    """Anthropic Claude Messages API strategy with SSE streaming and auth fault detection."""

    DEFAULT_MODEL = "claude-haiku-4-5"
    DEFAULT_TIMEOUT = 45.0
    DEFAULT_CONNECT_TIMEOUT = 2.5
    DEFAULT_API_URL = "https://api.anthropic.com/v1/messages"
    DEFAULT_API_VERSION = "2023-06-01"

    _PLACEHOLDER_PREFIXES = ("change_me_", "your_", "placeholder", "<")
    _AUTH_OR_BILLING_STATUSES = {401, 402, 403}
    _AUTH_OR_BILLING_ERROR_TYPES = {
        "authentication_error",
        "permission_error",
        "billing_error",
    }
    _AUTH_OR_BILLING_KEYWORDS = (
        "invalid x-api-key",
        "invalid api key",
        "api key expired",
        "expired key",
        "credit balance",
        "insufficient credit",
        "insufficient_quota",
        "billing",
        "account is disabled",
        "unauthorized",
    )

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
        api_url: Optional[str] = None,
        api_version: Optional[str] = None,
        connect_timeout_seconds: Optional[float] = None,
    ) -> None:
        raw_key = (
            api_key if api_key is not None else os.environ.get("ANTHROPIC_API_KEY", "")
        )
        raw_model = (
            model_name
            if model_name is not None
            else os.environ.get("AI_CLAUDE_MODEL", self.DEFAULT_MODEL)
        )
        raw_url = (
            api_url
            if api_url is not None
            else os.environ.get("ANTHROPIC_API_URL", self.DEFAULT_API_URL)
        )
        raw_version = (
            api_version
            if api_version is not None
            else os.environ.get("ANTHROPIC_VERSION", self.DEFAULT_API_VERSION)
        )

        self.api_key = str(raw_key or "").strip()
        self.model_name = str(raw_model or "").strip() or self.DEFAULT_MODEL
        self.api_url = str(raw_url or "").strip()
        self.api_version = str(raw_version or "").strip() or self.DEFAULT_API_VERSION
        self.timeout_seconds = self._resolve_timeout(timeout_seconds)
        self.connect_timeout_seconds = self._resolve_connect_timeout(connect_timeout_seconds)
        self._session = self._create_pooled_session()

    @staticmethod
    def _create_pooled_session() -> requests.Session:
        """Creates a persistent HTTP keep-alive session for low-latency Cloud calls."""
        sess = requests.Session()
        adapter = HTTPAdapter(pool_connections=4, pool_maxsize=8)
        sess.mount("https://", adapter)
        sess.mount("http://", adapter)
        sess.headers.update({"Connection": "keep-alive"})
        return sess

    @property
    def session(self) -> requests.Session:
        return self._session

    @classmethod
    def _resolve_timeout(cls, override: Optional[float]) -> float:
        raw = override if override is not None else os.environ.get("AI_CLAUDE_TIMEOUT", cls.DEFAULT_TIMEOUT)
        try:
            parsed = float(raw)
            return parsed if parsed > 0 else cls.DEFAULT_TIMEOUT
        except (TypeError, ValueError):
            return cls.DEFAULT_TIMEOUT

    @classmethod
    def _resolve_connect_timeout(cls, override: Optional[float]) -> float:
        raw = (
            override
            if override is not None
            else os.environ.get("AI_CLAUDE_CONNECT_TIMEOUT", cls.DEFAULT_CONNECT_TIMEOUT)
        )
        try:
            parsed = float(raw)
            return parsed if parsed > 0 else cls.DEFAULT_CONNECT_TIMEOUT
        except (TypeError, ValueError):
            return cls.DEFAULT_CONNECT_TIMEOUT

    @property
    def provider_id(self) -> str:
        return "claude"

    def is_configured(self) -> bool:
        if not self.api_key or not self.api_url:
            return False
        lowered = self.api_key.lower()
        if any(lowered.startswith(prefix) for prefix in self._PLACEHOLDER_PREFIXES):
            return False
        if "change_me_" in lowered or "your_" in lowered:
            return False
        return True

    def _redact_secret(self, text: str) -> str:
        if self.api_key and self.api_key in text:
            return text.replace(self.api_key, "[REDACTED]")
        return text

    @staticmethod
    def _prepare_messages(
        messages: List[Dict[str, str]],
    ) -> Tuple[str, List[Dict[str, str]]]:
        """
        Separates system messages into a top-level string and normalizes alternating
        user/assistant turns so Anthropic turn-order validation always passes.
        """
        system_parts: List[str] = []
        turns: List[Dict[str, str]] = []

        for msg in messages:
            if not isinstance(msg, dict):
                continue
            raw_role = str(msg.get("role", "user")).strip().lower()
            content = str(msg.get("content", "") or "").strip()
            if not content:
                continue

            if raw_role == "system":
                system_parts.append(content)
                continue

            normalized_role = "assistant" if raw_role == "assistant" else "user"
            if turns and turns[-1]["role"] == normalized_role:
                turns[-1]["content"] = f"{turns[-1]['content']}\n\n{content}"
            else:
                turns.append({"role": normalized_role, "content": content})

        while turns and turns[0]["role"] != "user":
            if any(t["role"] == "user" for t in turns[1:]):
                turns.pop(0)
            else:
                turns[0] = {"role": "user", "content": turns[0]["content"]}

        if not turns:
            turns.append({"role": "user", "content": "Hello."})

        return "\n\n".join(system_parts), turns

    def _build_payload(
        self,
        messages: List[Dict[str, str]],
        config: LLMGenerationConfig,
        stream: bool,
    ) -> Dict[str, Any]:
        system_prompt, normalized_turns = self._prepare_messages(messages)
        payload: Dict[str, Any] = {
            "model": self.model_name,
            "max_tokens": max(1, int(config.max_tokens)),
            "temperature": max(0.0, min(1.0, float(config.temperature))),
            "messages": normalized_turns,
            "stream": stream,
        }
        if system_prompt:
            payload["system"] = system_prompt
        return payload

    def _build_headers(self, stream: bool) -> Dict[str, str]:
        return {
            "x-api-key": self.api_key,
            "anthropic-version": self.api_version,
            "content-type": "application/json",
            "accept": "text/event-stream" if stream else "application/json",
        }

    def _is_auth_or_billing_error(
        self,
        status_code: Optional[int],
        error_type: str = "",
        error_message: str = "",
    ) -> bool:
        if status_code in self._AUTH_OR_BILLING_STATUSES:
            return True
        if error_type.strip().lower() in self._AUTH_OR_BILLING_ERROR_TYPES:
            return True
        combined = f"{error_type} {error_message}".lower()
        return any(kw in combined for kw in self._AUTH_OR_BILLING_KEYWORDS)

    @staticmethod
    def _extract_error_details(response: Any) -> Tuple[str, str]:
        try:
            body = response.json()
        except Exception:
            raw_text = str(getattr(response, "text", "") or "").strip()
            return "", raw_text[:300]

        if isinstance(body, dict):
            err_obj = body.get("error")
            if isinstance(err_obj, dict):
                return (
                    str(err_obj.get("type", "") or ""),
                    str(err_obj.get("message", "") or ""),
                )
            if isinstance(err_obj, str):
                return "", err_obj
            return str(body.get("type", "") or ""), str(body.get("message", "") or "")
        return "", ""

    def _raise_for_error_response(self, response: Any) -> None:
        status_code = getattr(response, "status_code", None)
        err_type, err_msg = self._extract_error_details(response)
        is_auth = self._is_auth_or_billing_error(status_code, err_type, err_msg)
        retry_after = 900 if is_auth else 60
        detail = self._redact_secret(err_msg or err_type or f"HTTP {status_code}")
        logger.warning(
            "Claude API error status=%s auth_or_billing=%s detail=%s",
            status_code,
            is_auth,
            detail,
        )
        raise ProviderUnavailableError(
            provider_id=self.provider_id,
            message=f"Claude API error (status {status_code}): {detail}",
            is_permanent_or_auth=is_auth,
            retry_after_seconds=retry_after,
            status_code=status_code,
        )

    def _post(
        self,
        payload: Dict[str, Any],
        config: LLMGenerationConfig,
        session: Any,
        stream: bool,
    ) -> Any:
        if not self.is_configured():
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message="Claude API key is missing or uses a placeholder value.",
                is_permanent_or_auth=True,
                retry_after_seconds=900,
            )

        client = session if session is not None else self._session
        read_timeout = (
            min(float(config.read_timeout_seconds), self.timeout_seconds)
            if config.read_timeout_seconds and config.read_timeout_seconds > 0
            else self.timeout_seconds
        )
        cfg_connect = float(config.connect_timeout_seconds or 0.0)
        connect_timeout = (
            min(cfg_connect, self.connect_timeout_seconds)
            if cfg_connect > 0
            else self.connect_timeout_seconds
        )
        timeout = (connect_timeout, read_timeout)

        try:
            response = client.post(
                self.api_url,
                headers=self._build_headers(stream=stream),
                json=payload,
                stream=stream,
                timeout=timeout,
            )
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as exc:
            safe_err = self._redact_secret(str(exc))
            logger.warning("Claude connection/timeout failure: %s", safe_err)
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Claude unreachable or timed out: {safe_err}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            ) from exc
        except requests.exceptions.RequestException as exc:
            safe_err = self._redact_secret(str(exc))
            logger.warning("Claude request failure: %s", safe_err)
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Claude request error: {safe_err}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            ) from exc

        status_code = getattr(response, "status_code", 200)
        if not isinstance(status_code, int) or status_code < 200 or status_code >= 300:
            try:
                self._raise_for_error_response(response)
            finally:
                close_fn = getattr(response, "close", None)
                if callable(close_fn):
                    try:
                        close_fn()
                    except Exception:
                        pass

        return response

    def stream_chat(
        self,
        messages: List[Dict[str, str]],
        config: LLMGenerationConfig,
        session: Any,
    ) -> Generator[str, None, None]:
        payload = self._build_payload(messages, config, stream=True)
        response = self._post(payload, config, session, stream=True)
        try:
            for raw_line in response.iter_lines():
                if not raw_line:
                    continue
                line = (
                    raw_line.decode("utf-8", errors="replace")
                    if isinstance(raw_line, bytes)
                    else str(raw_line)
                ).strip()
                if not line or line.startswith(":") or not line.startswith("data:"):
                    continue

                data_str = line[5:].strip()
                if not data_str or data_str == "[DONE]":
                    continue

                try:
                    event = json.loads(data_str)
                except ValueError:
                    continue
                if not isinstance(event, dict):
                    continue

                event_type = event.get("type")
                if event_type == "content_block_delta":
                    delta = event.get("delta")
                    if isinstance(delta, dict) and delta.get("type") == "text_delta":
                        text = delta.get("text")
                        if isinstance(text, str) and text:
                            yield text
                elif event_type == "error":
                    err_obj = event.get("error") if isinstance(event.get("error"), dict) else {}
                    err_type = str(err_obj.get("type", "") or "")
                    err_msg = self._redact_secret(str(err_obj.get("message", "") or "Claude stream error"))
                    is_auth = self._is_auth_or_billing_error(None, err_type, err_msg)
                    raise ProviderUnavailableError(
                        provider_id=self.provider_id,
                        message=f"Claude stream error: {err_msg}",
                        is_permanent_or_auth=is_auth,
                        retry_after_seconds=900 if is_auth else 60,
                    )
                elif event_type == "message_stop":
                    break
        except ProviderUnavailableError:
            raise
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as exc:
            safe_err = self._redact_secret(str(exc))
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Claude stream interrupted: {safe_err}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            ) from exc
        except requests.exceptions.RequestException as exc:
            safe_err = self._redact_secret(str(exc))
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Claude stream request error: {safe_err}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            ) from exc
        finally:
            close_fn = getattr(response, "close", None)
            if callable(close_fn):
                try:
                    close_fn()
                except Exception:
                    pass

    def complete_chat(
        self,
        messages: List[Dict[str, str]],
        config: LLMGenerationConfig,
        session: Any,
    ) -> str:
        payload = self._build_payload(messages, config, stream=False)
        response = self._post(payload, config, session, stream=False)
        try:
            data = response.json()
        except ValueError as exc:
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Claude returned invalid JSON: {self._redact_secret(str(exc))}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            ) from exc
        finally:
            close_fn = getattr(response, "close", None)
            if callable(close_fn):
                try:
                    close_fn()
                except Exception:
                    pass

        if not isinstance(data, dict):
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message="Claude returned unexpected non-object JSON payload.",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            )

        if data.get("type") == "error":
            err_obj = data.get("error") if isinstance(data.get("error"), dict) else {}
            err_type = str(err_obj.get("type", "") or "")
            err_msg = self._redact_secret(str(err_obj.get("message", "") or "Claude API error"))
            is_auth = self._is_auth_or_billing_error(None, err_type, err_msg)
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Claude completion error: {err_msg}",
                is_permanent_or_auth=is_auth,
                retry_after_seconds=900 if is_auth else 60,
            )

        content_blocks = data.get("content")
        if not isinstance(content_blocks, list):
            return ""

        parts: List[str] = []
        for block in content_blocks:
            if isinstance(block, dict) and block.get("type") == "text":
                text = block.get("text")
                if isinstance(text, str) and text:
                    parts.append(text)
        return "".join(parts)
