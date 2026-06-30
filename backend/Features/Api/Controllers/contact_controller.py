# [Layer: Api/Controllers] — contact_controller.py
# POST /api/contact — receive and dispatch contact form submissions.
# Delegates ALL business logic to ContactService. No direct ORM access.

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from Features.Api.Serializers.contact_serializer import ContactMessageSerializer
from Features.Repositories.Implementations.contact_repository import ContactRepository
from Features.Services.Implementations.contact_service import ContactService


class ContactMessageViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ContactService()

    def list(self, request):
        messages = self.service.get_all_messages()
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = self.service.submit_contact(serializer.validated_data)
            return Response(
                ContactMessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            message = self.service.repository.get_by_id(pk)
            return Response(ContactMessageSerializer(message).data)
        except Exception:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, pk=None):
        """Mark a message as read (legacy support) or update status."""
        try:
            status_val = request.data.get('status')
            if status_val:
                message = self.service.update_message_status(pk, status_val)
            else:
                message = self.service.mark_message_read(pk)
            return Response(ContactMessageSerializer(message).data)
        except Exception:
            return Response(status=status.HTTP_404_NOT_FOUND)

