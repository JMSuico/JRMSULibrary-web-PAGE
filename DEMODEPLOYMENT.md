# JRMSU Library System — Localhost Deployment Guide

This guide provides step-by-step instructions for running the JRMSU Library System on your local machine using Docker Compose. It integrates the latest architectural changes following the guidelines in `SKILL.md`.

## 3-Layer Architecture Overview

The system runs completely containerized in **3 distinct layers**:

| Layer | Service | Local Access URL | Port |
|-------|---------|------------------|------|
| **Layer 1** | **Frontend** | `http://localhost:3000` (Webpage)<br>`http://localhost:3000/admin` (Admin) | 3000 |
| **Layer 2** | **Backend** | `http://localhost:8000/api` | 8000 |
| **Layer 3** | **Database** | *(Internal Network / DB Client)* | 5432 |

> **Note on Layer 1:** The Frontend container uses a single Nginx server that routes traffic. Both the public webpage and the secure admin panel are handled by the same React application using React Router on Port 3000.

---

## Step 1: Environment Setup

Ensure you have a `.env` file in the root directory (alongside `docker-compose.yml`) containing the necessary secure credentials. 

**Example `.env` configuration:**
```env
# Database Credentials
DB_PASSWORD=jrmsu_secure_db_pass_123

# Django Secrets
DJANGO_SECRET_KEY=your_django_insecure_development_secret_key_here
```

---

## Step 2: Fresh Build and Start (Clean Slate)

If you are experiencing build errors, stale caches, or unfinished states, it is highly recommended to perform a **clean slate** start. 

Open your terminal (PowerShell or Command Prompt) in the project root directory and run these commands in order:

**1. Wipe all existing containers, volumes, and orphaned networks:**
```bash
docker-compose down -v --remove-orphans
```

**2. Build completely fresh (ignoring all caches):**
```bash
docker-compose build --no-cache
```

**3. Start the containers in detached mode:**
```bash
docker-compose up -d --force-recreate
```

**Boot Sequence:**
1. **Database (Layer 3)** starts first.
2. **Backend (Layer 2)** waits for the database to be healthy before starting.
3. **Frontend (Layer 1)** waits for the backend to be running, building the React app using the provided `VITE_API_BASE_URL` argument (`http://localhost:8000/api`).

---

## Step 3: Initialize the Backend & Database

On the very first run, you need to apply the database schema (migrations) and create a master administrator account.

**1. Apply Migrations:**
```bash
docker-compose exec backend python manage.py migrate
```

**2. Create Superuser (Admin):**
```bash
docker-compose exec backend python manage.py createsuperuser
```
*(Follow the interactive terminal prompts to define an admin username, email, and password).*

---

## Step 4: Verify Local Hosting

Once the initialization is complete, open your web browser and navigate to the following URLs:

- **Public Landing Page:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)
  *(Log in using the superuser credentials you created in Step 3)*
- **Django API & Admin Panel:** [http://localhost:8000/admin](http://localhost:8000/admin)

---

## Step 5: Viewing Logs & Troubleshooting

If a specific layer isn't loading, you can monitor the live Docker logs.

```bash
# View combined logs for all 3 layers
docker-compose logs -f

# View logs for the Frontend (Nginx/React)
docker-compose logs -f frontend

# View logs for the Backend (Django/Gunicorn)
docker-compose logs -f backend

# View logs for the Database (PostgreSQL)
docker-compose logs -f db
```
*(Press `Ctrl+C` to exit the log viewer).*

---

## Step 6: Shutting Down

To safely stop the system and remove the active containers, run:

```bash
docker-compose down
```

> **Data Persistence Warning:** The database data and uploaded media files are stored in Docker volumes. When you run `docker-compose down`, your data is kept safe. If you ever want to completely wipe the database and start entirely fresh, use the command `docker-compose down -v`.
