# [Layer: Api/Serializers] — personnel_serializer.py
# Shape personnel response data.
# Do NOT put business validation here.

from rest_framework import serializers
from Features.Data.Models import Personnel


class PersonnelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personnel
        fields = '__all__'
