# JRMSU Library - Katipunan Campus

![JRMSU Logo](./frontend/public/assets/3d%20jrmsu%20logo.jpg)

A modern, highly interactive, and AI-powered web platform for the Jose Rizal Memorial State University (JRMSU) Library, Katipunan Campus. This system serves as the digital front door for the library, offering students seamless access to e-resources, physical book catalogs, real-time library status, and an integrated AI research assistant.

---

##  Key Features
- **Real-Time Philippine Time Clock:** Signature hero section clock (JetBrains Mono, gold, blinking colons) synchronized to UTC+8.
- **E-Resources Integration:** Integrated proxy handlers for Scholaar and VitalSource.
- **Dr. Rizal AI Research Assistant:** Powered 100% locally by Ollama (`qwen2.5:0.5b`), backed by a sub-10ms Redis FAQ cache for instant responses with zero external API fees.
- **AI Auto-Draft Email Replies:** Automated context-aware email response drafting powered by local Ollama for librarian staff efficiency.
- **Client-Side Offline Request Caching:** Automatic queueing of user interactions during temporary connectivity drops with seamless background resynchronization.
- **3-Tier Database Replication Suite:** Real-time local hot standby (`db-standby`), 1-click cloud sync to Supabase, automated backups, and 5-second emergency failover.
- **Cloudflare Zero Trust Tunnel:** Production access via `www.jrmsukclibrary.com` with zero exposed router ports and edge caching for low-bandwidth (500 kbps) campus resilience.
- **Zero-Download Secure Canvas Viewer:** Pure HTML5 Canvas rasterization for Local Books and Theses with transparent click shield, right-click context menu suppression, shortcut blocking (`Ctrl+S`, `Ctrl+P`, `Ctrl+U`, `F12`), -35° institutional diagonal watermark, and backend `Content-Disposition: inline` headers.
- **Automated Document Knowledge & OCR Pipeline:** High-speed document parser (`pypdf`, `mammoth`, OpenXML fallback) extracting structured table of contents, executive summaries, full text, and academic keywords from Local Books (`EResourceFile`) and Theses (`ResearchReference`) into the database (`0036_add_document_knowledge_ocr_fields`).
- **Deep Academic AI Grounding (Tier 3 RAG):** Dr. Jose Rizal AI actively searches and cites verified book chapters, course syllabi, and research methodologies/findings directly from the database to answer patron inquiries with zero hallucinations.
- **Terminal Admin Protection:** Specialized security preventing command-line-created sysadmins from being modified or deleted through web interfaces.
- **Vertical-Slice Architecture:** Both frontend and backend structured for maximum scalability and feature isolation.

##  Technology Stack
**Frontend:**
- React 19 + TypeScript 5.8
- Vite 6
- Tailwind CSS v4
- React Router DOM v7
- Architecture: Vertical-Slice with Global Calling Imports (`@/Shared`, `@/Hooks`, `@/LayoutBars`, `@/LayoutStyles`)

**Backend:**
- Django + Django REST Framework (DRF)
- Database: Microsoft SQL Server (Local) / PostgreSQL (Docker)
- Background Tasks: Celery + Redis
- Architecture: API Controllers -> Services -> Repositories -> Models

**AI Engine:**
- Ollama (running `qwen2.5:0.5b` (quantized local inference))

**Deployment:**
- Docker & Docker Compose (fully containerized 5-layer stack)
- Kubernetes (HPA ready for auto-scaling)

---

## 💻 Complete Command Master Reference (With Docker & Without Docker)

All commands in the JRMSU Library System can be executed either inside the containerized Docker environment or natively on bare metal (Local Windows / Linux development).

### 1. System Lifecycle & Service Management

| Action | With Docker (Recommended) | Without Docker (Local / Bare-Metal) |
|---|---|---|
| **Start the Full System** | `docker-compose up -d` | Run in 4 separate terminals:<br>1. Backend: `cd backend && .\venv\Scripts\activate && python manage.py runserver 8000`<br>2. Celery: `cd backend && .\venv\Scripts\activate && celery -A core worker -l info`<br>3. Webpage: `cd frontend && npm run dev`<br>4. Admin: `cd frontend && npm run dev -- --port 3001` |
| **Stop the System** | `docker-compose down` | Press `Ctrl + C` in each running terminal window |
| **Update All Code & Rebuild** | `docker-compose up -d --build` | Restart dev server (Vite uses instant HMR; Django auto-reloads on save) |
| **View Live Unified Logs** | `docker-compose logs -f` | Outputs directly into your active terminal windows |
| **View Backend Logs Only** | `docker-compose logs -f backend` | Check terminal 1 (Django console output) |
| **View Frontend Webpage Logs** | `docker-compose logs -f frontend-webpage` | Check terminal 3 (Vite console output) |
| **View Database Logs** | `docker-compose logs -f db` | Check Windows PostgreSQL / SQL Server service logs |
| **Check Container Status** | `docker-compose ps` | Task Manager / `tasklist /fi "imagename eq node.exe"` |

---

### 2. Superadmin Management Suite

The system implements strict **Terminal-Created Admin Protection**. Superadmin accounts created via terminal commands are locked at the database level and cannot be modified, suspended, or deleted through the web admin UI.

| Action | With Docker | Without Docker |
|---|---|---|
| **Guided Superadmin Setup (Interactive)** | `docker-compose exec backend python manage.py createsuperuser_custom` | `cd backend && python manage.py createsuperuser_custom` |
| **Standard Django Superadmin** | `docker-compose exec backend python manage.py createsuperuser` | `cd backend && python manage.py createsuperuser` |
| **Manage / Delete Terminal Admins** | `docker-compose exec backend python manage.py deletespecificsuperuser` | `cd backend && python manage.py deletespecificsuperuser` |

> [!TIP]
> **Guided Superadmin Setup (`createsuperuser_custom`):**
> * **Option [1]:** Automatically creates the institutional default administrator (`JRMSU-KATIPUNAN-CAMPUS-Library-Admin` / `librarian@jrmsu.edu.ph`).
> * **Option [2]:** Interactive prompt enforcing strong institutional password policies (minimum 10 characters, mixed case, numbers, and symbols).
>
> **Terminal Admin Manager (`deletespecificsuperuser`):**
> * Interactive tool to safely list, target-delete a single terminal-protected admin, or purge all terminal admins without direct SQL intervention.

---

### 3. Assets, Media & Session Data Import Suite

The library relies on institutional eBooks, department catalogs, student PDFs, and physical setup photographs. The automated asset ingestion suite is **100% intact and available**:

| Action | With Docker | Without Docker | Description |
|---|---|---|---|
| **Import All Assets & eBooks** | `docker-compose exec backend python manage.py imports_assets` | `cd backend && python manage.py imports_assets` | Ingests eBooks, images, and physical setup assets from `frontend/src/Assets/assets` into the media directory and DB. |
| **Fresh Re-import (Reset Mode)** | `docker-compose exec backend python manage.py imports_assets --reset` | `cd backend && python manage.py imports_assets --reset` | **Fresh start:** Deletes all existing EResource records, clears directories, and performs a clean full re-import. |
| **Import Agent Sessions** | `docker-compose exec backend python import-session.py` | `python import-session.py` | Portable session unpacker restoring Antigravity CLI conversational logs and database states. |

---

### 4. Database Migrations, Schema & Cloud Sync

| Action | With Docker | Without Docker | Description |
|---|---|---|---|
| **Generate Migrations** | `docker-compose exec backend python manage.py makemigrations` | `cd backend && python manage.py makemigrations` | Detects model changes and generates migration files. |
| **Apply Migrations** | `docker-compose exec backend python manage.py migrate` | `cd backend && python manage.py migrate` | Executes pending migrations against PostgreSQL/SQL Server. |
| **Automated Schema Update** | `docker-compose exec backend python manage.py update_database` | `cd backend && python manage.py update_database` | Runs migration self-check and validates schema health. |
| **Audit Cloud Parity** | `docker-compose exec backend python manage.py verify_cloud_sync` | `cd backend && python manage.py verify_cloud_sync` | Compares record counts across all 21 models against Supabase Cloud DB. |
| **Extract Document Knowledge** | `docker-compose exec backend python manage.py extract_file_knowledge [--force] [--limit N]` | `cd backend && python manage.py extract_file_knowledge [--force] [--limit N]` | *Fully automated in background by `AutonomousKnowledgeDaemon` on server boot & every 5 mins.* CLI available for manual on-demand batch indexing. |
| **Purge Temp Uploads** | `docker-compose exec backend python manage.py cleanup_temp_files` | `cd backend && python manage.py cleanup_temp_files` | Removes orphaned chunk uploads and temp files older than 24 hours. |

---

### 5. Shell Access, Database Inspection & Debugging

| Action | With Docker | Without Docker |
|---|---|---|
| **Enter Django Interactive Shell** | `docker-compose exec backend python manage.py shell` | `cd backend && python manage.py shell` |
| **Open PostgreSQL CLI (`psql`)** | `docker-compose exec db psql -U jrmsu_admin -d jrmsu_library` | `psql -U jrmsu_admin -d jrmsu_library` or pgAdmin / DBeaver |
| **Enter Backend Linux Terminal** | `docker-compose exec backend bash` | Open Command Prompt / PowerShell in `backend/` |
| **Enter Frontend Container Shell** | `docker-compose exec frontend-webpage sh` | Open Command Prompt / PowerShell in `frontend/` |

---

### 6. Targeted Service Builds (Fast-Track Single Containers)

When you make changes to only one part of the stack, rebuild **only that container** to avoid pulling large AI model weights or rebuilding untouched layers:

```bash
# Rebuild only the public frontend
docker-compose up -d --build frontend-webpage

# Rebuild only the admin frontend
docker-compose up -d --build frontend-admin

# Rebuild only Django backend & Celery
docker-compose up -d --build backend celery-worker

# Rebuild core services without re-downloading Ollama AI weights
docker-compose up -d --build backend frontend-webpage frontend-admin redis db
```

---

### 7. Clean-Slate "Fresh Start" (Danger Zone)

Use this when encountering persistent volume caching issues, corrupted migrations, or when preparing a clean deployment image for an external SSD:

```bash
# 1. Stop everything, delete containers, and wipe volumes (WARNING: Deletes database data!)
docker-compose down -v --remove-orphans

# 2. Rebuild all images from scratch, ignoring cached layers
docker-compose build --no-cache

# 3. Start containers fresh in background
docker-compose up -d --force-recreate

# 4. Initialize schema, create administrator, and import eBooks
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser_custom
docker-compose exec backend python manage.py imports_assets
```

---

### 8. 1-Click Operational Helpers (In `CommandStart\`)

For automated, non-technical execution on physical PCs, dedicated scripts are available in the [`CommandStart/`](./CommandStart/) folder:

* **`AutomaticUp.bat`** — Multi-drive resilient 1-click launcher with instant PATH discovery and 24/7 watchdog.
* **`StopAutomaticUp.bat`** — Graceful shutdown terminating containers and background connectors.
* **`createsuperadmin.bat`** — 1-click prompt to generate standard superadmins.
* **`customcreatesuperadmin.bat`** — 1-click interactive guided superadmin wizard.
* **`db-migrate.bat`** — 1-click database migration applicator.
* **`restore-backup.bat`** — 1-click database restore importing `jrmsu_library_master_backup.sql`.
* **`install-tunnel-service.bat`** — Installs Cloudflare Tunnel as a permanent 24/7 Windows Service.
* **`fix-tunnel-502.bat`** — Resolves `host.docker.internal` DNS mappings in Windows hosts file.


##  UI/UX Design System
This project adheres to a strict "UI-UX Pro Max" guideline:
- **Colors:** Navy (`#002B7F`), Gold (`#C9A84C`), Deep Navy (`#001655`).
- **Typography:** Playfair Display (Headings), Inter (Body), JetBrains Mono (Clock).
- **Accessibility (WCAG 2.1 AA):** High contrast ratios, strict focus-visible rings for keyboard navigation, and responsive touch targets (48x48dp minimum).
- **Mobile-First:** Fully responsive breakpoints without any horizontal scrolling.

---

##  Security & Administration
To protect core system integrity, this project includes a **Terminal-Created Admin Protection** feature. Admins generated via `createsuperuser` cannot be modified by standard web interface administrators. 

To manage these terminal admins, use the custom command:
```bash
python manage.py deletespecificsuperuser
```

---

## 👥 Client User (Client-Side) vs. Admin User (Admin Portal)

The JRMSU Library platform enforces a strict separation of concerns, security boundaries, and data capabilities between anonymous public visitors (**Client Users**) and authorized library staff (**Admin Users**):

### High-Level Comparison

| Feature / Aspect | Client User (Client-Side / Public) | Admin User (Admin Portal) |
|---|---|---|
| **Target Users** | Students, Faculty, Researchers, Public Guests | Chief Librarian, Library Staff, System Administrators |
| **Port / Base Route** | Port `3000` / Routes: `/`, `/about`, `/collection`, `/services`, `/personnel`, `/physical-setup` | Port `3001` or `/admin/*` (`/admin/dashboard`, `/admin/books`, `/admin/users`, etc.) |
| **Authentication** | **No login required** (Anonymous public access) | **Strict authentication required** (Username + Password) |
| **Session Lifecycle** | Stateless — no persistent session in DB | Stateful — Django session cookie + 30s Heartbeat |
| **Inactivity Logout** | None (public catalog browsing stays active indefinitely) | **Auto-logs out after 10 minutes** of inactivity |
| **Single-Device Rule**| Unlimited public visitors can browse simultaneously | **Single-device lock** (Concurrent active logins blocked) |
| **Data Privileges** | **Read-Only** + Public Inquiries & Ratings | **Full CRUD** (Create, Read, Update, Soft-Delete, Restore) |
| **CMS & Settings** | View-only | Full text block editing, banner uploads, operating hours |
| **Audit Logging** | Anonymous visitor metrics aggregation | **Every action logged** with username, IP, and timestamp |

### Key Architectural Differences

1. **Client-Side (Public Landing Page):**
   - **Frictionless Access:** Public visitors access book collections, newly acquired carousels, and research paper catalogs with zero barrier to entry.
   - **Dr. Rizal AI Assistant:** Public users can query the local Ollama AI research assistant (`POST /api/ai/ask/`) with automatic fallback to cached institutional FAQs.
   - **Public Submissions:** Allows submitting reference inquiries with file attachments (`POST /api/contact/`) and student satisfaction feedback ratings (`POST /api/feedback/`), both protected by rate limits (`AnonRateThrottle`) and HTML sanitization (`input_sanitizer.py`).

2. **Admin Portal (Administrative Management):**
   - **Inactivity Timer Auto-Logout (`useInactivityTimer`):** Listens to keyboard/mouse/touch interactions. If 10 minutes (600,000 ms) pass with no activity, it cleanly terminates the Django session and redirects to `/admin/login?timeout=1`.
   - **Single-Device Active Session Guard:** Prevents credential sharing or multi-tab hijacking. If an account was active within 60 seconds on another machine, second login attempts return `HTTP 403 Forbidden: "Account already online cant be Login!"`.
   - **Brute-Force Lockout:** Automatically locks accounts in Redis for 10 minutes (600 seconds) after 5 consecutive failed login attempts.
   - **Terminal Admin Protection:** Sysadmin accounts created via the command line (`createsuperuser` / `createsuperuser_custom`) are permanently protected and cannot be edited, suspended, or deleted through the web UI.
   - **Smart Sync Excel Engine:** Slices large institutional spreadsheets into chunks of 30 records, utilizing tuple fingerprinting to avoid duplicates and offloading atomic database writes to Celery workers over Redis.
   - **Soft-Delete Recycle Bin:** Deleted records (books, files, personnel) are retained as JSON snapshots in the Recycle Bin with a 30-day automatic purge window, allowing instant one-click restoration.

---


---

## 🛡️ Enterprise Database Replication, Cloud Standby & Operations Suite

The JRMSU Library System implements a **3-Tier High Availability Architecture** designed for physical server hardware resilience and cloud disaster recovery:

```
[Primary DB (db)] ──(Streaming WAL)──► [Local Standby (db-standby)]
       │
       └──(migrate-local-to-cloud.ps1)──► [Cloud Supabase DB]
```

### Operational Tooling:
- **1-Click Local-to-Cloud Migration:** `.\migrate-local-to-cloud.ps1`  
  Pipes local PostgreSQL records over encrypted TLS directly into the remote Supabase Cloud database (`aws-0-ap-southeast-1.pooler.supabase.com`).
- **Emergency Standby Failover:** `.\failover-to-standby.ps1`  
  Promotes `db-standby` to active Read-Write Primary in under 5 seconds with zero data loss.
- **Automated Timestamped Backups:** `.\backup-db.ps1`  
  Generates a clean PostgreSQL `.sql` dump and zips `./backend/media/`, retaining 30 days of archives.
- **Disaster Recovery Restore:** `.\restore-db.ps1 -BackupSqlFile ".\backups\<file>.sql"`  
  1-click database restoration from any timestamped snapshot.
- **Database Parity Verification:** `docker-compose exec backend python manage.py verify_cloud_sync`  
  Compares record counts across all 21 models between local PC and cloud database.

---

##  Architecture & Flowchains

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

##  Code Placement Decision Guide (Where Does X Go?)

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

## 🚀 Getting Started & Installation

### Option 1: Running with Docker (Recommended)
This is the easiest way to run the project. Docker will automatically provision the database, Redis, the backend, and the frontend.

**Requirements:**
- Docker Desktop

**Commands:**
1. Clone the repository and open the root folder.
2. Build and start the containers:
   `ash
   docker-compose up -d --build
   `
3. The frontend is accessible at http://localhost:3000
4. The backend is accessible at http://localhost:8000

### Option 2: Running Without Docker (Local Bare Metal)
If you prefer running the services directly on your machine without virtualization, follow these steps.

**Requirements:**
- Node.js 22+ (For Frontend)
- Python 3.11+ (For Backend)
- PostgreSQL or Microsoft SQL Server (For Database)
- Redis (For Celery Background Tasks)
- Ollama (For AI Assistant - Qwen 2.5)

**Commands:**
1. **Frontend:**
   `ash
   cd frontend
   npm install
   npm run dev
   `
2. **Backend:**
   `ash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py runserver
   `
3. **Celery Worker (Run in a separate terminal):**
   `ash
   cd backend
   .\venv\Scripts\activate
   celery -A core worker -l info
   `

---

## 📚 Interactive API Documentation (Scalar V1)
We use a modern, interactive API documentation interface (Scalar V1) instead of traditional Swagger.
To view and test the API endpoints:
1. Ensure the system is running (via Docker or Local).
2. Open your browser to: **http://localhost:8000/api/docs/**
3. Raw OpenAPI schema: **http://localhost:8000/api/schema/**

---

## 📁 Project Documentation
For more in-depth guides, please refer to the markdown files in the project root:
- `DevSetup.md`: Complete local and Docker setup guide.
- `SETUP.md`: Developer workflow setup.
- `Deploy.md`: Cloud deployment pros, cons, and setup.
- `Access.md`: Detailed port and networking documentation.
- `FreshBuildandStartdocker.md`: Docker rebuilding references.
- `SKILL.md`: Source of truth for architectural constraints.


---

## 📅 System Development Changelog & Sprint Timeline (June – November 2026)

### Table 3. Sprint Plan of the Development

| Sprint | Dates | Goal | Increment Delivered |
| :---: | :---: | :--- | :--- |
| **1** | **Jun 24, 2026 – Jul 14, 2026**<br>*(Academic view: Aug 17 – Aug 28, 2026)* | Foundation, Multi-Container Architecture, Database Schema, and Administrator Authentication | • Initialized Django ASGI (Daphne) backend and React 19 + Vite frontend in Docker.<br>• Relational database schema implemented in PostgreSQL (Users, Roles, System Settings).<br>• JWT/session authentication with CSRF protection and Role-Based Access Control (RBAC).<br>• Functional Admin Login terminal (`/admin/login`) and protected dashboard layout frame. |
| **2** | **Jul 15, 2026 – Aug 11, 2026**<br>*(Academic view: Aug 31 – Sep 11, 2026)* | Catalog Management, Newly Acquired Books Inventory, Acquisition Batches, and Bulk Import | • Full CRUD operations for books with Dewey Decimal classification, author/title indexing, and cover image uploads.<br>• Acquisition Batch History manager for tracking book batches, donations, and procurement status.<br>• Client- and server-side Excel (`.xlsx`) parser for bulk catalog ingestion with data validation.<br>• Soft-delete recovery mechanism and Recycle Bin manager (`/admin/recycle-bin`) working end-to-end. |
| **3** | **Aug 12, 2026 – Sep 08, 2026**<br>*(Academic view: Sep 14 – Sep 25, 2026)* | Public Landing Portal, OPAC Catalog Discovery, Institutional Sections, and E-Resources | • Responsive public landing page with university branding, real-time Philippine Standard Time (PST) hero clock, and campus map.<br>• Online Public Access Catalog (OPAC) with debounced search, category filtering, and book preview modal.<br>• Integrated E-Resources module with secure iframe proxies for subscribed databases (Scholaar, VitalSource).<br>• Interactive 3D physical library setup carousel, staff organizational flowchart, and visitor feedback submission widget. |
| **4** | **Sep 09, 2026 – Oct 06, 2026**<br>*(Academic view: Sep 28 – Oct 09, 2026)* | Dr. Jose Rizal AI Research Assistant, Redis Semantic FAQ Cache, and Email/Reservation Pipeline | • On-premise Dr. Jose Rizal AI assistant powered by local Ollama (`qwen2.5:0.5b`) with zero cloud API dependency.<br>• Sub-10ms Redis semantic FAQ cache for recurring patron questions (hours, borrowing rules, clearance).<br>• Asynchronous Celery + Redis task pipeline for automated email notifications and room reservation confirmations.<br>• Anti-hallucination guardrails and dynamic catalog grounding preventing false bibliographic citations. |
| **5** | **Oct 07, 2026 – Nov 05, 2026**<br>*(Academic view: Oct 12 – Oct 23, 2026)* | Administrative Analytics, Security Hardening, 24/7 Cloudflare Production Deployment, and Global Refactor | • Interactive administrative analytics dashboard with circulation velocity curves, inventory histograms, and visitor charts.<br>• Dual-subdomain Cloudflare Zero Trust Tunnel deployment (`page.jrmsukc-library.online` and `admin.jrmsukc-library.online`) with SSL termination.<br>• 24/7 self-healing watchdog (`AutomaticUp.bat`), Windows AutoLogon, and RAM optimization on host Library PC.<br>• Google Search Console verification, verified sitemap (`/sitemap.xml`), and modular frontend architecture refactor with Global Calling Imports. |

---

### Detailed Milestone Changelog by Date & Timestamp (June – November 2026)

#### 🚀 June 2026: Project Inception, Core UI Wireframing & Vertical Slices
* **2026-06-24 10:27:48 +0800** (`8a1b8a9`): Project inception (`start 1`) — Initialized core Git repository, established baseline Django backend scaffolding, and initialized React 19 + TypeScript frontend.
* **2026-06-25 08:44:16 – 16:47:31 +0800** (`7749ef9` – `f78fec0`): UI implementation sprints 1 through 5 — Configured Tailwind CSS design tokens (JRMSU Navy `#001851`, Gold `#C9A84C`), built header navigation bar, dynamic hero banners, and preliminary book cards.
* **2026-06-28 12:43:45 +0800** (`2b2a4b5`): UI implementation sprint 6 — Integrated responsive grid wrappers, modal backdrop containers, and typography scaling for tablet and mobile devices.
* **2026-06-29 09:36:00 – 11:15:03 +0800** (`98fc44a`, `afb9bf3`): Architectural restructuring — Decoupled monolithic components into domain-isolated vertical slices (`Pages/`, `Features/`, `Components/`). Updated Vite and TypeScript configurations.
* **2026-06-30 10:27:53 – 16:47:04 +0800** (`30201a9` – `3515c3f`): Backend API implementation — Created core Django REST Framework serializers, viewsets, database models for catalog and users, and integrated background SMTP email handlers.

#### ⚙️ July 2026: Backend Consolidation, Multi-Container Docker, Security & Testing
* **2026-07-02 08:55:47 – 16:12:23 +0800** (`7b1a4b1` – `4003330`): Backend consolidation & optimization — Untracked large media binaries, added initial QA validation suites, and established standardized JSON response envelopes.
* **2026-07-07 08:59:35 – 16:51:29 +0800** (`a739c6c` – `8931676`): UI stabilization & authentication hardening — Reconstructed `SettingsPage.tsx`, added 3D floating bubble physics, Terms modal dialog, stabilized external e-resource iframe wrappers, and reinforced JWT session security.
* **2026-07-08 14:58:38 – 16:23:47 +0800** (`0ad6ef5`, `47176e7`): Rigorous Quality Assurance passes (QA 1 & 2) — Verified form input sanitization, error boundaries, and API exception handling.
* **2026-07-09 10:03:33 – 14:29:36 +0800** (`ef9124d`, `67dd3eb`): Multi-container Docker deployment — Authored multi-stage production Dockerfiles for React/Vite and Django/Daphne.
* **2026-07-14 15:09:04 +0800** (`7cbbda1`): 5-layer container architecture — Orchestrated Docker Compose network spanning frontend, backend replicas, PostgreSQL, Redis, and Celery.
* **2026-07-15 – 2026-07-21** (`b865772` – `54f11f5`): Data integrity & organizational hierarchy — Built dynamic staff directory tree, reference models, and catalog audit routines.
* **2026-07-22 – 2026-07-25** (`eb64c2c` – `68493fe`): Staging proxy & cross-origin authentication — Added Whitenoise static asset handling, configured `SameSite=None` cookie propagation, and resolved PDF report generation proxy blocks.
* **2026-07-27 08:04:16 – 09:35:46 +0800** (`9d59ee8` – `cf8c39e`): Network resilience & worker scaling — Resolved campus Wi-Fi IPv6 socket collision (`Errno 101`) by enforcing IPv4 resolution; shifted SMTP mail dispatch to Celery background threads to prevent 502 gateway timeouts; added browser desktop push alerts.

#### 🛡️ August 2026: Environment Standardization & Catalog Verification
* **2026-08-20 16:35:12 – 17:59:45 +0800** (`3277ab9` – `5b43eef`): Environment configuration hardening — Standardized `.env.example` templates, validated database migrations across PostgreSQL and MSSQL, and audited circulation statistics calculation logic.

#### 🌐 September 2026: Public Portal Polish, E-Resources & Cloudflare Zero Trust
* **2026-09-08 00:01:03 – 2026-09-14 18:01:48 +0800** (`13204dd`, `b43d035`): Catalog discovery enhancements — Upgraded book cover carousel, added real-time search debouncing, and streamlined e-resource access for academic departments.
* **2026-09-21 08:00:07 +0800** (`9fb24e1`): System status lifecycle and feature audit baseline established.
* **2026-09-22 01:01:41 – 11:34:49 +0800** (`034a2a6`, `253f497`): Cloudflare encrypted tunnel integration — Configured zero-trust edge routing to securely expose public catalog without forwarding external router ports.
* **2026-09-28 11:30:04 +0800** (`18c4750`): Cloudflare production subdomain integration.

#### 🤖 October 2026: 24/7 Host Automation, Dr. Rizal AI, FAQ Cache & Search Indexing
* **2026-10-12 14:49:19 – 17:35:45 +0800** (`b2c6e5d` – `487f8f7`): Custom domain cutover & host automation — Configured production domain `jrmsukc-library.online`, setup dual subdomains (`page.` for public portal and `admin.` for librarian console), and engineered `AutomaticUp.bat` and `StopAutomaticUp.bat` scripts with multi-drive discovery and crash restart loops.
* **2026-10-13 08:55:17 – 14:40:37 +0800** (`3a64f53` – `f38a916`): On-premise AI integration & power-resilience — Connected local Ollama (`qwen2.5:0.5b`) LLM, eliminated semantic FAQ cache false positives, grounded AI responses in live book collection data, established strict NO STATICS rule, and hardened auto-recovery against power brownouts.
* **2026-10-14 08:59:51 – 09:51:43 +0800** (`fd4085c`, `04a38f2`): Weekly maintenance update and database index verification.
* **2026-10-25 21:19:43 – 2026-10-26 07:27:53 +0800** (`2a9770c` – `53eafe7`): Patron feedback & research survey sticky widgets integrated into public portal.
* **2026-10-26 16:00:29 – 22:06:37 +0800** (`e15ca6e` – `2793958`): Multi-engine SEO verification (Google, Bing, Yahoo, DuckDuckGo) via `BingSiteAuth.xml` and sitemap refresh; expanded AI token ceiling to 1024 tokens with non-blocking chat input UX; consolidated master CLI command cheatsheet.
* **2026-10-28 23:38:23 +0800** (`0565efc`): 3-tier adaptive prompt length routing and anti-hallucination guardrails implemented for Dr. Rizal AI.
* **2026-10-29 00:00:03 – 10:17:56 +0800** (`7f2de85`, `834942c`): Physical 2-floor layout guardrails enforced, academic reasoning bypass enabled, and 5 Graphify architectural advisory findings remediated (session heartbeat, typing indicators, email timeout, and FAQ queries).

#### 🏆 November 2026: Role Segregation, AI Production Verification, Host Healing & Global Architecture Refactor
* **2026-11-04 13:08:13 – 15:43:47 +0800** (`5b57d5d` – `7449a52`): Production host role segregation & auto-boot healing — Formally segregated 24/7 Library Server PC from developer Maintenance Laptop, configured Windows AutoLogon, optimized Docker RAM (WSL2 6GB memory cap), achieved 3-5s local AI reply streaming, passed 12-suite challenge production AI verification test, and enforced persistent background auto-start via Windows Registry (`HKCU`/`HKLM`).
* **2026-11-05 13:29:59 +0800** (`a3cd74a`): Google Search Console sitemap update (`/sitemap.xml`) and indexing pipeline audit.
* **2026-11-05 15:20:00 – 15:46:00 +0800**: Complete frontend architectural core refactor — Decoupled monolithic 1,739-line `index.css` into modular domains (`FontSyle/fontStyles.css`, `MainLayout.css`, `PartLayout.css`, master `index.css`), created universal presentational primitives in `src/Shared/` (`Button`, `ModalCard`, `Drawer`, `Charts`), standardized global calling hooks in `src/Hooks/` (`usePagination`, `useFluidResponsiveness`, `useDebounce`), and unified layout frames in `src/LayoutBars/` with 100% type safety and zero regressions.
