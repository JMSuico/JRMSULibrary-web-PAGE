FROM python:3.11-slim
WORKDIR /app

# System dependencies for psycopg2 and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Use Docker-specific requirements (PostgreSQL instead of MSSQL)
COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt gunicorn

# Removed pip-audit to ensure robust builds across all devices

COPY . .

# Set DB_ENGINE so collectstatic doesn't try to load MSSQL drivers during build
ENV DB_ENGINE=postgresql

# Collect static files (non-fatal — app may not have STATIC_ROOT set yet)
RUN SECRET_KEY="dummy-key-for-build" python manage.py collectstatic --noinput || true

EXPOSE 8000

# Create a non-root user and group for blast-radius isolation
RUN addgroup --system appgroup && adduser --system --group appuser

# Change ownership of the app directory so appuser can write to media/ and logs
RUN chown -R appuser:appgroup /app

# Switch to the powerless user
USER appuser
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]
