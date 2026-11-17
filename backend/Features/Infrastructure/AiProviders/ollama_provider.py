from __future__ import annotations

# [Layer: Infrastructure/AiProviders] -- ollama_provider.py
import json
import logging
import os
from typing import Any, Dict, Generator, List, Optional

import requests

from Features.Services.Interfaces.i_llm_provider import (
    ILLMProviderStrategy,
    LLMGenerationConfig,
    ProviderUnavailableError,
)

logger = logging.getLogger(__name__)


class OllamaLLMProvider(ILLMProviderStrategy):
    """Local Ollama chat strategy using NDJSON streaming and HTTP connection pooling."""

    DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
    DEFAULT_OLLAMA_MODEL = "qwen2.5:0.5b"

    def __init__(
        self,
        ollama_url: Optional[str] = None,
        model_name: Optional[str] = None,
    ) -> None:
        raw_url = (
            ollama_url
            if ollama_url is not None
            else os.environ.get("OLLAMA_URL", self.DEFAULT_OLLAMA_URL)
        )
        raw_model = (
            model_name
            if model_name is not None
            else os.environ.get("OLLAMA_MODEL", self.DEFAULT_OLLAMA_MODEL)
        )
        self.ollama_url = str(raw_url or "").strip()
        self.model_name = str(raw_model or "").strip() or self.DEFAULT_OLLAMA_MODEL

    @property
    def provider_id(self) -> str:
        return "ollama"

    def is_configured(self) -> bool:
        return bool(self.ollama_url)

    @staticmethod
    def _build_options(config: LLMGenerationConfig) -> Dict[str, Any]:
        options: Dict[str, Any] = {
            "num_predict": max(1, int(config.max_tokens)),
            "temperature": float(config.temperature),
        }
        if config.top_k is not None:
            options["top_k"] = int(config.top_k)
        if config.top_p is not None:
            options["top_p"] = float(config.top_p)
        if config.repeat_penalty is not None:
            options["repeat_penalty"] = float(config.repeat_penalty)
        if config.num_ctx is not None:
            options["num_ctx"] = int(config.num_ctx)
        if config.num_thread is not None:
            options["num_thread"] = int(config.num_thread)
        return options

    def _build_payload(
        self,
        messages: List[Dict[str, str]],
        config: LLMGenerationConfig,
        stream: bool,
    ) -> Dict[str, Any]:
        return {
            "model": self.model_name,
            "messages": list(messages),
            "stream": stream,
            "keep_alive": -1,
            "options": self._build_options(config),
        }

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
                message="Ollama URL is not configured.",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            )

        client = session if session is not None else requests
        timeout = (
            float(config.connect_timeout_seconds),
            float(config.read_timeout_seconds),
        )
        try:
            post_kwargs: Dict[str, Any] = {
                "json": payload,
                "timeout": timeout,
            }
            if stream:
                post_kwargs["stream"] = True
            response = client.post(
                self.ollama_url,
                **post_kwargs,
            )
            response.raise_for_status()
            return response
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as exc:
            logger.warning("Ollama connection/timeout failure: %s", exc)
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Ollama unreachable or timed out: {exc}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            ) from exc
        except requests.exceptions.HTTPError as exc:
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            logger.warning("Ollama HTTP error status=%s: %s", status_code, exc)
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Ollama returned HTTP error {status_code}: {exc}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
                status_code=status_code,
            ) from exc
        except requests.exceptions.RequestException as exc:
            logger.warning("Ollama request failure: %s", exc)
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Ollama request error: {exc}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            ) from exc

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
                if not line:
                    continue
                try:
                    data = json.loads(line)
                except ValueError:
                    continue
                if not isinstance(data, dict):
                    continue
                if data.get("error"):
                    raise ProviderUnavailableError(
                        provider_id=self.provider_id,
                        message=f"Ollama stream error: {data.get('error')}",
                        is_permanent_or_auth=False,
                        retry_after_seconds=60,
                    )
                msg = data.get("message")
                if isinstance(msg, dict):
                    token = msg.get("content")
                    if isinstance(token, str) and token:
                        yield token
                if data.get("done", False):
                    break
        except ProviderUnavailableError:
            raise
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as exc:
            logger.warning("Ollama stream interrupted: %s", exc)
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Ollama stream interrupted: {exc}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            ) from exc
        except requests.exceptions.RequestException as exc:
            logger.warning("Ollama stream request failure: %s", exc)
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Ollama stream request error: {exc}",
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
                message=f"Ollama returned invalid JSON: {exc}",
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
                message="Ollama returned unexpected non-object JSON payload.",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            )
        if data.get("error"):
            raise ProviderUnavailableError(
                provider_id=self.provider_id,
                message=f"Ollama error: {data.get('error')}",
                is_permanent_or_auth=False,
                retry_after_seconds=60,
            )

        msg = data.get("message")
        if isinstance(msg, dict):
            content = msg.get("content")
            if isinstance(content, str):
                return content
        return ""
