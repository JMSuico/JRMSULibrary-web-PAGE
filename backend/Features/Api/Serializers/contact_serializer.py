# [Layer: Api/Serializers] — contact_serializer.py
# Shape contact request and response data.
# Do NOT put business validation here.

from rest_framework import serializers
from Features.Data.Models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'message', 'created_at', 'is_read']
        read_only_fields = ['created_at', 'is_read']
