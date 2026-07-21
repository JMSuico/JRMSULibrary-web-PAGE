# 🐳 JRMSU Library — Docker Cheat Sheet & Fresh Start Guide

This guide is your one-stop reference for managing, building, and troubleshooting the Dockerized 5-Layer JRMSU Library System.

---

## 🌐 1. How to Access the System

Once the Docker containers are successfully running, you can access the different parts of the system at these URLs (assuming you are on the same machine):

| Component | URL / Connection | Description |
|-----------|------------------|-------------|
| **Frontend Webpage** | `http://localhost:3000` | The public-facing library website for students. |
| **Frontend Admin** | `http://localhost:3001/admin` | The secure admin dashboard for staff. |
| **Backend API** | `http://localhost:8000/api` | The Django REST Framework JSON API. |
| **Backend Admin** | `http://localhost:8000/admin` | The raw Django backend admin panel. |
| **Database** | `localhost:5432` | PostgreSQL database (Access via DBeaver or pgAdmin using the credentials in your `.env`). |
| **Model AI** | `http://localhost:11434` | The internal Ollama API running Qwen2.5:1.5b. |

*(Note: If you are sharing the system over Wi-Fi, replace `localhost` with your Wi-Fi IP address, e.g., `http://192.168.15.194:3000`)*

---

## 🏗️ 2. Build, Run, and Stop Commands

### 🧹 The "Clean Slate" Build (Fresh / Clean Build)
Use this when you are encountering weird caching issues, broken packages, or want to start completely fresh. **This is the most reliable way to build.**

```bash
# 1. Stop everything, delete containers, and wipe volumes (WARNING: Deletes database data!)
docker-compose down -v --remove-orphans

# 2. Rebuild all images from scratch, ignoring cached files
docker-compose build --no-cache

# 3. Start the containers in the background
docker-compose up -d --force-recreate
```

### 🔨 Standard Build (Update All)
Use this when you've just modified some code across the project and want to update all containers without wiping your database.

```bash
docker-compose up -d --build
```

### 🎯 Targeted Build (Update a Single Service)
Use this when you've only made changes to **one specific area** (e.g. only the backend or only the frontend webpage). This is much faster because it skips checking and building the other containers.

### Build only specific containers
If you want to build only specific containers (for example, to avoid pulling large AI models again), you can run:

```bash
docker-compose up -d --build backend frontend-webpage frontend-admin redis db
```

Or individually:
```bash
docker-compose up -d --build frontend-webpage
```
```bash
docker-compose up -d --build frontend-admin
```
```bash
docker-compose up -d --build backend
```
```bash
docker-compose up -d --build redis
```
```bash
docker-compose up -d --build db
```
```bash
docker-compose up -d --build ollama
```

### 🚀 How to Run
If the system is already built and just stopped, start it up with:

```bash
docker-compose up -d
```

### 🛑 How to Stop
To safely shut down the containers while preserving your database and media files:

```bash
docker-compose down
```

---

## 🛠️ 3. Command Cheat Sheet by Frequency

### 🌟 Most Important / Daily Commands
These are the commands you will use every single day you work on the project.

| Action | Command |
|--------|---------|
| **Start the system** | `docker-compose up -d` |
| **Stop the system** | `docker-compose down` |
| **View all live logs** | `docker-compose logs -f` |
| **Apply code updates** | `docker-compose up -d --build` |

---

### 🔧 Troubleshooting Commands
Use these when things go wrong and you need to investigate.

| Action | Command |
|--------|---------|
| **View Backend Errors** | `docker-compose logs -f backend` |
| **View Frontend Errors** | `docker-compose logs -f frontend-webpage` |
| **View DB/SQL Errors** | `docker-compose logs -f db` |
| **Check AI Download Status**| `docker-compose logs -f ollama-init` |
| **Check Container Status** | `docker-compose ps` |
| **Enter Backend Shell** | `docker-compose exec backend bash` |
| **Enter DB Shell (psql)** | `docker-compose exec db psql -U jrmsu_admin -d jrmsu_library` |

---

### 🔄 Sometimes Used Commands
Use these occasionally, mostly when modifying the database structure or adding new staff members.

| Action | Command |
|--------|---------|
| **Apply DB Migrations** | `docker-compose exec backend python manage.py migrate` |
| **Create DB Migrations**| `docker-compose exec backend python manage.py makemigrations` |
| **Create Admin Account**| `docker-compose exec backend python manage.py createsuperuser` |
| **Import eBooks**       | `docker-compose exec backend python manage.py imports_assets` |
| **Open Django Console** | `docker-compose exec backend python manage.py shell` |
| **Rebuild one service** | `docker-compose build --no-cache backend` |

---

### ⚠️ Rarely Used Commands (Danger Zone)
Use these with extreme caution!

| Action | Command | Warning |
|--------|---------|---------|
| **Nuke Everything** | `docker-compose down -v --remove-orphans` | Permanently deletes all database records and uploaded media! |
| **Flush Database** | `docker-compose exec backend python manage.py flush` | Deletes all data in the database but keeps the tables. |
| **System Prune** | `docker system prune -a --volumes` | Deletes ALL unused Docker data on your entire computer (reclaims disk space). |

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
 docker-compose build --no-cache frontend-admin ; docker-compose up -d frontend-admin ; docker-compose build --no-cache frontend-webpage ; docker-compose up -d frontend-webpage ; docker-compose up -d --build backend