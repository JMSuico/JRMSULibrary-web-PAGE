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
        if self.action in ['create', 'validate_email', 'upload_attachment', 'check_replies']:
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
            user_id = request.user.id if request.user.is_authenticated else None
            if self.service.delete_message(pk, user_id):
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        """
        POST /api/contact/{id}/reply/
        Body: { "reply_body": "Dear user, ...", "send_to_chatbot": true }
        Sends a real SMTP email reply from the library's Gmail to the original sender.
        Optionally saves reply_text to DB so it appears in the Rizal Chatbot.
        """
        reply_body = request.data.get('reply_body', '').strip()
        send_to_chatbot = request.data.get('send_to_chatbot', False)
        if not reply_body:
            return Response({'error': 'Reply body cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = self.service.reply_to_message(int(pk), reply_body, send_to_chatbot=send_to_chatbot)
            if result['success']:
                return Response(result, status=status.HTTP_200_OK)
            return Response(result, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='bulk-reply')
    def bulk_reply(self, request):
        """
        POST /api/contact/bulk-reply/
        Body: { "message_ids": [1, 2, 3], "reply_body": "..." }
        Sends replies sequentially to prevent rate limits or timeout bombs.
        """
        message_ids = request.data.get('message_ids', [])
        reply_body = request.data.get('reply_body', '').strip()
        
        if not message_ids or not reply_body:
            return Response({'error': 'message_ids and reply_body are required.'}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        for msg_id in message_ids:
            try:
                res = self.service.reply_to_message(int(msg_id), reply_body)
                results.append({'id': msg_id, 'success': res['success'], 'detail': res['detail']})
            except Exception as e:
                results.append({'id': msg_id, 'success': False, 'detail': str(e)})

        return Response({'results': results}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='upload-attachment')
    def upload_attachment(self, request):
        """
        POST /api/contact/upload-attachment/
        Uploads a file to a temporary staging area and returns its ID (path).
        """
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        import os
        import uuid
        from django.core.files.storage import FileSystemStorage
        from django.conf import settings
        
        ext = file.name.split('.')[-1].lower()
        allowed_extensions = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp'}
        
        if ext not in allowed_extensions:
            return Response({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'temp_attachments'))
        filename = f"{uuid.uuid4()}.{ext}"
        saved_name = fs.save(filename, file)
        
        return Response({
            'file_id': saved_name,
            'filename': file.name
        })

    @action(detail=True, methods=['post'], url_path='reply-with-files')
    def reply_with_files(self, request, pk=None):
        """
        POST /api/contact/{id}/reply-with-files/
        Body: { reply_body: "...", file_entries: [{"id": "uuid.pdf", "name": "original.pdf"}], send_to_chatbot: true }
        """
        reply_body = request.data.get('reply_body', '').strip()
        send_to_chatbot = request.data.get('send_to_chatbot', False)
        # Fallback to file_ids for backward compatibility
        file_entries = request.data.get('file_entries') or request.data.get('file_ids', [])
        
        if not reply_body:
            return Response({'error': 'Reply body cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = self.service.reply_with_attachment(int(pk), reply_body, file_entries, send_to_chatbot=send_to_chatbot)
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
