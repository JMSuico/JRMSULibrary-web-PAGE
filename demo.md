# Local Hosting Demo Guide

This guide provides a step-by-step walkthrough to run the JRMSU Library System locally using Docker Compose, as outlined in Phase 2 of the Docker & Kubernetes Deployment Plan.

The system runs as **5 distinct layers**:

| Layer | Service | Local URL |
|-------|---------|------|
| **Layer 1** | Frontend Webpage | `http://localhost:3000` |
| **Layer 2** | Frontend Admin Page | `http://localhost:3001/admin` |
| **Layer 3** | Backend (Django + DRF API) | `http://localhost:8000` |
| **Layer 4** | Database (PostgreSQL) | `localhost:5432` |
| **Layer 5** | Model AI (Qwen2.5) | `http://localhost:11434` (Internal) |

## Prerequisites
- **Docker Desktop** (or Docker Engine + Docker Compose) installed and running.
- Your project should have the `docker-compose.yml` and `Dockerfile`s set up as defined in `implementationDockerandKubernates.md`.

## Step 1: Prepare the Environment
Create a `.env` file in the root directory (where `docker-compose.yml` is located) with the necessary variables:
```env
DB_PASSWORD=super_secure_db_password
DJANGO_SECRET_KEY=your_django_development_secret_key
```

## Step 2: Build and Start All 5 Layers
Open your terminal in the project root (PowerShell or Command Prompt) and run:
```bash
docker-compose up -d --build
```
*The `-d` flag runs the containers in the background, and `--build` ensures the latest code is built into images.*

This command starts all containers:
- **Layer 4 & 5** — Database and AI containers start first
- **Layer 5 Init** — Automatically downloads the `qwen2.5:1.5b` model in the background
- **Layer 3** — Backend container starts once the database is ready
- **Layer 1 & 2** — Frontend containers (Webpage & Admin) start once the backend is ready

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

3. **Import 4.8GB eBooks into Database:**
   ```bash
   docker-compose exec backend python manage.py import_ebooks
   ```
   *Make sure you have moved the eBooks folder to backend/media/e_resources/ on your host first!*

## Step 4: Verify Local Hosting
You can now access all layers in your web browser:

| Layer | Access URL | Description |
|-------|-----------|-------------|
| **Layer 1** | `http://localhost:3000` | Public landing page for library visitors |
| **Layer 2** | `http://localhost:3001/admin` | Restricted admin panel for library staff |
| **Layer 3** | `http://localhost:8000/api` | Django REST API & Django Admin (`/admin`) |
| **Layer 4** | `localhost:5432` | PostgreSQL database (via DBeaver, pgAdmin, etc.) |
| **Layer 5** | `http://localhost:11434` | Ollama Engine (Internal API) |

## Step 5: Viewing Logs (Troubleshooting)
If a layer fails to load or you encounter errors, you can view live logs:
```bash
# View logs for all layers combined
docker-compose logs -f

# View logs for a specific layer
docker-compose logs -f frontend-webpage   # Layer 1 — Webpage
docker-compose logs -f frontend-admin     # Layer 2 — Admin Page
docker-compose logs -f backend            # Layer 3 — Backend
docker-compose logs -f db                 # Layer 4 — Database
docker-compose logs -f ollama-init        # Check AI model download progress
```

## Step 6: Shutting Down
To stop the local hosting and remove the containers, run:
```bash
docker-compose down
```
> **WARNING:** If you want to completely wipe the database and uploaded media data to start fresh next time, add the `-v` flag: `docker-compose down -v`. Otherwise, your data is saved in Docker volumes.

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
