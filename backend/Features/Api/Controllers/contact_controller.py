# [Layer: Api/Controllers] — contact_controller.py
# POST /api/contact — receive and dispatch contact form submissions.
# Delegates ALL business logic to ContactService. No direct ORM access.

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle, UserRateThrottle
from Features.Api.Serializers.contact_serializer import ContactMessageSerializer
from Features.Repositories.Implementations.contact_repository import ContactRepository
from Features.Services.Implementations.contact_service import ContactService


class AdminUserRateThrottle(UserRateThrottle):
    """Elevated throttle for authenticated admin users — prevents 429 on the admin panel."""
    scope = 'user'


class ContactMessageViewSet(viewsets.ViewSet):

    def get_throttles(self):
        # Authenticated admins get the generous user throttle (2000/hour).
        # Public (anonymous) contact submissions get the strict 'contact' scope (10/hour).
        if self.request and self.request.user and self.request.user.is_authenticated:
            return [AdminUserRateThrottle()]
        return [ScopedRateThrottle()]

    throttle_scope = 'contact'

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

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
            try:
                message = self.service.submit_contact(serializer.validated_data)
                return Response(
                    ContactMessageSerializer(message).data,
                    status=status.HTTP_201_CREATED
                )
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            message = self.service.repository.get_by_id(pk)
            return Response(ContactMessageSerializer(message).data)
        except Exception:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, pk=None):
        """Update message status (mark read, archive, reply, etc.)."""
        try:
            status_val = request.data.get('status')
            if status_val:
                message = self.service.update_message_status(pk, status_val)
            else:
                message = self.service.mark_message_read(pk)
            return Response(ContactMessageSerializer(message).data)
        except Exception:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            message = self.service.repository.get_by_id(pk)
            if message:
                message.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        """
        POST /api/contact/{id}/reply/
        Body: { "reply_body": "Dear user, ..." }
        Sends a real SMTP email reply from the library's Gmail to the original sender.
        Marks the message as REPLIED.
        """
        reply_body = request.data.get('reply_body', '').strip()
        if not reply_body:
            return Response({'error': 'Reply body cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = self.service.reply_to_message(int(pk), reply_body)
            if result['success']:
                return Response(result, status=status.HTTP_200_OK)
            return Response(result, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='validate-email')
    def validate_email(self, request):
        """
        GET /api/contact/validate-email/?email=someone@example.com
        Returns { is_disposable, is_domain_valid } for a given email.
        Allows frontend to warn users in real-time before they submit.
        """
        from Features.Helpers.email_helper import is_disposable_email, is_email_domain_valid
        email = request.query_params.get('email', '').strip()
        if not email:
            return Response({'error': 'email query param required'}, status=400)
        return Response({
            'email': email,
            'is_disposable': is_disposable_email(email),
            'is_domain_valid': is_email_domain_valid(email),
        })
