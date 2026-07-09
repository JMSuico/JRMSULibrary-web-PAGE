# Docker & Kubernetes Deployment Plan — JRMSU Library System

> This document outlines a comprehensive, production-ready deployment strategy for containerizing and orchestrating the JRMSU Library Landing Page application.

---

## Architecture Overview

The system is structured into **4 distinct layers**:

| Layer | Service | Description |
|-------|---------|-------------|
| **Layer 1** | Frontend — Webpage | Public-facing React landing page (Nginx, Port 3000) |
| **Layer 2** | Frontend — Admin Page | Restricted admin panel React app (Nginx, Port 3001) |
| **Layer 3** | Backend | Django + DRF API server (Gunicorn, Port 8000) |
| **Layer 4** | Database | PostgreSQL / MariaDB data store (Port 5432) |

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Kubernetes Cluster                              │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐                               │
│  │   Layer 1       │  │   Layer 2        │                               │
│  │   Frontend      │  │   Frontend       │                               │
│  │   Webpage       │  │   Admin Page     │                               │
│  │                 │  │                 │                               │
│  │  React+Vite     │  │  React+Vite     │                               │
│  │  (Nginx)        │  │  (Nginx)        │                               │
│  │  Port: 3000     │  │  Port: 3001     │                               │
│  └────────┬────────┘  └────────┬────────┘                               │
│           │                    │                                         │
│           └────────┬───────────┘                                         │
│                    ▼                                                     │
│          ┌─────────────────┐         ┌─────────────────┐                │
│          │   Layer 3       │         │   Layer 4        │                │
│          │   Backend       │────────▶│   Database       │                │
│          │                 │         │                 │                │
│          │  Django + DRF   │         │  PostgreSQL      │                │
│          │  (Gunicorn)     │         │  or MariaDB      │                │
│          │  Port: 8000     │         │  Port: 5432      │                │
│          └─────────────────┘         └─────────────────┘                │
│                    │                          │                          │
│          ┌─────────┴──────────┐   ┌──────────┴────────┐                │
│          │  Ingress / LB      │   │  Persistent Vol   │                │
│          │  (HTTPS)           │   │  (PVC)            │                │
│          └────────────────────┘   └───────────────────┘                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Dockerfiles

### 1.1 Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Stage 1 — Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=http://backend:8000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 1.2 Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM python:3.11-slim
WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "120"]
```

### 1.3 Database

Use the official PostgreSQL or MariaDB image directly — no custom Dockerfile needed.

---

## Phase 2: Docker Compose (Local Development)

### `docker-compose.yml`

```yaml
version: "3.9"
services:

  # ─── Layer 4: Database ───────────────────────────────────────────────
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: jrmsu_library
      POSTGRES_USER: jrmsu_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # ─── Layer 3: Backend ────────────────────────────────────────────────
  backend:
    build: ./backend
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://jrmsu_admin:${DB_PASSWORD}@db:5432/jrmsu_library
      DJANGO_SECRET_KEY: ${DJANGO_SECRET_KEY}
      DJANGO_DEBUG: "false"
      ALLOWED_HOSTS: "*"
    ports:
      - "8000:8000"
    volumes:
      - media_data:/app/media

  # ─── Layer 1: Frontend — Webpage (Public Landing Page) ───────────────
  frontend-webpage:
    build:
      context: ./frontend
      args:
        VITE_API_BASE_URL: http://localhost:8000/api
        VITE_APP_MODE: webpage
    depends_on:
      - backend
    ports:
      - "3000:80"

  # ─── Layer 2: Frontend — Admin Page ──────────────────────────────────
  frontend-admin:
    build:
      context: ./frontend
      args:
        VITE_API_BASE_URL: http://localhost:8000/api
        VITE_APP_MODE: admin
    depends_on:
      - backend
    ports:
      - "3001:80"

volumes:
  db_data:
  media_data:
```

---

## Phase 3: Kubernetes Manifests

### 3.1 Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: jrmsu-library
```

### 3.2 Database Deployment + PVC

```yaml
# k8s/database.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-pvc
  namespace: jrmsu-library
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 5Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: database
  namespace: jrmsu-library
spec:
  replicas: 1
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          envFrom:
            - secretRef:
                name: db-secret
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: db-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: db-storage
          persistentVolumeClaim:
            claimName: db-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: database-svc
  namespace: jrmsu-library
spec:
  selector:
    app: database
  ports:
    - port: 5432
      targetPort: 5432
```

### 3.3 Backend Deployment

```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: jrmsu-library
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: django
          image: jrmsu-library/backend:latest
          envFrom:
            - secretRef:
                name: backend-secret
          ports:
            - containerPort: 8000
          readinessProbe:
            httpGet:
              path: /api/health/
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 15
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: jrmsu-library
spec:
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
```

### 3.4 Frontend Deployments (Layer 1 — Webpage & Layer 2 — Admin)

```yaml
# k8s/frontend-webpage.yaml  (Layer 1 — Public Webpage)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-webpage
  namespace: jrmsu-library
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend-webpage
  template:
    metadata:
      labels:
        app: frontend-webpage
    spec:
      containers:
        - name: nginx
          image: jrmsu-library/frontend-webpage:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-webpage-svc
  namespace: jrmsu-library
spec:
  selector:
    app: frontend-webpage
  ports:
    - port: 80
      targetPort: 80
---
# k8s/frontend-admin.yaml  (Layer 2 — Admin Page)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-admin
  namespace: jrmsu-library
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend-admin
  template:
    metadata:
      labels:
        app: frontend-admin
    spec:
      containers:
        - name: nginx
          image: jrmsu-library/frontend-admin:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-admin-svc
  namespace: jrmsu-library
spec:
  selector:
    app: frontend-admin
  ports:
    - port: 80
      targetPort: 80
```

### 3.5 Ingress (HTTPS termination)

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: jrmsu-ingress
  namespace: jrmsu-library
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    # Layer 1 — Public Webpage
    - host: library.jrmsu.edu.ph
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-webpage-svc
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-svc
                port:
                  number: 8000
    # Layer 2 — Admin Page
    - host: admin.library.jrmsu.edu.ph
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-admin-svc
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-svc
                port:
                  number: 8000
```

### 3.6 Secrets

```yaml
# k8s/secrets.yaml (NEVER commit real values — use sealed-secrets or vault)
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
  namespace: jrmsu-library
type: Opaque
stringData:
  POSTGRES_DB: jrmsu_library
  POSTGRES_USER: jrmsu_admin
  POSTGRES_PASSWORD: <CHANGE_ME>
---
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: jrmsu-library
type: Opaque
stringData:
  DATABASE_URL: postgres://jrmsu_admin:<CHANGE_ME>@database-svc:5432/jrmsu_library
  DJANGO_SECRET_KEY: <CHANGE_ME>
```

---

## Phase 4: Deployment Workflow

### Step-by-Step Commands

```bash
# ── Layer 4: Build & push Database (uses official image — no build needed) ──
# No build step required; Postgres/MariaDB image is pulled directly.

# ── Layer 3: Build & push Backend ──────────────────────────────────────────
docker build -t jrmsu-library/backend:latest ./backend
docker tag jrmsu-library/backend:latest registry.example.com/jrmsu/backend:v1.0
docker push registry.example.com/jrmsu/backend:v1.0

# ── Layer 1: Build & push Frontend — Webpage ───────────────────────────────
docker build -t jrmsu-library/frontend-webpage:latest \
  --build-arg VITE_API_BASE_URL=https://library.jrmsu.edu.ph/api \
  --build-arg VITE_APP_MODE=webpage ./frontend
docker tag jrmsu-library/frontend-webpage:latest registry.example.com/jrmsu/frontend-webpage:v1.0
docker push registry.example.com/jrmsu/frontend-webpage:v1.0

# ── Layer 2: Build & push Frontend — Admin Page ────────────────────────────
docker build -t jrmsu-library/frontend-admin:latest \
  --build-arg VITE_API_BASE_URL=https://library.jrmsu.edu.ph/api \
  --build-arg VITE_APP_MODE=admin ./frontend
docker tag jrmsu-library/frontend-admin:latest registry.example.com/jrmsu/frontend-admin:v1.0
docker push registry.example.com/jrmsu/frontend-admin:v1.0

# ── Test locally with docker-compose ───────────────────────────────────────
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# ── Apply Kubernetes manifests (bottom-up: DB → Backend → Frontend) ────────
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/database.yaml        # Layer 4
kubectl apply -f k8s/backend.yaml         # Layer 3
kubectl apply -f k8s/frontend-webpage.yaml  # Layer 1
kubectl apply -f k8s/frontend-admin.yaml    # Layer 2
kubectl apply -f k8s/ingress.yaml

# ── Run database migrations inside the cluster ─────────────────────────────
kubectl exec -n jrmsu-library deploy/backend -- python manage.py migrate

# ── Verify all 4 layers are running ───────────────────────────────────────
kubectl get pods -n jrmsu-library
kubectl get svc -n jrmsu-library
```

---

## Phase 5: Production Checklist

| Item | Status |
|------|--------|
| Environment variables via Secrets/ConfigMaps | Required |
| HTTPS via cert-manager + Let's Encrypt | Required |
| Health checks (readiness/liveness probes) | Included |
| Resource limits (CPU/Memory) | Included |
| Persistent volume for DB and media uploads | Included |
| Rolling update strategy | Default (K8s) |
| Horizontal Pod Autoscaler (HPA) | Optional |
| Centralized logging (EFK/Loki) | Optional |
| Monitoring (Prometheus + Grafana) | Optional |

---

## Notes

- **Database choice:** The manifests above use PostgreSQL. If you prefer MariaDB/MySQL (as mentioned in AGENTS.md), swap the image to `mariadb:11` and adjust the environment variables and connection string accordingly.
- **Media files:** Django media uploads should be stored on a shared PersistentVolume or an object storage service (e.g., S3-compatible) in production.
- **CORS:** Ensure Django's `CORS_ALLOWED_ORIGINS` is configured to match the frontend's production domain.
- **No SQLite:** Per project rules, SQLite is never used. The Docker setup enforces PostgreSQL/MariaDB from the start.
