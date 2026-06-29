---
name: jrmsu-library-fullstack-architecture
description: >
  Full-stack architecture skill for the JRMSU Library System and Landing Page project.
  Apply this skill whenever Jhon is working on frontend structure (React + Vite + TypeScript),
  backend structure (Django DRF), database schema, cache design, or any architecture decision
  for the JRMSU Library System. Triggers on: "project structure", "architecture", "vertical slice",
  "backend flow", "frontend flow", "flowchain", "where does X go", "organize structure",
  "add feature", "new endpoint", "database schema", "cache layer", "repository", "service layer",
  or any mention of JRMSU Library Landing Page or Library Management System.
  This is the single source of truth for all architecture rules, flow chains, placement logic,
  do/don't rules, and project structures — frontend, backend, and database combined.
---

# JRMSU Library System — Full-Stack Architecture Skill

This is the **reusable architecture rule set** for the JRMSU Library project.
It covers the Landing Page (React + Vite) and the Library Management System (Django + React).
Do not change the chain flow unless Jhon explicitly overrides a section.

---

## 0) Identity and Role

You are a **Senior Full-Stack Software Architect** and **Project Structure Designer**.
Always apply this skill as the default rule set for every architectural decision in this project.
Never create spaghetti code. Never mix responsibilities. Never skip layers. Never place code randomly.

---

## 1) Core Framework at a Glance

| Layer | Technology | Pattern |
|---|---|---|
| Web Frontend | React + Vite + TypeScript | Feature-based Vertical Slice |
| Mobile Frontend | React Native + TypeScript | Feature-based Vertical Slice |
| Backend | Django + DRF + Python | Layered Model-First |
| Database | MySQL / PostgreSQL / SQL Server | Strict Relational |
| Cache | Redis | Infrastructure Layer |
| Auth | JWT + HMAC-SHA256 QR | Backend-enforced |

---

## 2) Universal Rules — Always Follow

```
✅ DO                                        ❌ NEVER DO
─────────────────────────────────────────    ────────────────────────────────────────
Follow the exact flow chain                  Skip layers
Place code in the correct layer              Mix responsibilities
Keep every file to one responsibility        Put business logic in controllers
Keep modules modular and reusable            Put API calls in page components
Keep frontend and backend separate           Put DB queries in middleware
Keep DB relational and controlled            Put UI logic in DB code
Follow the flow chain direction              Reverse or bypass the chain
Add short purpose comments to every file     Leave files without clear ownership
Keep platform-specific code isolated         Duplicate feature logic across platforms
Enforce all security on the backend          Rely on frontend visibility as security
```

---

## 3) Flow Chains — Never Alter Order

### 3A) Frontend Flow Chain

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

### 3B) Backend Flow Chain

```
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

### 3C) HTTP Request Flow Chain

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

### 3D) Cache Read Flow

```
Request → Middleware → Controller → Service → Cache Service
  Cache HIT?  → Return Data
  Cache MISS? → Repository → Database → Store in Cache → Return Data
```

### 3E) Cache Write / Invalidation Flow

```
Request → Controller → Service → Repository → Database
  Success? → Invalidate: book:{id}, book:list, dashboard:stats → Return Result
```

### 3F) Contact Form Flow (Domain-Specific)

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

---

## 4) JRMSU Landing Page — Frontend Vertical Slice Structure

> **DO NOT change any UI, functions, color scheme, styles, or components.**
> This reorganization is **structure-only** — same files, better layer placement.

```
JRMSU LIBRARY LANDING PAGE/            # Root project folder (Vite + React setup at root)
│
├── public/
│   └── assets/                        # Static public images and files (served directly by Vite)
│
├── src/
│   │
│   ├── Pages/                         # Route-level page assemblies only — no business logic here
│   │   ├── Home/
│   │   │   └── HomePage.tsx           # Main entry route — composes Hero, Maps, Feedback features
│   │   ├── About/
│   │   │   └── AboutPage.tsx          # About route — History, Vision, Objectives sections
│   │   ├── Administration/
│   │   │   └── AdministrationPage.tsx # Administration overview page route
│   │   ├── Collection/
│   │   │   └── CollectionPage.tsx     # Collection route — New Books, Local Books, Online catalog
│   │   ├── Personnel/
│   │   │   └── PersonnelPage.tsx      # Personnel route wrapper — composes PersonnelSection
│   │   ├── PhysicalSetup/
│   │   │   └── PhysicalSetupPage.tsx  # Physical setup route wrapper — composes LibrarySectionCarousel
│   │   └── Services/
│   │       └── ServicesPage.tsx       # Services route wrapper — composes ServicesSection
│   │
│   ├── Features/                      # Feature-specific vertical slices — owns business workflows
│   │   │
│   │   ├── Home/                      # Home page feature slice
│   │   │   └── components/
│   │   │       ├── HeroSection.tsx           # Hero with real-time clock and library open/closed status
│   │   │       └── LibraryMapSection.tsx     # Google Maps satellite embed for library location
│   │   │
│   │   ├── Services/                  # Library services feature slice
│   │   │   └── components/
│   │   │       ├── ServicesSection.tsx       # 17 library services accordion with steps
│   │   │       └── ExternalServicesSection.tsx # External services accordion with auto-slideshow
│   │   │
│   │   ├── Feedback/                  # Visitor feedback feature slice
│   │   │   └── components/
│   │   │       ├── FeedbackSection.tsx       # Feedback accordion with auto-slideshow display
│   │   │       └── FeedbackStickyCard.tsx    # Floating sticky feedback button overlay
│   │   │
│   │   ├── Collection/                # Book collection feature slice
│   │   │   └── components/
│   │   │       ├── NewlyAcquiredBooks.tsx    # Newly acquired books section display
│   │   │       └── BlueModalCarousel.tsx     # 3D rotating carousel for newly acquired books
│   │   │
│   │   ├── PhysicalSetup/             # Library physical setup feature slice
│   │   │   └── components/
│   │   │       └── LibrarySectionCarousel.tsx # 3D rotating carousel for library physical areas
│   │   │
│   │   ├── Personnel/                 # Library personnel feature slice
│   │   │   └── components/
│   │   │       └── PersonnelSection.tsx      # Flowchart layout for library staff hierarchy
│   │   │
│   │   ├── EResources/                # E-Resources feature slice — LEGACY (keep, do not delete)
│   │   │   └── components/
│   │   │       └── EResourcesPage.tsx        # E-Resources section component (unused — legacy ref)
│   │   │
│   │   └── AIAssistant/               # Rizal AI assistant feature slice
│   │       └── components/
│   │           └── RizalAssistant.tsx        # Dr. Rizal floating AI assistant chat modal
│   │
│   ├── Endpoints/                     # API endpoint stubs — frontend to backend bridge layer
│   │   ├── contactApi.ts              # POST /api/contact — contact form submission to backend
│   │   ├── feedbackApi.ts             # POST /api/feedback — visitor feedback submission
│   │   ├── personnelApi.ts            # GET /api/personnel — fetch library staff list from DB
│   │   └── cmsApi.ts                  # CMS CRUD — /api/books, /api/departments, /api/gallery
│   │
│   ├── Components/                    # Shared reusable UI primitives — presentational only
│   │   ├── LayoutBars/                # Global layout frame components
│   │   │   ├── TopNavBar.tsx          # Main header navigation with hover dropdowns
│   │   │   └── Footer.tsx             # Global footer component
│   │   ├── Modals/                    # Shared modal components
│   │   │   ├── BookListModal.tsx      # Modal for full book list display
│   │   │   └── FileViewerModal.tsx    # Modal for PDF/file viewer from collection tree
│   │   └── Shared/                    # Common reusable UI elements
│   │       ├── FacebookBubble.tsx     # Floating Facebook Messenger bubble overlay
│   │       ├── ImageGallery.tsx       # Reusable image slider with auto-play capabilities
│   │       ├── SkeletonLoader.tsx     # Loading animations — Line, Circle, Card, Page variants
│   │       ├── TreeView.tsx           # Interactive file explorer tree component
│   │       └── UOPACSection.tsx       # UOPAC QR Code display and redirect section
│   │
│   ├── LayoutStyles/                  # Global styling and color system — all colors defined here
│   │   └── index.css                  # Global CSS tokens, Tailwind base, and custom animations
│   │
│   ├── Hooks/                         # Shared reusable hooks only
│   │   └── useIntersectionObserver.ts # Custom hook for scroll-based fade-in animations
│   │
│   ├── Libs/                          # Shared frontend infrastructure and data utilities
│   │   └── Assets/                    # CDN URLs, link lists, service data, JSON config data
│   │       ├── data.ts                # Global constants, static arrays, and link mappings
│   │       ├── eBooksTree.json        # JSON tree representation of local books directory
│   │       └── treeData.ts            # Types and configs for the tree viewer component
│   │
│   ├── Assets/                        # Static image assets (Vite-resolved) — pictures, icons, PDFs
│   │   └── (images, icons, media)     # No logic here — raw static files only
│   │
│   ├── App.tsx                        # Main router setup with React Suspense and lazy loading
│   └── main.tsx                       # React DOM entry point
│
├── frontend/
│   └── FrontendStructure.md           # Frontend architecture documentation (this structure)
├── scripts/                           # Build and utility scripts
├── SKILLS/                            # Custom agent skills directory
├── .env.example                       # Environment variable template
├── .gitignore                         # Git ignore definitions
├── AGENTS.md                          # Committed agent skills and conventions
├── DESIGN.md                          # Design system guidelines
├── index.html                         # Vite entry HTML (root)
├── package.json                       # NPM dependencies and scripts
├── package-lock.json                  # NPM lockfile
├── PROJECT_SKILL.md                   # Project-specific AI agent instructions
├── README.md                          # Project overview and description
├── SETUP.md                           # Setup and installation instructions
├── SKILL.md                           # This architecture skill definitions file
├── tsconfig.json                      # TypeScript compiler configuration
└── vite.config.ts                     # Vite bundler configuration
```

### Frontend Layer Rules

| Layer | Purpose | What Belongs | What is Forbidden |
|---|---|---|---|
| `Pages/` | Route-level composition | Layout assembly, route entry points | Business logic, API calls, feature duplication |
| `Features/` | Vertical slice ownership | Workflow logic, feature hooks, feature API | Global state, shared UI, infrastructure |
| `Endpoints/` | Backend bridge | API call functions, request/response types | Business rules, UI rendering |
| `Components/` | Shared UI primitives | Modals, cards, nav bars, shared elements | Feature-specific logic, API calls |
| `LayoutStyles/` | Global styling | CSS tokens, Tailwind base, color variables | Component-specific styles |
| `Hooks/` | Shared reusable hooks | Reusable hook logic, observers | Feature-specific hooks (those go in Features/) |
| `Libs/Assets/` | Data and config | Constants, link lists, JSON data, CDN URLs | UI components, business logic |
| `Assets/` | Static files | Images, icons, PDFs, media | Any logic or code |

---

## 5) Backend Vertical Slice Structure (Django)

```
backend/                                    # Root Django backend application
│
├── manage.py                              # Main Django management entry point
├── requirements.txt                       # Python dependencies
├── .env                                   # Environment config (secrets, DB URL, SMTP)
│
├── core/                                  # Django project configuration layer
│   ├── __init__.py                        # pymysql.install_as_MySQLdb() initialization
│   ├── settings.py                        # Django settings — DB, Auth, CORS, JWT, SMTP, Redis
│   ├── urls.py                            # Root URL config — /admin/ + /api/ + /assets/
│   ├── asgi.py                            # ASGI entry point
│   ├── wsgi.py                            # WSGI entry point
│   └── middleware/                        # Request preprocessing layer
│       ├── auth_middleware.py             # JWT auth check and token validation
│       ├── idempotency_middleware.py      # Duplicate request protection
│       └── rate_limit_middleware.py       # Prevents form submission spam
│
└── Features/                              # Domain vertical slices — main Django app
    ├── __init__.py
    ├── apps.py                            # FeaturesConfig — registers Django app
    ├── models.py                          # Re-exports all models from Data/Models/
    ├── migrations/                        # Django auto-generated migration files
    │
    ├── Data/                              # Model-first foundation — database shape only
    │   ├── Models/
    │   │   ├── __init__.py                # Exports all models for Django ORM discovery
    │   │   ├── account_model.py           # Account entity (extends AbstractUser: is_librarian, is_guest)
    │   │   ├── contact_message_model.py   # Entity for submitted contact form inquiries
    │   │   ├── feedback_model.py          # Entity for visitor feedback submissions
    │   │   ├── personnel_model.py         # CMS entity for library staff profiles
    │   │   ├── newly_acquired_book_model.py # Book entity with cover image and metadata
    │   │   ├── eresource_model.py         # EResourceDepartment + EResourceFile (multi-level tree)
    │   │   └── library_interior_image_model.py # Gallery images with category labels
    │   └── Enums/
    │       ├── inquiry_status.py          # Enum: new, read, replied — contact message state
    │       └── feedback_rating.py         # Enum: 1–5 stars — visitor rating values
    │
    ├── Repositories/                      # Data access layer only — no business rules here
    │   ├── Interfaces/
    │   │   ├── contact_repository_interface.py   # Contract for contact data access
    │   │   └── feedback_repository_interface.py  # Contract for feedback data access
    │   └── Implementations/
    │       ├── contact_repository.py      # Contact inquiry persistence via Django ORM
    │       └── feedback_repository.py     # Feedback record persistence via Django ORM
    │
    ├── Services/                          # Business logic layer only — no DB access here
    │   ├── Interfaces/
    │   │   ├── contact_service_interface.py  # Contract for contact workflow
    │   │   └── feedback_service_interface.py # Contract for feedback workflow
    │   └── Implementations/
    │       ├── contact_service.py         # Validates form, prevents spam, triggers email, saves to repo
    │       └── feedback_service.py        # Handles feedback submission rules and dedup logic
    │
    ├── Helpers/                           # Reusable support utilities — not full workflows
    │   ├── input_sanitizer.py             # Cleans and sanitizes all public form submissions (XSS guard)
    │   ├── authentication.py             # JWT helper utilities and token handling
    │   ├── permissions.py                # Role and access permission helper utilities
    │   └── password.py                   # Password hashing and validation helpers
    │
    ├── Api/                              # REST API layer — expose endpoints only
    │   ├── Controllers/
    │   │   ├── contact_controller.py      # POST /api/contact — receive and dispatch contact form
    │   │   ├── feedback_controller.py     # POST /api/feedback — receive and dispatch feedback
    │   │   ├── personnel_controller.py    # GET /api/personnel — return staff list
    │   │   └── cms_controller.py          # CRUD /api/books, /api/departments, /api/resources, /api/gallery
    │   ├── Serializers/
    │   │   ├── contact_serializer.py      # Shape contact request and response data
    │   │   ├── feedback_serializer.py     # Shape feedback request and response data
    │   │   ├── personnel_serializer.py    # Shape personnel response data
    │   │   └── cms_serializers.py         # Book, Department, EResource, Gallery serializers
    │   └── Routes/
    │       └── api_router.py              # All URL patterns — auth, contact, feedback, cms
    │
    ├── Infrastructure/                    # External system setup — not business logic
    │   ├── Database/
    │   │   ├── db_engine.py               # Database engine selector — MySQL, PostgreSQL, SQL Server
    │   │   ├── connection_factory.py      # Builds DB connection settings from .env
    │   │   └── health_check.py            # Pings database and returns health status
    │   ├── Cache/                         # Redis cache layer — performance concern, not domain
    │   │   ├── redis_client.py            # Creates Redis connection pool from config
    │   │   ├── redis_config.py            # Reads Redis settings from .env
    │   │   ├── redis_health.py            # Redis health check and ping utility
    │   │   ├── cache_service.py           # Generic cache get/set/delete operations
    │   │   ├── cache_keys.py              # Central cache key naming conventions
    │   │   ├── ttl_rules.py               # Cache TTL expiration policy definitions
    │   │   └── cache_invalidation.py      # Cache invalidation rules per entity type
    │   ├── EmailClient/
    │   │   └── email_sender.py            # Sends notifications to library staff on form submission
    │   └── ApiTools/
    │       ├── scalar_v1.py               # Scalar V1 API docs integration support
    │       └── drf_tools.py               # Django REST Framework tooling and pagination setup
    │
    ├── Management/                        # Django CLI tools and operational scripts
    │   ├── Commands/
    │   │   ├── add_migration.py           # Wrapper for makemigrations — use instead of raw command
    │   │   ├── update_database.py         # Wrapper for migrate — use instead of raw command
    │   │   ├── createsuperuser_custom.py  # Creates first privileged librarian account
    │   │   └── seed_assets.py             # Asset crawler — seeds DB from local /assets/ folder
    │   └── Scripts/
    │       └── setup_db.py                # First-time database bootstrap script
    │
    └── Logs/                              # Implementation and error logs
        ├── ImplementationLogs/            # Feature and architecture change records
        └── ErrorLogs/                     # Runtime and build error records
```

### Backend Layer Rules

| Layer | Purpose | What Belongs | What is Forbidden |
|---|---|---|---|
| `Data/Models/` | DB shape | Tables, entities, relations | Business rules, API logic |
| `Data/Enums/` | Fixed values | Roles, statuses, constrained options | Logic, computation |
| `Repositories/` | Data access | CRUD, filtering, ORM queries | Business rules, HTTP concerns |
| `Services/` | Business logic | Validation, workflows, orchestration | DB queries, HTTP parsing |
| `Helpers/` | Utilities | Reusable support functions | Full workflows, DB calls |
| `Api/Controllers/` | Endpoints | Parse request, call service, return response | Business logic, DB queries |
| `Api/Serializers/` | Data shaping | Request/response field mapping | Business validation |
| `Infrastructure/` | External systems | DB engine, cache, email, API tools | Domain logic |
| `Management/` | CLI ops | Migrations, seeds, setup commands | Application logic |
| `core/middleware/` | Request guards | Rate limit, CSRF, auth, idempotency | Business logic, DB queries |

---

## 6) Database Vertical Slice Schema

```
JRMSULIBRARYDATABASE                            # Root database for the JRMSU Library System
│
├── Security/                                   # Authentication and authorization data
│   ├── Roles                                   # Role definitions table — admin, librarian, student, guest
│   ├── Permissions                             # Permission definitions table — read, write, delete
│   ├── RolePermissions                         # Role-to-permission mapping junction table
│   ├── UserSessions                            # Active JWT session tracking table
│   ├── LoginAttempts                           # Failed and successful login attempt tracking
│   └── SecurityEvents                          # Security audit event log table
│
├── Users/                                      # User identity and profile data
│   ├── Users                                   # Main user accounts table (email, password hash, role)
│   ├── UserProfiles                            # Extended profile details table (name, avatar, contact)
│   ├── Librarians                              # Librarian-specific profile and assignment table
│   └── Students                                # Student-specific profile and ID number table
│
├── Library/                                    # Library catalog and physical inventory
│   ├── Books                                   # Core book catalog table (title, author, ISBN, cover)
│   ├── Authors                                 # Author master table
│   ├── Categories                              # Category and Dewey classification master table
│   ├── BookCategories                          # Book-to-category mapping junction table
│   ├── BookCopies                              # Physical copy inventory table (barcode, condition)
│   ├── Shelves                                 # Shelf location table (section, row, level)
│   ├── Rooms                                   # Room location table (floor, section label)
│   └── QRBookCodes                             # Book QR code hash table for scan-based access
│
├── EResources/                                 # E-resource departments and file assets
│   ├── EResourceDepartments                    # Department groupings for e-resources
│   └── EResourceFiles                          # Individual e-resource files with department FK
│
├── Personnel/                                  # Library staff CMS data
│   └── Personnel                               # Staff profiles — name, role, image, order
│
├── Gallery/                                    # Library interior photo gallery
│   └── LibraryInteriorImages                   # Gallery images with category labels and order
│
├── ContactMessages/                            # Contact form submissions from visitors
│   └── ContactMessages                         # Submitted inquiries — name, email, message, status
│
├── Transactions/                               # Borrowing, returns, reservations, and fines
│   ├── BorrowTransactions                      # Borrow transaction records table
│   ├── ReturnTransactions                      # Return transaction records table
│   ├── Reservations                            # Book reservation table with queue tracking
│   ├── Fines                                   # Outstanding fine records table
│   ├── FinePayments                            # Fine payment history table
│   └── TransactionIdempotency                  # Duplicate request protection per transaction
│
├── AI/                                         # AI assistant prompt and response history
│   ├── AIChats                                 # Conversation session master table
│   ├── AIPrompts                               # Stored prompt inputs per session
│   ├── AIResponses                             # Stored AI response outputs per session
│   └── AIRequestLimits                         # Per-user AI usage and rate tracking
│
├── Audit/                                      # Full audit trail and traceability
│   ├── AuditLogs                               # Main audit trail — who did what, when
│   ├── AdminActions                            # Admin-specific action history
│   ├── APIRequestLogs                          # Full API request log table
│   └── EntityChanges                           # Before/after entity change snapshot table
│
├── Reports/                                    # Reporting and analytics aggregates
│   ├── DailyStatistics                         # Daily usage stats snapshot table
│   ├── MonthlyStatistics                       # Monthly usage stats snapshot table
│   └── BorrowingAnalytics                      # Detailed borrowing trend analytics table
│
└── Configuration/                              # System-wide configuration values
    ├── SystemSettings                          # Application-level settings table (key-value)
    ├── BorrowPolicies                          # Borrowing duration and limit policy table
    ├── FineRules                               # Fine calculation rule table
    └── FeatureFlags                            # Feature toggle table (on/off per environment)
```

### Database Flow

```
Frontend (React)
  ↓
Django REST API  (DRF controllers + serializers)
  ↓
Service Layer    (validation + business rules)
  ↓
Repository Layer (ORM queries)
  ↓
Database         (MySQL / PostgreSQL / SQL Server)
  ↓
SSMS / DB Client (management and reporting)
```

### Database Rules

```
✅ DO                                        ❌ NEVER DO
─────────────────────────────────────────    ────────────────────────────────────────
Use relational tables with foreign keys      Use SQLite in production
Separate audit, security, AI, transactions   Mix domain data into the same table group
Use ORM for all standard queries             Hardcode secrets in application code
Keep DB config in .env only                  Put raw SQL in controllers without reason
Use explicit FK relationships                Bypass ORM without strong justification
Keep sensitive data in protected structures  Mix DB rules into UI code
```

---

## 7) Cache Architecture

Cache is an **infrastructure concern** — it lives inside `Backend/Features/Infrastructure/Cache/`.
It is never a business domain. It never owns data. It only serves performance.

### What Cache CAN Store

- Book catalog listings
- Book detail pages
- Dashboard statistics
- Library map data
- User permissions (short TTL)
- System settings and reference data
- AI responses (per session key)
- Borrowing and reservation summaries

### What Cache MUST NOT Store

- Passwords or password hashes
- Refresh tokens or MFA secrets
- Database credentials
- Private security secrets
- Sensitive personal data (full PII)

### Cache Key Naming Convention (from `cache_keys.py`)

```
book:{id}           → Single book detail
book:list           → Full catalog list
dashboard:stats     → Dashboard summary
user:perms:{id}     → User permission set
ai:response:{hash}  → Cached AI response
```

---

## 8) Security Rules

```
✅ DO                                        ❌ NEVER DO
─────────────────────────────────────────    ────────────────────────────────────────
Enforce auth decisions on the backend        Rely on frontend UI visibility as security
Keep API keys server-side only               Store API keys in frontend bundles
Put secrets in .env only                     Hardcode secrets in source code
Sanitize all public form inputs              Trust raw user input directly
Log all security events to SecurityEvents    Expose sensitive data in API logs
Use role-based access control (RBAC)         Grant access based on client-side checks
Protect all admin endpoints with middleware  Skip middleware for internal API routes
```

All public form submissions (Contact, Feedback) **must** pass through `input_sanitizer.py` to prevent XSS.
Backend middleware validates auth on every protected route before controllers are reached.

---

## 9) Cross-Platform Rules

| Platform | Technology | Entry |
|---|---|---|
| Web | React + Vite | `src/main.tsx` |
| Mobile | React Native | `Platforms/mobile/` |
| Desktop | React + Electron | `Platforms/desktop/` |

- Keep platform-specific adapters in `Platforms/` and never in `Features/` or `Components/`
- Shared business logic, types, and API contracts must be platform-agnostic
- Do not fork the entire architecture for each platform
- Do not duplicate feature logic three times — only platform adapter wrappers differ

---

## 10) File Comment Rules

Every file must have a one-line comment that answers:
- What layer owns this file?
- What is this file responsible for?
- What is NOT allowed here?

**Comment Format (TypeScript)**
```tsx
// [Layer: Features/Feedback] — FeedbackSection component.
// Renders feedback accordion with auto-slideshow.
// Do NOT put API calls or global state here.
```

**Comment Format (Python)**
```python
# [Layer: Services] — contact_service.py
# Validates contact form, sanitizes input, triggers email, calls repository.
# Do NOT query database directly — use ContactRepository only.
```

---

## 11) Adding a New Feature — Checklist

When Jhon adds a new feature (e.g., new CMS section, new page, new API endpoint):

```
1. [ ] Define the model in Data/Models/
2. [ ] Define enums in Data/Enums/ if fixed values are needed
3. [ ] Create migration via add_migration management command
4. [ ] Define repository interface in Repositories/Interfaces/
5. [ ] Implement repository in Repositories/Implementations/
6. [ ] Define service interface in Services/Interfaces/
7. [ ] Implement service in Services/Implementations/
8. [ ] Add serializer in Api/Serializers/
9. [ ] Add controller in Api/Controllers/
10. [ ] Register route in Api/Routes/api_router.py
11. [ ] Add frontend endpoint stub in src/Endpoints/
12. [ ] Add feature slice in src/Features/{FeatureName}/
13. [ ] Compose in the correct Page in src/Pages/
14. [ ] Update AuditLogs if the feature touches user data
15. [ ] Add cache invalidation to cache_invalidation.py if the feature is cached
```

---

## 12) Placement Decision Guide

When unsure where code belongs, ask these questions in order:

```
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

---

## 13) Final Strict Rules — Repeat and Follow Always

```
NEVER violate the flow chain.
NEVER create spaghetti code.
NEVER mix responsibilities.
NEVER bypass the architecture.
NEVER place code in the wrong layer.
NEVER skip layers in the chain.
NEVER put business logic in controllers.
NEVER put database queries in middleware.
NEVER put API calls in page components.
NEVER store secrets in frontend code.
ALWAYS keep comments on every file.
ALWAYS keep the structure visible and predictable.
ALWAYS follow the exact flow chain in section 3.
ALWAYS place new code by following section 12's decision guide.
ALWAYS run migrations through management commands, not raw Django commands.
```

---

*This skill is the single source of truth for all architecture decisions in the JRMSU Library System project.
Update this file when the project introduces new layers, platforms, or architectural changes.*
