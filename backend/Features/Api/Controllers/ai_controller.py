# [Layer: Api/Controllers] — ai_controller.py
# POST /api/ai/chat/ — streaming AI chat requests with Daphne ASGI async bridge

import asyncio
import hashlib
import re
import time
import bleach
from typing import Optional
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import close_old_connections, connection
from django.http import StreamingHttpResponse
from Features.Services.Implementations.ai_service import AIService


class AIViewSet(viewsets.ViewSet):
    """
    ViewSet for handling AI Chatbot interactions with Daphne ASGI streaming responses.
    """
    permission_classes = [permissions.AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = AIService()

    @staticmethod
    def _extract_explicit_idempotency_key(request) -> Optional[str]:
        raw_key = None
        headers = getattr(request, 'headers', None)
        if headers is not None and hasattr(headers, 'get'):
            raw_key = headers.get('X-Idempotency-Key') or headers.get('x-idempotency-key')
        if not raw_key:
            meta = getattr(request, 'META', None)
            if isinstance(meta, dict):
                raw_key = meta.get('HTTP_X_IDEMPOTENCY_KEY')
        if not raw_key:
            data = getattr(request, 'data', None)
            if hasattr(data, 'get'):
                raw_key = data.get('idempotency_key')
        if not raw_key:
            return None
        cleaned = re.sub(r'[^a-zA-Z0-9_.:-]', '', str(raw_key).strip())[:128]
        return cleaned or None

    @staticmethod
    def _resolve_client_identifier(request) -> str:
        session = getattr(request, 'session', None)
        session_key = getattr(session, 'session_key', None) if session is not None else None
        if session_key:
            return str(session_key)

        headers = getattr(request, 'headers', None)
        forwarded_for = headers.get('X-Forwarded-For') if (headers is not None and hasattr(headers, 'get')) else None
        meta = getattr(request, 'META', None) or {}
        if not forwarded_for and isinstance(meta, dict):
            forwarded_for = meta.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            return str(forwarded_for).split(',')[0].strip() or 'anon'
        if isinstance(meta, dict) and meta.get('REMOTE_ADDR'):
            return str(meta.get('REMOTE_ADDR'))
        return 'anon'

    @classmethod
    def _derive_chat_idempotency_key(cls, request, user_message: str, validated_history: list) -> str:
        explicit = cls._extract_explicit_idempotency_key(request)
        if explicit:
            return explicit
        client_ip_or_session = cls._resolve_client_identifier(request)
        normalized_message = re.sub(r'\s+', ' ', user_message.lower()).strip()
        last_history_turn = (
            f"{validated_history[-1].get('sender', '')}:{validated_history[-1].get('text', '')}"
            if validated_history
            else ""
        )
        window_bucket = int(time.time() // 10)
        raw_material = f"{client_ip_or_session}|{normalized_message}|{last_history_turn}|{window_bucket}"
        return hashlib.sha256(raw_material.encode('utf-8')).hexdigest()

    @action(detail=False, methods=['post'], url_path='chat')
    def chat(self, request):
        """
        POST /api/ai/chat/
        Body: 
        {
            "message": "What time does the library open?",
            "history": [
                {"sender": "rizal", "text": "Hi! I am Rizal..."},
                {"sender": "user", "text": "Hello"}
            ],
            "seen_answers": ["Operating Hours: Monday to Friday..."]
        }
        """
        raw_message = request.data.get('message', '')
        user_message = bleach.clean(str(raw_message)).strip()
        chat_history = request.data.get('history', [])

        if not user_message:
            return Response({'error': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if len(user_message) > 4000:
            return Response({'error': 'Message exceeds the maximum limit of 4000 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            
        validated_history = []
        if isinstance(chat_history, list):
            for item in chat_history[-10:]:
                if isinstance(item, dict) and 'sender' in item and 'text' in item:
                    clean_text = bleach.clean(str(item.get('text', ''))).strip()
                    sender = str(item.get('sender', 'user')).lower().strip()
                    if sender not in ['user', 'rizal']:
                        sender = 'user'
                    validated_history.append({'sender': sender, 'text': clean_text})

        seen_answers = request.data.get('seen_answers', [])
        if not isinstance(seen_answers, list):
            seen_answers = []
        else:
            seen_answers = [bleach.clean(str(ans)).strip() for ans in seen_answers[:20] if ans]

        idempotency_key = self._derive_chat_idempotency_key(request, user_message, validated_history)

        django_request = getattr(request, '_request', request)
        is_asgi_request = hasattr(django_request, 'scope') or django_request.__class__.__name__ == 'ASGIRequest'

        def sync_event_stream():
            try:
                close_old_connections()
                for chunk in self.service.generate_chat_stream(
                    user_message,
                    validated_history,
                    seen_answers,
                    idempotency_key=idempotency_key,
                ):
                    if chunk:
                        yield chunk.encode('utf-8') if isinstance(chunk, str) else chunk
            except Exception as e:
                yield f"\n[AI Error: {str(e)}]".encode('utf-8')
            finally:
                connection.close()

        # Daphne ASGI True Async Generator to prevent response buffering
        async def async_event_stream():
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = asyncio.get_event_loop()
            queue = asyncio.Queue()

            def sync_worker():
                try:
                    close_old_connections()
                    for chunk in self.service.generate_chat_stream(
                        user_message,
                        validated_history,
                        seen_answers,
                        idempotency_key=idempotency_key,
                    ):
                        if chunk:
                            loop.call_soon_threadsafe(queue.put_nowait, chunk)
                except Exception as e:
                    loop.call_soon_threadsafe(queue.put_nowait, f"\n[AI Error: {str(e)}]")
                finally:
                    try:
                        connection.close()
                    finally:
                        loop.call_soon_threadsafe(queue.put_nowait, None)

            # Run blocking LLM generator in thread pool
            loop.run_in_executor(None, sync_worker)

            try:
                while True:
                    chunk = await queue.get()
                    if chunk is None:
                        break
                    yield chunk.encode('utf-8') if isinstance(chunk, str) else chunk
            except (asyncio.CancelledError, GeneratorExit):
                pass

        stream_body = async_event_stream() if is_asgi_request else sync_event_stream()
        response = StreamingHttpResponse(stream_body, content_type='text/plain; charset=utf-8')
        response['X-Accel-Buffering'] = 'no'
        response['Cache-Control'] = 'no-cache, no-transform'
        return response

    @action(detail=False, methods=['get'], url_path='status', permission_classes=[permissions.AllowAny])
    def provider_status(self, request):
        return Response(self.service.get_ai_provider_status(), status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='draft-reply', permission_classes=[permissions.IsAuthenticated])
    def draft_reply(self, request):
        """
        POST /api/ai/draft-reply/
        Generates an AI-assisted draft email reply for library staff.
        """
        message_data = {
            'sender_name': bleach.clean(str(request.data.get('sender_name', ''))).strip(),
            'sender_email': bleach.clean(str(request.data.get('sender_email', ''))).strip(),
            'subject': bleach.clean(str(request.data.get('subject', ''))).strip(),
            'message_text': bleach.clean(str(request.data.get('message_text', ''))).strip(),
            'inquiry_type': bleach.clean(str(request.data.get('inquiry_type', 'general'))).strip()
        }
        idempotency_key = self._extract_explicit_idempotency_key(request)

        try:
            if idempotency_key:
                draft = self.service.generate_email_reply_draft(message_data, idempotency_key=idempotency_key)
            else:
                draft = self.service.generate_email_reply_draft(message_data)
            return Response({'draft': draft}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to generate draft: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
