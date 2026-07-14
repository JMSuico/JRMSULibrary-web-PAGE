from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from Features.Data.Models.site_settings_model import SiteSettings

# Catch save/delete on any model in this app by connecting the signal dynamically in apps.py
# But we can also just let it be connected globally.

def update_global_timestamp(sender, **kwargs):
    # We only care about models in our specific app
    if sender._meta.app_label != 'Features':
        return
    
    # Don't track SiteSettings itself to prevent loops if we ever trigger save signals
    if sender == SiteSettings:
        return

    # Update the timestamp
    rows_updated = SiteSettings.objects.all().update(updated_at=timezone.now())
    if rows_updated == 0:
        SiteSettings.objects.create()
