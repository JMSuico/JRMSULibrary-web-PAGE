FROM python:3.11-slim
WORKDIR /app

# System dependencies for psycopg2 and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Use Docker-specific requirements (PostgreSQL instead of MSSQL)
COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt gunicorn

COPY . .

# Set DB_ENGINE so collectstatic doesn't try to load MSSQL drivers during build
ENV DB_ENGINE=postgresql

# Collect static files (non-fatal — app may not have STATIC_ROOT set yet)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["gunicorn", "core.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
