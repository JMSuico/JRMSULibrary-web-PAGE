# [Layer: Api/Controllers] — settings_controller.py
# GET/PUT /api/settings — manages global site configuration.

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from Features.Api.Serializers.settings_serializer import SiteSettingsSerializer
from Features.Services.Implementations.settings_service import SettingsService



class SettingsViewSet(viewsets.ViewSet):
    # Only authenticated admins can modify settings, anyone can read them
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = SettingsService()

    def list(self, request):
        """Get the global site settings."""
        settings = self.service.get_settings()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

    def create(self, request):
        """Update the global site settings. We use create (POST) or put to act as an update since it's a singleton."""
        # Get the existing settings instance to update in-place (singleton pattern).
        # Passing the instance to the serializer ensures UPDATE behavior, not CREATE,
        # so the ImageField correctly replaces the old file instead of failing validation.
        # request.data in DRF with MultiPartParser already merges text fields AND files.
        existing_settings = self.service.get_settings()
        serializer = SiteSettingsSerializer(
            existing_settings,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            settings = serializer.save()
            return Response(SiteSettingsSerializer(settings).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def last_update(self, request):
        """Returns the timestamp of the last global update (useful for frontend auto-refresh)."""
        settings = self.service.get_settings()
        return Response({
            'last_updated': settings.updated_at,
        })
