# Generated for Supabase Security Lockdown

import logging
import os
from django.db import migrations, transaction

logger = logging.getLogger(__name__)


def apply_supabase_lockdown(apps, schema_editor):
    """
    Automatically locks down the public schema from Supabase's PostgREST API.
    This prevents bypassing Django to read the database directly.
    Checks whether Supabase roles exist:
    - On standard local Docker/PostgreSQL (without Supabase roles), skips gracefully.
    - On real Supabase (supabase_admin role exists or SUPABASE_STRICT_RLS=True), fails closed
      instead of silently swallowing privilege errors.
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

    if schema_editor.connection.vendor != 'postgresql':
        logger.info("Not using PostgreSQL. Skipping Supabase Security Lockdown.")
        return

    strict_rls = os.environ.get("SUPABASE_STRICT_RLS", "False").lower() in ("true", "1", "yes")
    has_supabase_admin = False
    has_anon = False
    has_authenticated = False

    with schema_editor.connection.cursor() as cursor:
        try:
            with transaction.atomic(using=schema_editor.connection.alias):
                cursor.execute(
                    """
                    SELECT
                        EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin'),
                        EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'anon'),
                        EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'authenticated')
                    """
                )
                row = cursor.fetchone()
                if row:
                    has_supabase_admin, has_anon, has_authenticated = bool(row[0]), bool(row[1]), bool(row[2])
        except Exception as e:
            if strict_rls:
                logger.error(f"Supabase role inspection failed with SUPABASE_STRICT_RLS=True: {e}")
                raise
            logger.warning(f"Supabase role inspection skipped: {e}")
            return

        if not (has_anon and has_authenticated):
            if strict_rls or has_supabase_admin:
                raise RuntimeError(
                    "Supabase Security Lockdown requires 'anon' and 'authenticated' roles when "
                    "SUPABASE_STRICT_RLS=True or 'supabase_admin' role is present."
                )
            logger.info(
                "Standard PostgreSQL detected (Supabase roles 'anon'/'authenticated' absent). "
                "Skipping Supabase Security Lockdown."
            )
            return

        try:
            with transaction.atomic(using=schema_editor.connection.alias):
                cursor.execute(sql)
            logger.info("Supabase Security Lockdown applied successfully.")
        except Exception as e:
            # Fail closed on real Supabase or when strict RLS is requested;
            # otherwise savepoint rolls back so non-Supabase local Postgres stays healthy.
            if strict_rls or has_supabase_admin:
                logger.error(f"Supabase Security Lockdown failed (fail-closed): {e}")
                raise
            logger.warning(f"Supabase Security Lockdown skipped: {e}")

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
