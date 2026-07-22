from rest_framework import serializers
from Features.Data.Models.research_reference_model import ResearchReference

class ResearchReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchReference
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
