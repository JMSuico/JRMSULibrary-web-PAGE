#!/usr/bin/env python
"""
Database Setup Script for JRMSU Library Landing Page.

Run this ONCE before starting Django to choose your database
and generate the .env file automatically.

This script merges the functionality of:
  - setup_db.py    (interactive setup + .env generation)
  - create_db.py   (database creation via pyodbc)
  - setup_database.sql (SQL Server login/user/database creation)

Usage:
    python setup_db.py
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

BANNER = r"""
============================================================
  JRMSU Katipunan Campus Library — Database Setup
============================================================
"""

MENU = """
Select your database engine:

  [A] SQL Server (SSMS 19)     ** RECOMMENDED **
  [B] MySQL / MariaDB (XAMPP)   (optional)
  [C] PostgreSQL (pgAdmin)      (optional)

"""


def prompt(text, default=""):
    """Prompt the user for input with an optional default value."""
    if default:
        result = input(f"  {text} [{default}]: ").strip()
        return result if result else default
    return input(f"  {text}: ").strip()


def setup_mssql():
    """Collect SQL Server connection details and return env lines."""
    print("\n-- SQL Server (SSMS 19) — RECOMMENDED -----------------")
    print("  Make sure SQL Server is running on localhost.")
    print("  The database, login, and user will be created automatically.")
    print("  For named instances use: localhost\\SQLEXPRESS")
    print("  SQL Server Authentication is RECOMMENDED.\n")

    db_name   = prompt("Database name", "JRMSUKatipunanCampusLibrary")
    db_host   = prompt("Host", "localhost")
    db_port   = prompt("Port", "1433")
    db_driver = prompt("ODBC Driver", "ODBC Driver 17 for SQL Server")

    print("\n  Authentication Mode:")
    print("    [1] SQL Server Authentication (Recommended)")
    print("    [2] Windows Authentication")
    auth_choice = input("  Your choice (1/2): ").strip()
    use_win_auth = auth_choice == "2"

    if use_win_auth:
        db_user = ""
        db_pass = ""
        db_windows_auth = "True"
    else:
        db_user = prompt("SQL Login Username", "JRMSUKatipunanCampusLibrary")
        db_pass = prompt("SQL Login Password", "JRMSUKatipunanCampusLibrary")
        db_windows_auth = "False"

    config = {
        "DB_ENGINE": "mssql",
        "DB_NAME": db_name,
        "DB_USER": db_user,
        "DB_PASSWORD": db_pass,
        "DB_HOST": db_host,
        "DB_PORT": db_port,
        "DB_MSSQL_DRIVER": db_driver,
        "DB_WINDOWS_AUTH": db_windows_auth,
    }
    return config


def setup_mysql():
    """Collect MySQL connection details and return env lines."""
    print("\n-- MySQL / MariaDB (XAMPP) — Optional ------------------")
    print("  Make sure XAMPP MySQL is running.")
    print("  The database will be created automatically if it does not exist.")
    print("  Default: root user, no password, port 3306.\n")

    db_name = prompt("Database name", "JRMSUKatipunanCampusLibrary")
    db_user = prompt("Username", "root")
    db_pass = prompt("Password (leave blank for none)", "")
    db_host = prompt("Host", "127.0.0.1")
    db_port = prompt("Port", "3306")

    return {
        "DB_ENGINE": "mysql",
        "DB_NAME": db_name,
        "DB_USER": db_user,
        "DB_PASSWORD": db_pass,
        "DB_HOST": db_host,
        "DB_PORT": db_port,
    }


def setup_postgresql():
    """Collect PostgreSQL connection details and return env lines."""
    print("\n-- PostgreSQL (pgAdmin / psql) — Optional ---------------")
    print("  Make sure PostgreSQL server is running.")
    print("  The database will be created automatically if it does not exist.")
    print("  Default: postgres user, port 5432.\n")

    db_name = prompt("Database name", "JRMSUKatipunanCampusLibrary")
    db_host = prompt("Host", "localhost")
    db_port = prompt("Port", "5432")
    db_user = prompt("Username", "postgres")
    db_pass = prompt("Password", "")

    return {
        "DB_ENGINE": "postgresql",
        "DB_NAME": db_name,
        "DB_USER": db_user,
        "DB_PASSWORD": db_pass,
        "DB_HOST": db_host,
        "DB_PORT": db_port,
    }


def write_env(config):
    """Write the .env file from config dict."""
    lines = [
        "# ============================================================",
        "# JRMSU Library — Auto-generated Environment Configuration",
        "# ============================================================",
        "",
        "# -- Django ---------------------------------------------------",
        "DJANGO_SECRET_KEY=change-this-in-production",
        "DJANGO_DEBUG=True",
        "DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1",
        "",
        f"# -- Database ({config['DB_ENGINE']}) ------------------------------------------",
    ]

    for key, value in config.items():
        lines.append(f"{key}={value}")

    lines.append("")
    lines.append("# -- Frontend (for reference) ---------------------------------")
    lines.append("API_BASE_URL=http://localhost:8000")
    lines.append("")

    ENV_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n  .env file created at: {ENV_FILE}")


def _get_mssql_admin_connection(config):
    """
    Build a pyodbc connection to the 'master' database using Windows Auth.
    This is needed for creating logins and databases (requires sysadmin).
    """
    import pyodbc
    driver = config.get("DB_MSSQL_DRIVER", "ODBC Driver 17 for SQL Server")
    host = config["DB_HOST"]
    # Always use Windows Auth (Trusted_Connection) for admin operations,
    # because the SQL login may not exist yet.
    conn_str = (
        f"Driver={{{driver}}};"
        f"Server={host};"
        f"Database=master;"
        f"Trusted_Connection=yes;"
    )
    return pyodbc.connect(conn_str, autocommit=True)


def create_mssql_login_and_database(config):
    """
    For SQL Server: create the login, database, database user, and grant db_owner.
    Merges the logic from create_db.py and setup_database.sql.
    Connects to master using Windows Auth (sysadmin) to perform admin operations.
    """
    import pyodbc

    db_name = config["DB_NAME"]
    use_sql_auth = config.get("DB_WINDOWS_AUTH", "True") == "False"
    sql_user = config.get("DB_USER", "")
    sql_pass = config.get("DB_PASSWORD", "")
    driver = config.get("DB_MSSQL_DRIVER", "ODBC Driver 17 for SQL Server")
    host = config["DB_HOST"]

    print("\n-- Setting up SQL Server (connecting via Windows Auth as sysadmin) --")

    try:
        conn = _get_mssql_admin_connection(config)
        cursor = conn.cursor()
    except Exception as exc:
        print(f"\n  [ERROR] Could not connect to SQL Server on '{host}'.")
        print(f"  Reason: {exc}")
        print("  Make sure SQL Server is running and your Windows login has sysadmin access.")
        return False

    # --- Step 1: Create the database ---
    try:
        cursor.execute(
            f"IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'{db_name}') "
            f"BEGIN CREATE DATABASE [{db_name}]; END"
        )
        print(f"  [OK] Database [{db_name}] created (or already exists).")
    except Exception as exc:
        print(f"  [ERROR] Could not create database: {exc}")
        conn.close()
        return False

    # --- Step 2: Create the SQL Login (only for SQL Auth) ---
    if use_sql_auth and sql_user:
        try:
            cursor.execute(
                f"IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'{sql_user}') "
                f"BEGIN "
                f"  CREATE LOGIN [{sql_user}] "
                f"  WITH PASSWORD = N'{sql_pass}', "
                f"       DEFAULT_DATABASE = [{db_name}], "
                f"       CHECK_EXPIRATION = OFF, "
                f"       CHECK_POLICY = OFF; "
                f"END"
            )
            print(f"  [OK] SQL Login [{sql_user}] created (or already exists).")
        except Exception as exc:
            print(f"  [WARNING] Could not create login: {exc}")
            print("  You may need to create it manually in SSMS.")

        # --- Step 3: Create the database user mapped to the login ---
        try:
            # Switch to the target database
            cursor.execute(f"USE [{db_name}]")
            cursor.execute(
                f"IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'{sql_user}') "
                f"BEGIN "
                f"  CREATE USER [{sql_user}] FOR LOGIN [{sql_user}]; "
                f"END"
            )
            print(f"  [OK] Database user [{sql_user}] created (or already exists).")
        except Exception as exc:
            print(f"  [WARNING] Could not create database user: {exc}")

        # --- Step 4: Grant db_owner role ---
        try:
            cursor.execute(f"ALTER ROLE [db_owner] ADD MEMBER [{sql_user}]")
            print(f"  [OK] Granted db_owner to [{sql_user}].")
        except Exception as exc:
            print(f"  [WARNING] Could not grant db_owner: {exc}")

    conn.close()
    print("  [DONE] SQL Server setup complete.")
    return True


def create_database_now(config):
    """Attempt to create the database immediately using the appropriate driver."""
    engine = config["DB_ENGINE"]
    db_name = config["DB_NAME"]

    if engine == "mssql":
        try:
            import pyodbc  # noqa: F401 — ensure pyodbc is available
            return create_mssql_login_and_database(config)
        except ImportError:
            print("\n  [info] pyodbc not installed. Install it with: pip install pyodbc")
            print("  The database will need to be created manually via SSMS.")
            return False

    elif engine == "mysql":
        try:
            import MySQLdb
            host = config["DB_HOST"]
            user = config["DB_USER"]
            pwd = config["DB_PASSWORD"]
            port = int(config["DB_PORT"])

            conn = MySQLdb.connect(host=host, user=user, passwd=pwd, port=port)
            cursor = conn.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            conn.close()
            print(f"\n  Database '{db_name}' created successfully (or already exists).")
            return True
        except ImportError:
            print("\n  [info] mysqlclient not installed. Install it with: pip install mysqlclient")
            return False
        except Exception as exc:
            print(f"\n  [warning] Could not auto-create database: {exc}")
            return False

    elif engine == "postgresql":
        try:
            import psycopg2
            from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
            host = config["DB_HOST"]
            user = config["DB_USER"]
            pwd = config["DB_PASSWORD"]
            port = config["DB_PORT"]

            conn = psycopg2.connect(host=host, user=user, password=pwd, port=port, dbname="postgres")
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}';")
            if not cursor.fetchone():
                cursor.execute(f'CREATE DATABASE "{db_name}";')
            conn.close()
            print(f"\n  Database '{db_name}' created successfully (or already exists).")
            return True
        except ImportError:
            print("\n  [info] psycopg2 not installed. Install it with: pip install psycopg2-binary")
            return False
        except Exception as exc:
            print(f"\n  [warning] Could not auto-create database: {exc}")
            return False

    return False


def print_next_steps(engine):
    """Show the user what to do next."""
    print("\n-- Next Steps -----------------------------------------------\n")

    if engine == "mssql":
        print("  1. Make sure SQL Server is running (check SSMS 19).")
        print("  2. Install the SQL Server driver:")
        print("       pip install mssql-django pyodbc")
    elif engine == "mysql":
        print("  1. Make sure XAMPP Apache + MySQL are running.")
        print("  2. Install the MySQL driver:")
        print("       pip install mysqlclient")
    elif engine == "postgresql":
        print("  1. Make sure PostgreSQL server is running.")
        print("  2. Install the PostgreSQL driver:")
        print("       pip install psycopg2-binary")

    print()
    print("  3. Run migrations:")
    print("       python manage.py makemigrations")
    print("       python manage.py migrate")
    print()
    print("     Or use the architecture wrapper commands:")
    print("       python manage.py add_migration")
    print("       python manage.py update_database")
    print()
    print("  4. Create the first admin superuser:")
    print("       python manage.py createsuperuser_custom")
    print()
    print("  5. Seed CMS data from asset files:")
    print("       python manage.py seed_assets")
    print()
    print("  6. Start the backend server:")
    print("       python manage.py runserver 8000")
    print()
    print("  7. Start the frontend (in a separate terminal):")
    print("       cd frontend && npm run dev")
    print()
    print("  Admin Panel:  http://localhost:3000/admin")
    print("  Django Admin: http://localhost:8000/admin/")
    print("  API Root:     http://localhost:8000/api/")
    print()


def main():
    print(BANNER)

    if ENV_FILE.exists():
        overwrite = input("  .env already exists. Overwrite? (y/N): ").strip().lower()
        if overwrite != "y":
            print("  Aborted. Existing .env kept.")
            sys.exit(0)

    print(MENU)
    choice = input("  Your choice (A/B/C): ").strip().upper()

    if choice == "A":
        config = setup_mssql()
    elif choice == "B":
        config = setup_mysql()
    elif choice == "C":
        config = setup_postgresql()
    else:
        print(f"  Invalid choice: {choice}")
        sys.exit(1)

    write_env(config)
    create_database_now(config)
    print_next_steps(config["DB_ENGINE"])


if __name__ == "__main__":
    main()
