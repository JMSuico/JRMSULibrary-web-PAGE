# JRMSU Library Landing Page — SETUP

This file covers two deployment modes:
- **Mode A — Local Development** (SSMS 19 + npm run dev)
- **Mode B — Docker Demo** (All 4 layers containerized, no installs needed)

---

## Prerequisites

### Mode A — Local Development

| Tool                          | Version  | Download                                           |
|-------------------------------|----------|----------------------------------------------------|
| Node.js                       | >= 20    | https://nodejs.org                                 |
| Python                        | 3.11+    | https://python.org                                 |
| SQL Server (SSMS 19)          | Latest   | https://learn.microsoft.com/en-us/ssms/download    |
| ODBC Driver 17 for SQL Server | Latest   | https://learn.microsoft.com/en-us/sql/connect/odbc |

### Mode B — Docker Demo

| Tool            | Version | Download                                          |
|-----------------|---------|---------------------------------------------------|
| Docker Desktop  | Latest  | https://www.docker.com/products/docker-desktop/   |

No Node.js, Python, or SQL Server install needed for Docker mode.

---

## Mode A — Local Development (SSMS 19)

### 1. SQL Server 19 (SSMS) — Connection Details

| Setting         | Value                                                      |
|-----------------|------------------------------------------------------------|
| Server Name     | `localhost` or `.\SQLEXPRESS`                              |
| Authentication  | Windows Authentication OR SQL Server Authentication        |
| Port            | `1433` (default)                                           |
| Database Name   | `JRMSUKatipunanCampusLibrary`                              |
| ODBC Driver     | `ODBC Driver 17 for SQL Server`                            |

### 2. Database Setup (Interactive)

```bash
cd backend
python setup_db.py
```

This handles everything: creates the `.env` file, creates the database,
sets up login credentials, and grants permissions.

### 3. Backend — Django Setup

```bash
cd backend

# First time only: create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# (Optional) Create admin superuser
python manage.py createsuperuser

# Start backend server on port 8000
python manage.py runserver 8000
```

Backend loads at: http://localhost:8000

### 4. Frontend — React + Vite + Tailwind v4 Setup

Open a second terminal:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server on port 3000
npm run dev
```

Frontend loads at: http://localhost:3000

### 5. Run Both Together

| Terminal | Command                                                              | URL                    |
|----------|----------------------------------------------------------------------|------------------------|
| 1        | `cd backend && venv\Scripts\activate && python manage.py runserver 8000` | http://localhost:8000  |
| 2        | `cd frontend && npm run dev`                                         | http://localhost:3000  |

---

## Mode B — Docker Demo (Recommended for Sharing / Demo)

This runs all 4 layers (Webpage, Admin Panel, Backend, Database) in Docker
containers without needing to install Python, Node.js, or SQL Server.

### 1. Start the System

```bash
# Build and start all 4 containers
docker-compose up -d --build

# First time: apply database migrations
docker-compose exec backend python manage.py migrate

# First time: create admin account (skip if already created)
docker-compose exec backend python manage.py createsuperuser
```

### 2. Stop the System

```bash
docker-compose down
```

### 3. Access Points (Docker Mode)

| Layer   | What              | URL                            | Notes                          |
|---------|-------------------|--------------------------------|--------------------------------|
| Layer 1 | Public Webpage    | http://localhost:3000          | Student-facing library site    |
| Layer 2 | Admin Panel       | http://localhost:3001          | Login: admin / admin123        |
| Layer 3 | Backend API       | http://localhost:8000/api      | JSON REST API                  |
| Layer 3 | Django Admin      | http://localhost:8000/admin    | Raw Django admin panel         |
| Layer 4 | PostgreSQL DB     | localhost:5432                 | Use DBeaver or pgAdmin to view |

### 4. Database Credentials (Docker / PostgreSQL)

| Setting   | Value                    |
|-----------|--------------------------|
| Host      | localhost                |
| Port      | 5432                     |
| Database  | jrmsu_library            |
| Username  | jrmsu_admin              |
| Password  | JRMSULibrary2026Secure!  |

To access the database using a terminal:

```bash
docker-compose exec db psql -U jrmsu_admin -d jrmsu_library
```

Useful psql commands inside:

```sql
\dt            -- list all tables
\q             -- exit
SELECT COUNT(*) FROM "Features_book";
```

### 5. Terminal Access to Backend Container

While containers are running, use these commands:

```bash
# Enter interactive Linux shell inside the backend container
docker-compose exec backend bash

# Run Django management commands directly
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py showmigrations
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py createsuperuser

# View live container logs
docker-compose logs -f backend
docker-compose logs -f db

# Check all container status
docker-compose ps
```

### 6. Rebuild After Code Changes

If you change any Python or React source files:

```bash
# Rebuild specific service only
docker-compose build --no-cache backend
docker-compose up -d

# Or rebuild everything from scratch
docker-compose build --no-cache
docker-compose up -d
```

### 7. Sharing With Classmates (Hotspot / Wi-Fi)

**Step 1 — Find your laptop IP address:**

```bash
ipconfig
```

Look for IPv4 Address under your Wi-Fi or Hotspot adapter
(e.g., 192.168.1.5 or 192.168.137.1).

**Step 2 — Connect classmates to the same network:**
- Hotspot: Turn on Windows Mobile Hotspot in Settings.
- Router: Everyone joins the same Wi-Fi.

**Step 3 — Classmates open in their browser:**

```
Webpage:      http://YOUR_IP:3000
Admin Panel:  http://YOUR_IP:3001
API:          http://YOUR_IP:8000/api
```

**IMPORTANT — Fix the API URL for network sharing:**

Edit `docker-compose.yml` and change `VITE_API_BASE_URL` to your real IP:

```yaml
args:
  VITE_API_BASE_URL: http://192.168.137.1:8000/api    # replace with your IP
```

Then rebuild:

```bash
docker-compose build --no-cache
docker-compose up -d
```

**Sharing project files to classmates (for them to run on their own laptop):**
1. Zip the project folder and share via USB / Google Drive / Telegram.
2. They install Docker Desktop from https://www.docker.com/products/docker-desktop/
3. They unzip and run:
   ```bash
   docker-compose up -d --build
   docker-compose exec backend python manage.py migrate
   ```
4. They open http://localhost:3000 and it works on their machine!

---

## Migration Cheat Sheet

| Task                         | Local (Mode A)                                    | Docker (Mode B)                                               |
|------------------------------|---------------------------------------------------|---------------------------------------------------------------|
| Apply migrations             | `python manage.py migrate`                        | `docker-compose exec backend python manage.py migrate`        |
| Generate new migrations      | `python manage.py makemigrations`                 | `docker-compose exec backend python manage.py makemigrations` |
| Show migration status        | `python manage.py showmigrations`                 | `docker-compose exec backend python manage.py showmigrations` |
| Create superuser             | `python manage.py createsuperuser`                | `docker-compose exec backend python manage.py createsuperuser`|
| Open Django shell            | `python manage.py shell`                          | `docker-compose exec backend python manage.py shell`          |

---

## Key URLs

| Page              | Local (Mode A)                       | Docker (Mode B)               |
|-------------------|--------------------------------------|-------------------------------|
| Webpage           | http://localhost:3000                | http://localhost:3000         |
| Admin Panel       | http://localhost:3000/admin          | http://localhost:3001         |
| Backend API       | http://localhost:8000/api            | http://localhost:8000/api     |
| Django Admin      | http://localhost:8000/admin          | http://localhost:8000/admin   |
| Books API         | http://localhost:8000/api/books      | Same                          |
| E-Resources API   | http://localhost:8000/api/files      | Same                          |
| Gallery API       | http://localhost:8000/api/gallery    | Same                          |
| Contact API       | http://localhost:8000/api/contact    | Same                          |
| Managed Files API | http://localhost:8000/api/managed-files | Same                       |
| Auth Login        | POST /api/auth/login                 | Same                          |

---

## Troubleshooting

| Symptom                                 | Fix                                                              |
|-----------------------------------------|------------------------------------------------------------------|
| `'python' is not recognized`            | Install Python 3.11+ and add to PATH                            |
| `'npm' is not recognized`               | Install Node.js 20+ and add to PATH                             |
| `ModuleNotFoundError`                   | `pip install -r requirements.txt`                               |
| `CORS error in browser`                 | Ensure Django runs on port 8000                                  |
| `pyodbc.InterfaceError`                 | Install ODBC Driver 17 for SQL Server                           |
| `django.db.utils.OperationalError`      | Ensure SQL Server service is running in Windows Services         |
| `Login failed for user`                 | Use Windows Authentication and set `Trusted_Connection=yes`      |
| Docker: `vite: not found`               | Run `docker-compose build --no-cache` to bust broken cache       |
| Docker: `mssql module not found`        | `DB_ENGINE=postgresql` is set in Dockerfile — this is correct    |
| Docker: `STATIC_ROOT not set`           | Already fixed in settings.py — rebuild if this happens           |
| Docker: `Host not allowed`              | Check `ALLOWED_HOSTS=*` is set in docker-compose.yml environment |
| Classmates cannot load from Hotspot     | Update `VITE_API_BASE_URL` in docker-compose.yml to your IP      |

---

## Project Layout (Quick Reference)

```
JRMSU LIBRARY LANDING PAGE/           <- root
├── frontend/                         <- Layer 1 & 2: React + Vite + Tailwind v4
│   ├── src/
│   │   ├── Pages/                    <- Route-level page wrappers (no business logic)
│   │   ├── Features/                 <- Vertical-slice domain features + business logic
│   │   ├── Components/               <- Shared UI primitives only
│   │   ├── Hooks/                    <- Global hooks
│   │   ├── Libs/                     <- Constants, data, links
│   │   └── LayoutStyles/             <- Global CSS tokens (index.css)
│   ├── Dockerfile                    <- Docker build for frontend
│   ├── nginx.conf                    <- Nginx SPA routing config
│   └── package.json
├── backend/                          <- Layer 3: Django + DRF API
│   ├── core/                         <- settings.py, urls.py, wsgi.py
│   ├── Features/                     <- Domain: Models, API, Services, Repos
│   │   ├── Api/Controllers/
│   │   ├── Api/Serializers/
│   │   ├── Api/Routes/
│   │   ├── Data/Models/
│   │   ├── Data/Enums/
│   │   ├── Repositories/
│   │   ├── Services/
│   │   └── Helpers/
│   ├── Dockerfile                    <- Docker build for backend
│   ├── requirements.txt              <- Local dev requirements (MSSQL)
│   ├── requirements-docker.txt       <- Docker requirements (PostgreSQL, no MSSQL)
│   ├── manage.py
│   └── setup_db.py                   <- Interactive local DB setup
├── k8s/                              <- Kubernetes manifests (cloud deployment)
├── docker-compose.yml                <- Orchestrates all 4 layers
├── .env                              <- Docker environment variables (never commit!)
├── .env.docker                       <- Template for .env
├── Access.md                         <- How to access all layers + sharing guide
├── demo.md                           <- Docker demo walkthrough
├── SETUP.md                          <- this file
├── SKILL.md                          <- Architecture rules and flow chains
└── AGENTS.md                         <- Agent conventions
```

---

## Flow Chains — Core Architecture Principles

### Frontend Flow Chain

```
Pages
  -> (route-level composition only)
Features
  -> (business logic and workflows)
Hooks / State / API Endpoints
  -> (reusable logic, shared state, backend calls)
Shared Components
  -> (presentational primitives only)
Libs / Utilities / Assets
```

### Backend Flow Chain

```
Models (Data/Models/)
  -> Enums (Data/Enums/)
  -> Django ORM
  -> Repository Implementation
  -> Repository Interface
  -> Service Implementation
  -> Service Interface
  -> Helpers
  -> API Controllers
  -> Middleware
  -> manage.py -> settings.py -> Custom Management Commands
```

### HTTP Request Flow Chain

```
Incoming Request
  -> Django Middleware  (rate limit, CSRF, auth guards)
  -> API Controller    (parse request, call service, return response)
  -> Service Layer     (validate, enforce rules, orchestrate)
  -> Repository Layer  (query, persist, filter)
  -> Database          (final state)
```
