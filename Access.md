# JRMSU Library System — Access & Sharing Guide

This document explains how to access all 4 layers of your Dockerized Library System
and how to share it with classmates over Wi-Fi / Hotspot.

---

## Prerequisites

Make sure Docker Desktop is running, then start the system:

```bash
docker-compose up -d
```

To stop all containers:

```bash
docker-compose down
```

---

## Layer 1 — Public Webpage (Frontend)

| Item       | Value                         |
|------------|-------------------------------|
| URL        | http://localhost:3000         |
| What it is | Student-facing library site   |

Open your browser and navigate to http://localhost:3000

---

## Layer 2 — Admin Panel (Frontend)

| Item       | Value                         |
|------------|-------------------------------|
| URL        | http://localhost:3001         |
| Username   | admin                         |
| Password   | admin123                      |
| What it is | Library management panel      |

Open your browser and navigate to http://localhost:3001

---

## Layer 3 — Backend API (Django / DRF)

| Item              | Value                              |
|-------------------|------------------------------------|
| API Root          | http://localhost:8000/api          |
| Django Admin      | http://localhost:8000/admin        |
| What it is        | JSON REST API powering the system  |

### How to test the API in your browser

Navigate to any of these endpoints directly in your browser or use a tool like
Postman or Insomnia:

```
GET  http://localhost:8000/api/books/
GET  http://localhost:8000/api/eresources/
GET  http://localhost:8000/api/managed-files/
GET  http://localhost:8000/api/analytics/
```

---

## Terminal — Accessing the Backend Container

While Docker is running, open PowerShell or Command Prompt:

### Enter an interactive Linux shell inside the backend container:

```bash
docker-compose exec backend bash
```

Type `exit` to leave the container shell.

### Run any Django management command directly:

```bash
# Apply database migrations
docker-compose exec backend python manage.py migrate

# Open the Django interactive Python shell
docker-compose exec backend python manage.py shell

# Create a new superuser account
docker-compose exec backend python manage.py createsuperuser

# Check which migrations have been applied
docker-compose exec backend python manage.py showmigrations

# Import all assets: eBooks, images, Org Structure, Excellence, Background, Personnel (Maam Kiara)
docker-compose exec backend python manage.py imports_assets

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

### View live logs from a container:

```bash
# Backend logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f db

# All containers at once
docker-compose logs -f
```

### Check container status:

```bash
docker-compose ps
```

---

## Layer 4 — Database (PostgreSQL)

The database runs in the background. You do NOT access it through a browser.

| Item       | Value                        |
|------------|------------------------------|
| Host       | localhost                    |
| Port       | 5432                         |
| Database   | jrmsu_library                |
| Username   | jrmsu_admin                  |
| Password   | JRMSULibrary2026Secure!      |

### Option A — Connect via terminal (psql inside the container):

```bash
docker-compose exec db psql -U jrmsu_admin -d jrmsu_library
```

Useful psql commands once inside:

```sql
-- List all tables
\dt

-- Count books
SELECT COUNT(*) FROM "Features_book";

-- Exit psql
\q
```

### Option B — Connect using a GUI tool (recommended):

Download one of these free tools and connect with the credentials above:

- DBeaver Community (https://dbeaver.io) — Recommended
- pgAdmin 4 (https://www.pgadmin.org)

---

## Sharing With Classmates (Hotspot / Wi-Fi)

YES, you can share the running system with classmates without deploying to the cloud.

### Step 1 — Find your laptop IP address

Open PowerShell and run:

```bash
ipconfig
```

Look for the IPv4 Address under your active network adapter:
- Wi-Fi adapter  →  something like 192.168.1.5
- Mobile Hotspot →  something like 192.168.137.1

### Step 2 — Connect classmates to the same network

Option A (Hotspot): Turn on Windows Mobile Hotspot in Settings. Your classmates
connect to your hotspot Wi-Fi.

Option B (Router): Everyone connects to the same Wi-Fi router.

### Step 3 — Classmates open the app in their browser

Replace YOUR_IP with your actual IP address found in Step 1:

```
Webpage:      http://YOUR_IP:3000
Admin Panel:  http://YOUR_IP:3001
API:          http://YOUR_IP:8000/api
```

### IMPORTANT — Fix the API URL before sharing

By default, the frontend is built to call http://localhost:8000/api.
When a classmate opens the app on their device, "localhost" refers to their own
machine (not yours), so the API calls will fail.

To fix this, update the docker-compose.yml VITE_API_BASE_URL argument
to your actual IP and rebuild:

```yaml
args:
  VITE_API_BASE_URL: http://192.168.137.1:8000/api    # <-- your IP here
  VITE_APP_MODE: webpage
```

Then rebuild:

```bash
docker-compose build --no-cache
docker-compose up -d
```

After that, classmates can fully use the app from their devices on your Hotspot.

### Sharing the Project Files (for classmates to run it themselves)

If a classmate wants to run the project on their OWN laptop:

1. Copy the entire project folder (zip it first to avoid .git bloat):
   - Right-click the project folder > Send to > Compressed (zipped) folder
   - Share the zip file via USB, Google Drive, or Telegram

2. They must install Docker Desktop first:
   https://www.docker.com/products/docker-desktop/

3. They unzip the project, then open PowerShell inside the folder and run:
   ```bash
   docker-compose up -d --build
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py imports_assets
   ```

4. They open http://localhost:3000 and it works on their machine too!

### 3.7 Self-Healing & Auto-Scaling (HPA)

Kubernetes automatically provides **Self-Healing** through **Liveness and Readiness Probes**. If your server crashes or becomes unresponsive, Kubernetes will detect the failure and automatically restart the pod to bring the system back online.

To handle dynamic traffic (scaling up when there are many requests and scaling down when traffic is low), we use **Horizontal Pod Autoscaling (HPA)**.

To apply this Auto-Scaling and Self-Healing configuration to your cluster, run:
```bash
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/hpa.yaml
```

Verify the HPA is running:
```bash
kubectl get hpa -n jrmsu-library
```

### 🚀 One-Click Kubernetes Start/Stop Scripts
For convenience, two helper scripts have been added to the project root:
- **Start Cluster**: Run `.\start-k8s.ps1` in PowerShell to automatically apply all configurations in the correct order.
- **Stop Cluster**: Run `.\stop-k8s.ps1` in PowerShell to cleanly shut down and delete the cluster resources.

---

## What's New: Terminal Admin Protection & Management
*Feature Update (July 2026)*

**1. Protection for Terminal-Created Admins:**
If an admin is created via the terminal using either `python manage.py createsuperuser` or `python manage.py createsuperuser_custom`, they are permanently flagged as a **Terminal-Created Admin**.
- **Security Rule:** Any admin created via the system's Admin Panel UI is strictly prohibited from modifying, suspending, or deleting Terminal-Created Admins.
- This ensures developers/sysadmins cannot be locked out by UI staff.

**2. The `deletespecificsuperuser` Command:**
To manage Terminal-Created Admins, a dedicated terminal command is now available:
- It exclusively targets admins created via the terminal (UI-created admins are ignored).
- It provides a safe, interactive menu to list, delete a specific admin, or bulk-delete all terminal-created admins.

**Usage:**
- **No Docker (Local):** 
  ```bash
  python manage.py deletespecificsuperuser
  ```
- **Docker Mode:** 
  ```bash
  docker-compose exec backend python manage.py deletespecificsuperuser
  ```
