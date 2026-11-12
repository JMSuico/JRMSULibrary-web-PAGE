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
                from Features.Repositories.Implementations.user_repository import UserRepository
                repo = UserRepository()
                repo.clear_all_sessions_and_status()
                print("Server starting: Successfully cleared all active sessions and online statuses.")
            except Exception as e:
                print(f"Exception in apps.py ready(): {e}")
                pass
