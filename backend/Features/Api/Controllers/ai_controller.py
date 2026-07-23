# [Layer: Api/Controllers] — ai_controller.py
# POST /api/ai/chat/ — receive and dispatch AI chat requests to Ollama

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from rest_framework.throttling import ScopedRateThrottle
from Features.Services.Implementations.ai_service import AIService


class AIViewSet(viewsets.ViewSet):
    """
    ViewSet for handling AI Chatbot interactions.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'chat' # Prevent abuse of the AI generation endpoint

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
            ]
        }
        """
        user_message = request.data.get('message', '').strip()
        chat_history = request.data.get('history', [])

        if not user_message:
            return Response({'error': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if len(user_message) > 500:
            return Response({'error': 'Message exceeds the maximum limit of 500 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not isinstance(chat_history, list):
            chat_history = []
        else:
            # Validate history array keys and prevent prompt injection keywords
            validated_history = []
            for item in chat_history:
                if isinstance(item, dict) and 'sender' in item and 'text' in item:
                    # Sanitize text
                    import bleach
                    clean_text = bleach.clean(str(item.get('text', '')))
                    sender = str(item.get('sender', 'user'))
                    if sender not in ['user', 'rizal']:
                        sender = 'user'
                    validated_history.append({'sender': sender, 'text': clean_text})
            chat_history = validated_history

        # Return stream response
        def event_stream():
            try:
                for chunk in self.service.generate_chat_stream(user_message, chat_history):
                    yield chunk
            except Exception as e:
                print(f"Ollama AI Error: {e}")
                yield "I'm currently experiencing high load or connection issues. Please try asking again in a few moments."

        return StreamingHttpResponse(event_stream(), content_type='text/plain')
