# [Layer: Api/Serializers] — personnel_serializer.py
# Shape personnel response data.
# Do NOT put business validation here.

from collections.abc import Mapping
from rest_framework import serializers
from Features.Data.Models import Personnel


class PersonnelSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False, allow_null=True)
    photo_version = serializers.SerializerMethodField()

    class Meta:
        model = Personnel
        fields = [
            'id',
            'name',
            'title',
            'photo',
            'photo_version',
            'order',
            'updated_at',
        ]
        read_only_fields = ['id', 'photo_version', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, Mapping) and data.get('photo') == '':
            mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
            mutable_data['photo'] = None
            data = mutable_data
        return super().to_internal_value(data)

    def get_photo_version(self, obj: Personnel) -> str:
        updated_at = getattr(obj, 'updated_at', None)
        if updated_at is None:
            return '0'
        return str(int(updated_at.timestamp() * 1000))

    def to_representation(self, instance):
        data = super().to_representation(instance)
        photo_field = getattr(instance, 'photo', None)
        if not photo_field:
            data['photo'] = None
            return data

        try:
            photo_url = photo_field.url
        except ValueError:
            photo_url = None

        if not photo_url:
            data['photo'] = None
            return data

        version = data.get('photo_version') or self.get_photo_version(instance)
        separator = '&' if '?' in photo_url else '?'
        data['photo'] = f"{photo_url}{separator}v={version}"
        return data
