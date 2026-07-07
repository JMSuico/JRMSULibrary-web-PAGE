# Local Hosting Demo Guide

This guide provides a step-by-step walkthrough to run the JRMSU Library System locally using Docker Compose, as outlined in Phase 2 of the Docker & Kubernetes Deployment Plan.

## Prerequisites
- **Docker Desktop** (or Docker Engine + Docker Compose) installed and running.
- Your project should have the `docker-compose.yml` and `Dockerfile`s set up as defined in `implementationDockerandKubernates.md`.

## Step 1: Prepare the Environment
Create a `.env` file in the root directory (where `docker-compose.yml` is located) with the necessary variables:
```env
DB_PASSWORD=super_secure_db_password
DJANGO_SECRET_KEY=your_django_development_secret_key
```

## Step 2: Build and Start the Containers
Open your terminal in the project root (PowerShell or Command Prompt) and run:
```bash
docker-compose up -d --build
```
*The `-d` flag runs the containers in the background, and `--build` ensures the latest code is built into the images.*

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
You can now test the application locally in your web browser:

- **Frontend (React Landing Page & Admin UI):** Navigate to `http://localhost:3000`
- **Backend API & Django Admin Panel:** Navigate to `http://localhost:8000` (e.g., `http://localhost:8000/admin`)
- **Database (PostgreSQL):** Accessible on `localhost:5432` using your preferred database client (e.g., DBeaver, pgAdmin) using the credentials defined in your `.env`.

## Step 5: Viewing Logs (Troubleshooting)
If a service fails to load or you encounter errors, you can view the live logs:
```bash
# View logs for all services combined
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

## Step 6: Shutting Down
To stop the local hosting and remove the containers, run:
```bash
docker-compose down
```
> **WARNING:** If you want to completely wipe the database and uploaded media data to start fresh next time, add the `-v` flag: `docker-compose down -v`. Otherwise, your data is saved in Docker volumes.
