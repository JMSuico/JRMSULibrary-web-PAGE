# [Layer: Api/Serializers] — recycle_bin_serializer.py
from rest_framework import serializers
from Features.Data.Models import RecycleBin

class RecycleBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecycleBin
        fields = '__all__'
