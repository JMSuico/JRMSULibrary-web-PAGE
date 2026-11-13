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

            # Run catalog auto-seeding + background OCR daemon outside ready() critical path
            # so ASGI/WSGI server binds immediately without risking 502 startup timeouts.
            def _post_boot_knowledge_bootstrap():
                import time
                from django.db import close_old_connections, connection
                time.sleep(1.5)
                close_old_connections()
                try:
                    from Features.Helpers.local_books_auto_seeder import auto_seed_local_books_catalog
                    auto_seed_local_books_catalog(force=False, extract_pdfs_sync=False)
                except Exception as e:
                    print(f"Auto-seed exception in post-boot bootstrap: {e}")
                finally:
                    try:
                        connection.close()
                    except Exception:
                        pass

                try:
                    from Features.Helpers.autonomous_knowledge_daemon import AutonomousKnowledgeDaemon
                    AutonomousKnowledgeDaemon.start_daemon()
                except Exception as de:
                    print(f"AutonomousKnowledgeDaemon start exception: {de}")

            import threading
            threading.Thread(
                target=_post_boot_knowledge_bootstrap,
                daemon=True,
                name="PostBootKnowledgeBootstrap",
            ).start()
