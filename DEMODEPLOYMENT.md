# JRMSU Library System — Localhost Deployment Guide

This guide provides step-by-step instructions for running the JRMSU Library System on your local machine using Docker Compose. It integrates the latest architectural changes following the guidelines in `SKILL.md`.

## 5-Layer Architecture Overview

The system runs completely containerized in **5 distinct layers**:

| Layer | Service | Local Access URL | Port |
|-------|---------|------------------|------|
| **Layer 1** | **Frontend Webpage** | `http://localhost:3000` | 3000 |
| **Layer 2** | **Frontend Admin Page** | `http://localhost:3001/admin` | 3001 |
| **Layer 3** | **Backend** | `http://192.168.15.194:8000/api` | 8000 |
| **Layer 4** | **Database** | *(Internal Network / DB Client)* | 5432 |
| **Layer 5** | **Model AI (Qwen2.5:1.5b)** | `http://127.0.0.1:11434` | 11434 |

> **Note on Frontend:** The public webpage and the admin panel are served by two separate Docker containers of the same React application. The webpage is on Port 3000 and the admin panel is on Port 3001. React Router handles the `/admin` routes internally.

> **Note on Model AI (Layer 5):** Ollama runs natively on the Windows host machine (not inside Docker). The backend container reaches it via `host.docker.internal:11434`.

### Ports and Links to Open
When the system is running, here are the links you will need to open:
1. **Public Library Landing Page**: [http://localhost:3000](http://localhost:3000)
2. **Admin Panel**: [http://localhost:3001/admin](http://localhost:3001/admin)
3. **Backend API**: [http://192.168.15.194:8000/api](http://192.168.15.194:8000/api)

---

## Step 1: Environment Setup

Ensure you have a `.env` file in the root directory (alongside `docker-compose.yml`) containing the necessary secure credentials. 

**Example `.env` configuration:**
```env
# Database Credentials
DB_PASSWORD=JRMSULibrary2026Secure!

# Django Secrets
DJANGO_SECRET_KEY=your_django_insecure_development_secret_key_here

# SMTP (Gmail App Password)
EMAIL_HOST_PASSWORD=mmuhzbjbnyzgovir

# External Library Credentials
VITALSOURCE_EMAIL=jrmsukclibrary@gmail.com
VITALSOURCE_PASSWORD=Jrmsukclibrary@19
SCHOLAAR_USERNAME=jrmsukc
SCHOLAAR_PASSWORD=scholaar
```

---

## Step 2: Fresh Build and Start (Clean Slate)

If you are experiencing build errors, stale caches, or unfinished states, it is highly recommended to perform a **clean slate** start. 

Open your terminal (PowerShell or Command Prompt) in the project root directory and run these commands in order:

**1. Start the local AI Engine (Layer 5 — Required on Windows Host):**
Open a separate PowerShell terminal and run:
```bash
$env:OLLAMA_HOST="0.0.0.0"
ollama serve
```
*(Leave this terminal window open in the background so the Docker containers can reach the AI).*

**2. Wipe all existing containers, volumes, and orphaned networks:**
```bash
docker-compose down -v --remove-orphans
```

**3. Build completely fresh (ignoring all caches):**
```bash
docker-compose build --no-cache
```

**4. Start the containers in detached mode:**
```bash
docker-compose up -d --force-recreate
```

**Boot Sequence:**
1. **Database (Layer 4)** starts first.
2. **Backend (Layer 3)** waits for the database to be healthy before starting.
3. **Frontend Webpage (Layer 1)** waits for the backend, served on Port 3000.
4. **Frontend Admin (Layer 2)** waits for the backend, served on Port 3001.
5. **Model AI (Layer 5)** runs on the host via Ollama, reached by backend via `host.docker.internal:11434`.

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

## Step 4: Verify Local & Wi-Fi Hosting

Because the backend is bound to `0.0.0.0:8000` inside its container and exposed on the host, you can access the API from **any device connected to the same Wi-Fi network** using the Wi-Fi IP (`192.168.15.194`).

**Access URLs:**
- **Public Landing Page:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3001/admin](http://localhost:3001/admin)
  *(Log in using the superuser credentials you created in Step 3)*
- **Django API:** [http://192.168.15.194:8000/api](http://192.168.15.194:8000/api)

---

## Step 5: Viewing Logs & Troubleshooting

If a specific layer isn't loading, you can monitor the live Docker logs.

```bash
# View combined logs for all layers
docker-compose logs -f

# View logs for the Frontend Webpage (Layer 1)
docker-compose logs -f frontend-webpage

# View logs for the Frontend Admin (Layer 2)
docker-compose logs -f frontend-admin

# View logs for the Backend (Layer 3)
docker-compose logs -f backend

# View logs for the Database (Layer 4)
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

---

## Step 7: Command Cheat Sheet

Here is a quick reference guide for what commands to use and when:

### Normally Used Commands (Everyday usage)
- **Start the system**: `docker-compose up -d`
- **Stop the system safely**: `docker-compose down`
- **View all logs**: `docker-compose logs -f`
- **Start the AI Engine (Host)**: `$env:OLLAMA_HOST="0.0.0.0"; ollama serve`

### Occasionally Used Commands (Updates or minor fixes)
- **Rebuild after making code changes**: `docker-compose up -d --build`
- **Apply new database migrations**: `docker-compose exec backend python manage.py migrate`
- **View backend errors only**: `docker-compose logs -f backend`

### Rarely Used Commands (Emergency / Fresh Starts only)
- **Wipe everything (Nuke command)**: `docker-compose down -v --remove-orphans` *(Warning: This deletes all database entries and users!)*
- **Complete fresh rebuild without cache**: `docker-compose build --no-cache`
- **Create a new admin user**: `docker-compose exec backend python manage.py createsuperuser`
- **Access the backend terminal shell**: `docker-compose exec backend bash`
