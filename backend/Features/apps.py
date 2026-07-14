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
