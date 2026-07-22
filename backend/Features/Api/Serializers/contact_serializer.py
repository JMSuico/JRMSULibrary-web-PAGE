# [Layer: Api/Serializers] — contact_serializer.py
# Shape contact request and response data.
# Do NOT put business validation here.

from rest_framework import serializers
from Features.Data.Models import ContactMessage, ContactAttachment

class ContactAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactAttachment
        fields = ['id', 'file', 'original_filename', 'file_size', 'uploaded_at']

class ContactMessageSerializer(serializers.ModelSerializer):
    attachments = ContactAttachmentSerializer(many=True, read_only=True)
    name = serializers.CharField(max_length=200)
    subject = serializers.CharField(max_length=300)
    message = serializers.CharField(max_length=5000)
    
    
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'message_type', 'status', 'created_at', 'is_read', 'attachments']
        read_only_fields = ['created_at', 'is_read', 'status']

