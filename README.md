# JRMSU Library - Katipunan Campus

![JRMSU Logo](./frontend/public/android-chrome-192x192.png)

A modern, highly interactive, and AI-powered web platform for the Jose Rizal Memorial State University (JRMSU) Library, Katipunan Campus. This system serves as the digital front door for the library, offering students seamless access to e-resources, physical book catalogs, real-time library status, and an integrated AI research assistant.

---

## 🌟 Key Features
- **Real-Time Philippine Time Clock:** Signature hero section clock (JetBrains Mono, gold, blinking colons) synchronized to UTC+8.
- **E-Resources Integration:** Integrated proxy handlers for Scholaar and VitalSource.
- **AI Research Assistant:** Powered locally by Ollama (Qwen 2.5), capable of assisting students with research queries without external API costs.
- **Email & Reservations:** SMTP-powered reservation system.
- **Terminal Admin Protection:** Specialized security feature that protects sysadmin accounts created via terminal from being modified or deleted by web UI users.
- **Vertical-Slice Architecture:** Both the frontend and backend are structured for maximum scalability and feature isolation.

## 🛠️ Technology Stack
**Frontend:**
- React 19 + TypeScript 5.8
- Vite 6
- Tailwind CSS v4
- React Router DOM v7
- Architecture: Vertical-Slice (`Pages/` -> `Features/` -> `Components/`)

**Backend:**
- Django + Django REST Framework (DRF)
- Database: Microsoft SQL Server (Local) / PostgreSQL (Docker)
- Background Tasks: Celery + Redis
- Architecture: API Controllers -> Services -> Repositories -> Models

**AI Engine:**
- Ollama (running `qwen2.5:1.5b`)

**Deployment:**
- Docker & Docker Compose (fully containerized 5-layer stack)
- Kubernetes (HPA ready for auto-scaling)

---

## 🚀 Quick Start (Docker - Recommended)

The fastest way to get the entire 5-layer stack (Frontend, Backend, Database, Redis, and AI) running is using Docker.

**1. Clone the repository and configure environments:**
Copy `.env.docker` to `.env` in the root directory and fill in your passwords (especially the Gmail App Password for SMTP).

**2. Build and start the containers:**
```bash
docker-compose up --build -d
```

**3. Initial Database Setup:**
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py imports_assets
```

**4. Access the system:**
- **Public Webpage:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3001
- **API Endpoint:** http://localhost:8000/api

---

## 💻 Local Development (Without Docker)
For detailed instructions on running the system natively on Windows (using SSMS 19 and Node.js directly), please refer to the [DevSetup.md](./DevSetup.md) documentation file.

---

## 🎨 UI/UX Design System
This project adheres to a strict "UI-UX Pro Max" guideline:
- **Colors:** Navy (`#002B7F`), Gold (`#C9A84C`), Deep Navy (`#001655`).
- **Typography:** Playfair Display (Headings), Inter (Body), JetBrains Mono (Clock).
- **Accessibility (WCAG 2.1 AA):** High contrast ratios, strict focus-visible rings for keyboard navigation, and responsive touch targets (48x48dp minimum).
- **Mobile-First:** Fully responsive breakpoints without any horizontal scrolling.

---

## 🔐 Security & Administration
To protect core system integrity, this project includes a **Terminal-Created Admin Protection** feature. Admins generated via `createsuperuser` cannot be modified by standard web interface administrators. 

To manage these terminal admins, use the custom command:
```bash
python manage.py deletespecificsuperuser
```

---

## 🏗️ Architecture & Flowchains

All code in this project follows a strict **Vertical Slice** (Frontend) and **Layered Model-First** (Backend) architecture as defined in `SKILL.md`.

### 1. Frontend Flow Chain
```text
Pages
  ↓  (route-level composition only)
Features
  ↓  (business logic and workflows)
Hooks / State / API (Endpoints)
  ↓  (reusable logic, shared state, backend calls)
Shared Components
  ↓  (presentational primitives only)
Libs / Utilities
  ↓  (infrastructure: auth, clients, helpers)
Assets
```

### 2. Backend Flow Chain
```text
Models
  ↓
Enums
  ↓
Django ORM
  ↓
Repository Implementation
  ↓
Repository Interface
  ↓
Service Implementation
  ↓
Service Interface
  ↓
Helpers
  ↓
API Controllers
  ↓
Middleware
  ↓
manage.py → settings.py → Custom Management Commands
```

### 3. HTTP Request Flow Chain
```text
Incoming Request
  ↓
Django Middleware  (rate limit, CSRF, auth guards, idempotency)
  ↓
API Controller    (parse request, call service, return response)
  ↓
Service Layer     (validate, enforce rules, orchestrate)
  ↓
Repository Layer  (query, persist, filter)
  ↓
Database          (final state)
```

---

## 📂 Code Placement Decision Guide (Where Does X Go?)

When placing new code, ask these questions in order:

```text
Is it a page route entry point?        → Pages/
Is it feature-specific UI or workflow? → Features/{FeatureName}/components/
Is it a backend API call?              → Endpoints/
Is it reusable UI used in 2+ places?   → Components/Shared/ or Components/Modals/
Is it a global layout element?         → Components/LayoutBars/
Is it a shared hook?                   → Hooks/
Is it static data / link list?         → Libs/Assets/
Is it a static image or media file?    → Assets/
Is it global CSS or color tokens?      → LayoutStyles/
Is it a Django model?                  → Features/Data/Models/
Is it database access logic?           → Features/Repositories/
Is it business logic / rules?          → Features/Services/
Is it an API endpoint handler?         → Features/Api/Controllers/
Is it external system setup?           → Features/Infrastructure/
Is it cache logic?                     → Features/Infrastructure/Cache/
```

### Strict Universal Rules
- **NEVER** violate the flow chain.
- **NEVER** put business logic in controllers (Controllers just pass requests to Services).
- **NEVER** put database queries in middleware.
- **NEVER** put API calls in page components.
- **NEVER** skip layers in the chain.

---

## 📚 Project Documentation
For more in-depth guides, please refer to the markdown files in the project root:
- `DevSetup.md`: Complete local and Docker setup guide.
- `SETUP.md`: Developer workflow setup.
- `Deploy.md`: Cloud deployment pros, cons, and setup.
- `Access.md`: Detailed port and networking documentation.
- `FreshBuildandStartdocker.md`: Docker rebuilding references.
- `SKILL.md`: Source of truth for architectural constraints.
