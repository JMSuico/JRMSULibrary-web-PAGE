# [Layer: Api/Controllers] — feedback_controller.py
# POST /api/feedback — receive and dispatch visitor feedback.
# Delegates ALL business logic to FeedbackService. No direct ORM access.

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from Features.Api.Serializers.feedback_serializer import FeedbackSerializer
from Features.Services.Implementations.feedback_service import FeedbackService


class FeedbackViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = FeedbackService()

    def list(self, request):
        feedback_list = self.service.get_all_feedback()
        serializer = FeedbackSerializer(feedback_list, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            feedback = self.service.submit_feedback(serializer.validated_data)
            return Response(
                FeedbackSerializer(feedback).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            feedback = self.service.repository.get_by_id(pk)
            return Response(FeedbackSerializer(feedback).data)
        except Exception:
            return Response(status=status.HTTP_404_NOT_FOUND)
