# [Layer: Api/Serializers] — settings_serializer.py
# Shapes the input/output for SiteSettings.

from rest_framework import serializers
from Features.Data.Models.site_settings_model import (
    SiteSettings,
    normalize_room_availability,
)
from Features.Repositories.Implementations.settings_repository import notify_settings_updated


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'library_name',
            'address',
            'contact_email',
            'alternate_email',
            'phone_number',
            'opening_hours_mon_fri',
            'opening_hours_sat',
            'opening_hours_sun',
            'carousel_style',
            'background_image',
            'room_availability',
            'updated_at'
        ]
        read_only_fields = ['updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['room_availability'] = normalize_room_availability(data.get('room_availability'))
        return data

    def update(self, instance, validated_data):
        if 'room_availability' in validated_data:
            incoming = validated_data.pop('room_availability')
            instance.room_availability = normalize_room_availability(
                incoming,
                existing=getattr(instance, 'room_availability', None),
            )
        else:
            instance.room_availability = normalize_room_availability(
                getattr(instance, 'room_availability', None)
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        notify_settings_updated()
        return instance
