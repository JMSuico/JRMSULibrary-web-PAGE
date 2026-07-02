import os

path = r"C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\SETUP.md"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_content = """## 9. Key URLs

| Page              | URL                                        |
|-------------------|--------------------------------------------|
| Landing Page      | http://localhost:3000                       |
| About Page        | http://localhost:3000/about                 |
| E-Resources Page  | http://localhost:3000/eresources            |
| Admin Panel       | http://localhost:3000/admin                 |
| Django Admin      | http://localhost:8000/admin/                |
| Gallery API       | http://localhost:8000/api/gallery           |
| Books API         | http://localhost:8000/api/books             |
| Personnel API     | http://localhost:8000/api/personnel         |
| Contact API       | http://localhost:8000/api/contact           |
| Feedback API      | http://localhost:8000/api/feedback          |
| Page Content API  | http://localhost:8000/api/page-content      |
| Page Images API   | http://localhost:8000/api/page-images       |
| Managed Links API | http://localhost:8000/api/managed-links     |
| Managed Files API | http://localhost:8000/api/managed-files     |
| Departments API   | http://localhost:8000/api/departments       |
| E-Resource Files  | http://localhost:8000/api/files             |
| Site Visits API   | http://localhost:8000/api/site-visits       |
| Auth Login        | POST http://localhost:8000/api/auth/login   |

---

## 10. Admin Panel — Access & Pages

### How to access

1. Start the backend: `cd backend && venv\\Scripts\\activate && python manage.py runserver 8000`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to: **http://localhost:3000/admin**

### Admin Panel Routes

| Route                  | Page                 | Purpose                                    |
|------------------------|----------------------|--------------------------------------------|
| `/admin`               | Dashboard            | Overview statistics, charts, quick metrics |
| `/admin/books`         | Books Manager        | CRUD newly acquired books                  |
| `/admin/sections`      | Sections Manager     | Manage library interior gallery images     |
| `/admin/content`       | Content Manager      | Edit page text, images, links, files       |
| `/admin/eresources`    | E-Resources Manager  | Manage department tree and resource files   |

> **Note:** The Admin Panel is a React SPA (frontend-only at `localhost:3000/admin`). It communicates with the Django backend API at `localhost:8000/api/`.

---

## 11. Project Layout (quick reference)

```
JRMSU LIBRARY LANDING PAGE/          <- root
├── frontend/                        <- React + Vite + Tailwind v4
│   ├── src/
│   │   ├── Pages/                   <- Route-level page wrappers
│   │   │   ├── Home/
│   │   │   ├── About/
│   │   │   ├── Admin/               <- Admin panel pages
│   │   │   └── ...
│   │   ├── Features/                <- Vertical-slice domain features
│   │   │   ├── Home/
│   │   │   ├── Admin/               <- Admin panel feature components
│   │   │   └── ...
│   │   ├── Components/              <- Shared UI primitives
│   │   ├── Hooks/                   <- Global hooks
│   │   ├── Libs/                    <- Constants, data, links
│   │   └── LayoutStyles/            <- Global CSS tokens (index.css)
│   ├── package.json
│   └── vite.config.ts
├── backend/                         <- Django + DRF + SQL Server
│   ├── core/                        <- settings, urls, wsgi
│   ├── Features/                    <- Domain models, API, services
│   │   ├── Api/Controllers/         <- Domain-specific controllers
│   │   ├── Api/Serializers/         <- Domain-specific serializers
│   │   ├── Api/Routes/              <- Centralized router
│   │   ├── Data/Models/             <- Django ORM models
│   │   ├── Data/Enums/              <- Choice enums
│   │   ├── Repositories/            <- Data access layer
│   │   │   ├── Interfaces/          <- Abstract contracts (ABC)
│   │   │   └── Implementations/     <- Concrete ORM implementations
│   │   ├── Services/                <- Business logic layer
│   │   │   ├── Interfaces/          <- Abstract contracts (ABC)
│   │   │   └── Implementations/     <- Concrete service implementations
│   │   ├── Helpers/                 <- Utility functions (input_sanitizer)
│   │   ├── Middleware/              <- Custom middleware (rate limit, etc.)
│   │   └── management/commands/     <- Custom management commands
│   ├── manage.py
│   ├── create_db.py                 <- DB creation helper
│   └── venv/                        <- Python virtual env
├── SETUP.md                         <- this file
├── SKILL.md                         <- architecture rules
└── AGENTS.md                        <- agent conventions
```

---

## 12. Flow Chains — Core Principles

To ensure architecture consistency, these chains must **always** be followed.

### 12A. Frontend Flow Chain

```
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

### 12B. Backend Flow Chain

```
Models/New Models Added or created
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

### 12C. HTTP Request Flow Chain

```
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

### 12D. Cache Read Flow

```
Request → Middleware → Controller → Service → Cache Service
  Cache HIT?  → Return Data
  Cache MISS? → Repository → Database → Store in Cache → Return Data
```

### 12E. Cache Write / Invalidation Flow

```
Request → Controller → Service → Repository → Database
  Success? → Invalidate: book:{id}, book:list, dashboard:stats → Return Result
```

### 12F. Contact Form Flow (Domain-Specific)

```
Visitor submits Contact Form
  ↓
Django Middleware (rate_limit_middleware, CSRF)
  ↓
ContactController  POST /api/contact
  ↓
ContactService  (validate, sanitize via input_sanitizer, send email notification)
  ↓
ContactRepository  (persist inquiry)
  ↓
Database  ContactMessages table
```
"""

with open(path, "w", encoding="utf-8") as f:
    f.writelines(lines[:235]) # Keep up to line 235 (index 234)
    f.write(new_content)
