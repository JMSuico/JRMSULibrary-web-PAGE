# [Layer: Api/Serializers] — settings_serializer.py
# Shapes the input/output for SiteSettings.

from rest_framework import serializers
from Features.Data.Models.site_settings_model import SiteSettings

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'library_name',
            'address',
            'contact_email',
            'phone_number',
            'opening_hours_mon_fri',
            'opening_hours_sat',
            'opening_hours_sun',
            'carousel_style',
            'background_image',
            'updated_at'
        ]
        read_only_fields = ['updated_at']
