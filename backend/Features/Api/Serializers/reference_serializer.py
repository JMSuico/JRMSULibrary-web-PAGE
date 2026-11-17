from rest_framework import serializers
from Features.Data.Models.research_reference_model import ResearchReference

class ResearchReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchReference
        # Exclude extracted_text from public/admin list & detail JSON payloads (AI reads it directly from DB).
        exclude = ['extracted_text']
        read_only_fields = ['id', 'created_at', 'updated_at']
