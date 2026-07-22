from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone
import sys
from django.contrib.auth import get_user_model
from Features.Data.Models.site_settings_model import SiteSettings

# Intercept standard createsuperuser command to flag Terminal-Created Admins
@receiver(pre_save, sender=get_user_model())
def flag_terminal_created_admin(sender, instance, **kwargs):
    if not instance.pk and instance.is_superuser:
        if any(cmd in sys.argv for cmd in ['createsuperuser', 'createsuperuser_custom']):
            instance.is_terminal_created = True

# Catch save/delete on any model in this app by connecting the signal dynamically in apps.py
# But we can also just let it be connected globally.

def update_global_timestamp(sender, **kwargs):
    # We only care about models in our specific app
    if sender._meta.app_label != 'Features':
        return
    
    # Don't track SiteSettings itself to prevent loops, and exclude analytics models
    excluded_models = {'SiteSettings', 'SiteVisit', 'ContactMessage', 'Feedback', 'GeneratedReport'}
    if sender.__name__ in excluded_models:
        return

    # Update the timestamp
    rows_updated = SiteSettings.objects.all().update(updated_at=timezone.now())
    if rows_updated == 0:
        SiteSettings.objects.create()

    # Broadcast via WebSockets
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "admin_updates",
            {
                "type": "admin_update",
                "message": "database_updated"
            }
        )
    except Exception as e:
        # Silently fail if redis/channels is not configured yet
        pass
