"""
Management command to verify database row count parity between local and cloud databases.
Usage:
    python manage.py verify_cloud_sync
    python manage.py verify_cloud_sync --cloud-host=aws-0-ap-southeast-1.pooler.supabase.com --cloud-user=postgres.oaujamkhpwszewycylxm --cloud-password=YOUR_PW
"""
from django.core.management.base import BaseCommand
from django.apps import apps
import sys

class Command(BaseCommand):
    help = "Verifies data parity between local database and cloud standby database."

    def add_arguments(self, parser):
        parser.add_argument("--cloud-host", type=str, default="", help="Cloud DB host")
        parser.add_argument("--cloud-user", type=str, default="", help="Cloud DB user")
        parser.add_argument("--cloud-password", type=str, default="", help="Cloud DB password")
        parser.add_argument("--cloud-port", type=str, default="5432", help="Cloud DB port")
        parser.add_argument("--cloud-db", type=str, default="postgres", help="Cloud DB name")

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("=" * 65))
        self.stdout.write(self.style.SUCCESS(" JRMSU Library — Database Inventory & Parity Checker"))
        self.stdout.write(self.style.SUCCESS("=" * 65))

        # 1. Inspect all models in the Features app
        all_models = apps.get_app_config("Features").get_models()
        local_counts = {}

        self.stdout.write("\n[1/2] Auditing Local Database Records:")
        self.stdout.write("-" * 65)
        self.stdout.write(f"{'Model Name':<35} | {'Local Count':<12}")
        self.stdout.write("-" * 65)

        total_local_records = 0
        for model in all_models:
            model_name = model.__name__
            try:
                count = model.objects.count()
                local_counts[model_name] = count
                total_local_records += count
                self.stdout.write(f"{model_name:<35} | {count:<12}")
            except Exception as e:
                self.stdout.write(f"{model_name:<35} | ERROR: {str(e)[:20]}")

        self.stdout.write("-" * 65)
        self.stdout.write(self.style.SUCCESS(f"Total Local Records Across {len(all_models)} Models: {total_local_records}\n"))

        # 2. If cloud connection details are provided, test cloud connection
        cloud_host = options.get("cloud_host")
        if not cloud_host:
            self.stdout.write(self.style.WARNING(
                "NOTE: No --cloud-host provided. Local inventory complete.\n"
                "To test against Cloud Supabase, provide:\n"
                "  python manage.py verify_cloud_sync --cloud-host=<host> --cloud-user=<user> --cloud-password=<pw>\n"
            ))
            return

        self.stdout.write(f"[2/2] Connecting to Cloud Standby DB at {cloud_host}...")
        try:
            import psycopg2
            conn = psycopg2.connect(
                host=cloud_host,
                port=options.get("cloud_port", "5432"),
                user=options.get("cloud_user"),
                password=options.get("cloud_password"),
                dbname=options.get("cloud_db", "postgres"),
                connect_timeout=10,
                sslmode="require"
            )
            cursor = conn.cursor()
            
            self.stdout.write("-" * 65)
            self.stdout.write(f"{'Model / Table':<30} | {'Local':<8} | {'Cloud':<8} | {'Status':<8}")
            self.stdout.write("-" * 65)

            all_matched = True
            for model in all_models:
                table_name = model._meta.db_table
                model_name = model.__name__
                local_cnt = local_counts.get(model_name, 0)
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                    cloud_cnt = cursor.fetchone()[0]
                    status = "MATCH" if local_cnt == cloud_cnt else "MISMATCH"
                    if status != "MATCH":
                        all_matched = False
                    
                    status_styled = self.style.SUCCESS(status) if status == "MATCH" else self.style.ERROR(status)
                    self.stdout.write(f"{model_name:<30} | {local_cnt:<8} | {cloud_cnt:<8} | {status}")
                except Exception:
                    conn.rollback()
                    self.stdout.write(f"{model_name:<30} | {local_cnt:<8} | {'N/A':<8} | {'PENDING'}")
                    all_matched = False

            cursor.close()
            conn.close()

            self.stdout.write("-" * 65)
            if all_matched:
                self.stdout.write(self.style.SUCCESS("PARITY AUDIT PASSED: 100% data parity between local and cloud!"))
            else:
                self.stdout.write(self.style.WARNING("PARITY NOTICE: Some tables differ. Run migrate-local-to-cloud.ps1 to sync."))

        except ImportError:
            self.stdout.write(self.style.ERROR("psycopg2 module not found in this environment. Run inside docker."))
        except Exception as err:
            self.stdout.write(self.style.ERROR(f"Failed to connect to cloud database: {err}"))
