# Generated for Supabase Security Lockdown

from django.db import migrations
import logging

logger = logging.getLogger(__name__)

def apply_supabase_lockdown(apps, schema_editor):
    """
    Automatically locks down the public schema from Supabase's PostgREST API.
    This prevents hackers from bypassing Django to read the database directly.
    It checks if the Supabase roles ('anon', 'authenticated') exist before revoking.
    """
    sql = """
    DO $$ 
    BEGIN 
        -- Only execute if anon and authenticated roles exist (which means we are on Supabase)
        IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') AND 
           EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
            
            REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
            REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;
            REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
            
            -- Set default privileges so future tables are also locked down
            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon, authenticated;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
        END IF;
    END $$;
    """
    
    # We only want to run this Postgres-specific command if the database is Postgres
    if schema_editor.connection.vendor == 'postgresql':
        with schema_editor.connection.cursor() as cursor:
            try:
                cursor.execute(sql)
                logger.info("Supabase Security Lockdown applied successfully.")
            except Exception as e:
                # Silently skip if it fails (e.g. lack of permissions on local docker pg instance)
                # This guarantees it will NEVER break functional code or local setups.
                logger.warning(f"Supabase Security Lockdown skipped: {str(e)}")
    else:
        logger.info("Not using PostgreSQL. Skipping Supabase Security Lockdown.")

def reverse_supabase_lockdown(apps, schema_editor):
    # Security lockdown is irreversible via migrations to prevent accidental exposure.
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('Features', '0032_alter_acquisitionbatch_options'),
    ]

    operations = [
        migrations.RunPython(apply_supabase_lockdown, reverse_supabase_lockdown),
    ]
