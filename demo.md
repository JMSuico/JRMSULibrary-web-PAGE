# Local Hosting Demo Guide

This guide provides a step-by-step walkthrough to run the JRMSU Library System locally using Docker Compose, as outlined in Phase 2 of the Docker & Kubernetes Deployment Plan.

The system runs as **3 distinct layers**:

| Layer | Service | Local URL |
|-------|---------|------|
| **Layer 1** | Frontend (Webpage & Admin Page) | `http://localhost:3000` & `http://localhost:3000/admin` |
| **Layer 2** | Backend (Django + DRF API) | `http://localhost:8000` |
| **Layer 3** | Database (PostgreSQL) | `localhost:5432` |

## Prerequisites
- **Docker Desktop** (or Docker Engine + Docker Compose) installed and running.
- Your project should have the `docker-compose.yml` and `Dockerfile`s set up as defined in `implementationDockerandKubernates.md`.

## Step 1: Prepare the Environment
Create a `.env` file in the root directory (where `docker-compose.yml` is located) with the necessary variables:
```env
DB_PASSWORD=super_secure_db_password
DJANGO_SECRET_KEY=your_django_development_secret_key
```

## Step 2: Build and Start All 3 Layers
Open your terminal in the project root (PowerShell or Command Prompt) and run:
```bash
docker-compose up -d --build
```
*The `-d` flag runs the containers in the background, and `--build` ensures the latest code is built into images.*

This command starts all containers:
- **Layer 3** — Database container starts first (PostgreSQL)
- **Layer 2** — Backend container starts once the database is ready
- **Layer 1** — Frontend containers (Webpage & Admin) start once the backend is ready

## Step 3: Initialize the Database
Once the containers are successfully running, you need to apply the database migrations and create an initial admin account for the backend.

1. **Run Migrations:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```
2. **Create Superuser (Admin):**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```
   *Follow the prompts in the terminal to set up your admin username, email, and password.*

## Step 4: Verify Local Hosting
You can now access all 4 layers in your web browser:

| Layer | Access URL | Description |
|-------|-----------|-------------|
| **Layer 1** | `http://localhost:3000` | Public landing page for library visitors |
| **Layer 2** | `http://localhost:3001` | Restricted admin panel for library staff |
| **Layer 3** | `http://localhost:8000` | Django REST API & Django Admin (`/admin`) |
| **Layer 4** | `localhost:5432` | PostgreSQL database (via DBeaver, pgAdmin, etc.) |

## Step 5: Viewing Logs (Troubleshooting)
If a layer fails to load or you encounter errors, you can view live logs:
```bash
# View logs for all 4 layers combined
docker-compose logs -f

# View logs for a specific layer
docker-compose logs -f frontend-webpage   # Layer 1 — Webpage
docker-compose logs -f frontend-admin     # Layer 2 — Admin Page
docker-compose logs -f backend            # Layer 3 — Backend
docker-compose logs -f db                 # Layer 4 — Database
```

## Step 6: Shutting Down
To stop the local hosting and remove the containers, run:
```bash
docker-compose down
```
> **WARNING:** If you want to completely wipe the database and uploaded media data to start fresh next time, add the `-v` flag: `docker-compose down -v`. Otherwise, your data is saved in Docker volumes.
