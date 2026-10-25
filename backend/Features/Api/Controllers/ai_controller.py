# [Layer: Api/Controllers] — ai_controller.py
# POST /api/ai/chat/ — streaming AI chat requests with Daphne ASGI async bridge

import asyncio
import bleach
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from rest_framework.throttling import ScopedRateThrottle
from Features.Services.Implementations.ai_service import AIService


class AIViewSet(viewsets.ViewSet):
    """
    ViewSet for handling AI Chatbot interactions with Daphne ASGI streaming responses.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'chat'  # Prevent abuse of the AI generation endpoint

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = AIService()

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
            
        if len(user_message) > 500:
            return Response({'error': 'Message exceeds the maximum limit of 500 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            
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

        # Daphne ASGI True Async Generator to prevent response buffering
        async def async_event_stream():
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = asyncio.get_event_loop()
            queue = asyncio.Queue()

            def sync_worker():
                try:
                    for chunk in self.service.generate_chat_stream(user_message, validated_history, seen_answers):
                        if chunk:
                            loop.call_soon_threadsafe(queue.put_nowait, chunk)
                except Exception as e:
                    loop.call_soon_threadsafe(queue.put_nowait, f"\n[AI Error: {str(e)}]")
                finally:
                    loop.call_soon_threadsafe(queue.put_nowait, None)

            # Run Ollama blocking generator in thread pool
            loop.run_in_executor(None, sync_worker)

            try:
                while True:
                    chunk = await queue.get()
                    if chunk is None:
                        break
                    yield chunk.encode('utf-8') if isinstance(chunk, str) else chunk
            except (asyncio.CancelledError, GeneratorExit):
                pass

        response = StreamingHttpResponse(async_event_stream(), content_type='text/plain; charset=utf-8')
        response['X-Accel-Buffering'] = 'no'
        response['Cache-Control'] = 'no-cache, no-transform'
        return response

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

        try:
            draft = self.service.generate_email_reply_draft(message_data)
            return Response({'draft': draft}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to generate draft: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
