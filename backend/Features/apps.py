from django.apps import AppConfig
from django.db.models.signals import post_save, post_delete

class FeaturesConfig(AppConfig):
    name = "Features"

    def ready(self):
        from .signals import update_global_timestamp
        
        # Connect the signal for all models in this app
        for model in self.get_models():
            post_save.connect(update_global_timestamp, sender=model)
            post_delete.connect(update_global_timestamp, sender=model)
            
        import sys
        # Only run this if we are starting the actual web server (daphne or runserver)
        is_server = False
        if len(sys.argv) > 0 and ('daphne' in sys.argv[0] or 'gunicorn' in sys.argv[0]):
            is_server = True
        elif 'runserver' in sys.argv:
            is_server = True
            
        if is_server:
            try:
                from django.contrib.auth import get_user_model
                from django.contrib.sessions.models import Session
                User = get_user_model()
                # 1. Wipe all online status timestamps
                User.objects.all().update(last_active=None)
                # 2. Shred all active sessions so everyone is logged out on server restart
                Session.objects.all().delete()
                print("Server starting: Successfully cleared all active sessions and online statuses.")
            except Exception as e:
                # Catch exception in case the database isn't fully migrated yet during first boot
                pass
