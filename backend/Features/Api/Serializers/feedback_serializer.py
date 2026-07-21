# [Layer: Api/Serializers] — feedback_serializer.py
# Shape feedback request and response data.
# Do NOT put business validation here.

from rest_framework import serializers
from Features.Data.Models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['created_at']
