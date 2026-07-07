# [Layer: Api/Controllers] — ai_controller.py
# POST /api/ai/chat/ — receive and dispatch AI chat requests to Ollama

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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

        # Generate response from Ollama
        response_text = self.service.generate_chat_response(user_message, chat_history)

        return Response({
            'response': response_text
        }, status=status.HTTP_200_OK)
