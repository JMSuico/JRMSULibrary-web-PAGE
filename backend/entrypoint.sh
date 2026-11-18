#!/bin/bash
# =============================================================
# Docker Entrypoint — JRMSU Library Backend
# Automatically runs migrations on startup so any fresh PC clone
# works immediately without manual setup steps.
# =============================================================
set -e

echo "========================================="
echo "  JRMSU Library — Backend Startup"
echo "========================================="

echo "[1/3] Waiting for PostgreSQL to be ready..."
until python -c "
import os, sys, time
import psycopg2
try:
    psycopg2.connect(
        dbname=os.environ.get('DB_NAME', 'jrmsu_library'),
        user=os.environ.get('DB_USER', 'jrmsu_admin'),
        password=os.environ.get('DB_PASSWORD', ''),
        host=os.environ.get('DB_HOST', 'db'),
        port=os.environ.get('DB_PORT', '5432'),
    )
    sys.exit(0)
except Exception as e:
    print(f'  DB not ready: {e}')
    sys.exit(1)
"; do
    echo "  Database not ready yet, retrying in 2s..."
    sleep 2
done
echo "  Database is ready!"

echo "[2/3] Running database migrations..."
python manage.py migrate --noinput
echo "  Migrations complete!"

echo "[3/3] Starting Daphne ASGI (WebSockets :8001) and Gunicorn WSGI (HTTP :8000)..."
daphne -b 0.0.0.0 -p 8001 core.asgi:application &
exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --threads 4 \
    --worker-class gthread \
    --timeout 180 \
    --graceful-timeout 30 \
    --keep-alive 5
