# JRMSU Katipunan Campus Library — System Description

> **Version:** Production-Ready v1.0  
> **Stack:** React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 (Frontend) | Django 4.2 + DRF + MSSQL (Backend)  
> **Architecture:** Vertical Slice (Feature-based) — both Frontend and Backend  
> **Color Scheme:** Navy `#002B7F`, Deep Navy `#001655`, Gold `#C9A84C`, Light Gold `#F0D97A`  
> **Fonts:** Playfair Display (headings), Inter (body), JetBrains Mono (clock/monospace)

---

## Architecture Overview

### Frontend Architecture

```
frontend/src/
├── Pages/              # Route-level wrappers ONLY (no business logic)
│   ├── Admin/          # Admin panel pages
│   └── (Landing)       # Public landing pages
├── Features/           # Vertical slice domain components
│   ├── Admin/
│   │   └── components/ # AdminSidebar, AdminTopbar, BatchCard, MetricCard, etc.
│   ├── Home/           # Hero, About, NewBooks, etc.
│   └── Chatbot/        # Rizal AI bubble
├── Components/         # Shared global UI primitives
│   └── LayoutBars/     # TopNavBar, Footer
├── Endpoints/          # API clients (batchApi, contactApi, userApi, etc.)
├── Hooks/              # useToast, useAuth, etc.
├── Libs/               # apiClient, Assets/data.ts
└── LayoutStyles/       # Global CSS tokens (index.css, admin.css)
```

### Backend Architecture

```
backend/Features/
├── Models/             # Django ORM models (Account, AcquisitionBatch, ContactMessage, etc.)
├── Enums/              # Status enums, choices
├── Repositories/       # Database access layer (raw ORM, no business logic)
│   └── Implementations/
├── Services/           # Business logic layer
│   ├── Interfaces/     # Abstract base classes
│   └── Implementations/
├── Helpers/            # Utility helpers (email_helper, input_sanitizer)
└── Api/
    ├── Controllers/    # DRF ViewSets — HTTP entry points
    ├── Serializers/    # DRF serializers for request/response validation
    └── Urls/           # Router registrations
core/
├── settings.py         # Django configuration (DB, SMTP, CORS, throttle)
├── urls.py             # Root URL config
└── wsgi.py
```

### API Flow (Request Lifecycle)

```
Browser → Vite Proxy → Django Router
  → Controller (ViewSet) → get_permissions() + get_throttles()
  → Serializer (validate) → Service (business logic)
  → Repository (ORM) → Database (MSSQL)
  → Response serialized back
```

---

## Admin Panel Layout

### Global Layout Shell
**Files:**
- `Pages/Admin/AdminLayout.tsx` — root layout wrapper
- `Features/Admin/components/AdminSidebar.tsx`
- `Features/Admin/components/AdminTopbar.tsx`
- `LayoutStyles/admin.css`

**Structure:**
```
┌─────────────────────────────────────────────────────┐
│ AdminSidebar (fixed, 260px, Navy gradient)          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Brand Logo (Gold) + "JRMSU Library Admin Panel" │ │
│ │─────────────────────────────────────────────────│ │
│ │ [scrollable nav — overflow-y: auto]             │ │
│ │   OVERVIEW: Dashboard                           │ │
│ │   MANAGEMENT:                                   │ │
│ │     Newly Acquired Books                        │ │
│ │     Batch History                               │ │
│ │     Library Sections                            │ │
│ │     Content Manager                             │ │
│ │     E-Resources                                 │ │
│ │   SYSTEM:                                       │ │
│ │     Email & Reservations                        │ │
│ │     User Management                             │ │
│ │     Analytics                                   │ │
│ │     Reports Generator                           │ │
│ │─────────────────────────────────────────────────│ │
│ │ [pinned footer — flex: 0 0 auto] Logout btn    │ │
│ └─────────────────────────────────────────────────┘ │
│ AdminTopbar (sticky, white, shadow)                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Hamburger (mobile) | Page Title | User Info     │ │
│ └─────────────────────────────────────────────────┘ │
│ [Content Area — scrollable]                          │
└─────────────────────────────────────────────────────┘
```

**Responsive Behavior:**
- `> 768px` → Sidebar visible, can collapse to 72px icon mode
- `≤ 768px` → Sidebar hidden, slide-in drawer on hamburger tap with black overlay
- Logout button: always pinned via `flex: 0 0 auto` + `overflow: hidden` on aside

---

## Public Landing Page

**URL:** `http://localhost:3000/`  
**File:** `Pages/Home/HomePage.tsx`

### Section 1 — Hero
- Full-viewport height section with JRMSU library background image
- `section::before` rgba overlay (navy tinted, opacity 0.70)
- **Left side:** Library name (Playfair Display), tagline, two CTA buttons (Browse Collection, Contact Us)
- **Right side:** Real-time PH Library Status Clock — JetBrains Mono, Gold color, blinking colons
  - Shows: `MON-FRI 7AM-7PM` open/closed status in real time (UTC+8)
- Background blend: `background-blend-mode` never overrides with direct `background` on `<section>`

### Section 2 — Newly Acquired Books
- Horizontal scroll carousel of batch book cards
- Each card: cover image, title, author, category badge, accession number
- Data from: `GET /api/batches/display/` → `batchApi.getCurrentDisplayBatch()`

### Section 3 — Library Sections Gallery
- Responsive image grid of library sections (Reading Room, Filipiniana, etc.)
- Data from: `GET /api/gallery/` → `galleryApi.getAllImages()`

### Section 4 — About / Personnel
- Library history, mission/vision, organizational chart
- Staff cards with photos

### Section 5 — E-Resources
- Accordion tree of departments with downloadable files
- Folder/file icons, links open in new tab

### Section 6 — Contact / Chatbot
- Rizal AI bubble (bottom-right floating button)
- Opens a chat drawer with the Gemini-powered chatbot
- Rate limited: 10 messages/hour per anonymous user

### Footer
- Library logo, address, contact info, opening hours
- Social links, copyright

---

## Admin Modules

---

### Module 1: Dashboard
**URL:** `/admin`  
**File:** `Pages/Admin/DashboardPage.tsx`  
**Backend:** `report_controller.py` → `report_service.py`  
**API Endpoint:** `GET /api/reports/summary/`

**UI Layout:**
```
┌──────────────────────────────────────────────────────┐
│ Header: "Dashboard" + subtitle                       │
│──────────────────────────────────────────────────────│
│ Metric Cards Row (4 cards):                          │
│  [Total Visits] [Total Books] [Unread Emails] [Avg ★]│
│──────────────────────────────────────────────────────│
│ Left Column:                                         │
│  Recharts AreaChart — site visits over time          │
│  (interactive — hover shows value at cursor)         │
│──────────────────────────────────────────────────────│
│ Right Column:                                        │
│  System Status panel (DB, Email, API ping)           │
│  Recent Activity list (latest contacts/books)        │
└──────────────────────────────────────────────────────│
```

**Components:** `MetricCard`, `recharts AreaChart/LineChart`  
**Color:** NavyBlue backgrounds for cards, Gold accent bar on MetricCard

---

### Module 2: Newly Acquired Books
**URL:** `/admin/books`  
**File:** `Pages/Admin/BooksManagerPage.tsx`  
**Features:** `Features/Admin/components/BatchCard.tsx`, `CreateBatchModal.tsx`, `BookFormModal.tsx`  
**Backend:** `batch_controller.py` → `batch_service.py` → `book_repository.py`  
**API:** `GET/POST /api/batches/`, `GET /api/batches/{id}/`, `POST/PATCH/DELETE /api/batches/{id}/books/{bookId}/`

**UI Sections:**
1. **Metric Cards** — Total Batches, Active Display Book Count
2. **Recent Batches Grid** (3 cards) — `BatchCard` component:
   - Colored top border: Blue (open), Green (closed), Gray (archived)
   - Badges: "Active Display" (Gold/emerald), Status badge
   - Buttons: View Books, **View Audit** (ClipboardList icon, indigo), Continue/Close/Archive/Set as Display/Reopen
3. **Books Table/Grid** — for the selected batch
   - Toggle: Table view | Grid view
   - Filters: Search input, Category dropdown
   - Table columns: Title, Author, Accession, Category, Cover, Actions (Edit/Delete)

**Modals:**
- `CreateBatchModal` — form to create new batch (name, description, safety expiry)
- `BookFormModal` — add/edit individual book with cover image upload
- **Audit Trail Modal** — floating card (indigo header) showing batch lifecycle timeline:
  - "Batch Created/Opened" (blue dot)
  - "Batch Closed" (green dot, if applicable)
  - "Batch Archived" (gray dot)
  - "Set as Active Display" (emerald dot)
  - Stats grid: Total Books | Current Status
- `ConfirmModal` — for all destructive actions

---

### Module 3: Batch History
**URL:** `/admin/batch-history`  
**File:** `Pages/Admin/BatchHistoryPage.tsx`  
**Backend:** Same batch API

**UI Sections:**
1. **Filter Toolbar** — search by name, filter by year
2. **History Table** — all batches (open, closed, archived):
   - Columns: Batch Name, Status badge, Date Opened, Date Closed, Total Books, Actions
   - Actions: **View Audit** (ClipboardList, indigo → opens modal) | **Archive** (red, only for closed batches → ConfirmModal)
3. **Audit Trail Modal** (same design as Module 2's audit modal)

---

### Module 4: Library Sections
**URL:** `/admin/sections`  
**File:** `Pages/Admin/SectionsManagerPage.tsx`  
**Backend:** `gallery_controller.py` → `gallery_service.py`  
**API:** `GET/POST /api/gallery/`, `PATCH/DELETE /api/gallery/{id}/`

**UI Sections:**
1. **Metric Cards** — Total Images, Active Images
2. **View Toggle** — Grid view | Table view
3. **Search/Filter Toolbar**
4. **Image Grid** — each card shows:
   - Thumbnail, Title, Section Label, Active badge
   - Edit (Pencil) and Delete (Trash2) buttons with ConfirmModal
5. **Add/Edit Image Modal** — form with image file upload + preview

---

### Module 5: Content Manager
**URL:** `/admin/content`  
**File:** `Pages/Admin/ContentManagerPage.tsx`  
**Backend:** `cms_controller.py` → `cms_service.py`  
**API:** `GET/PATCH /api/cms/content/{slug}/`, `GET/POST/PATCH/DELETE /api/cms/links/`, `GET/POST/DELETE /api/cms/files/`

**UI — Three Tabs:**
1. **Page Text Content** — inline editable textarea per slug (hero_title, about_text, etc.)
2. **External Links** — table of managed links (label, URL, group, order, active toggle)
   - Add Link modal | Edit modal | Delete with ConfirmModal
3. **Downloadable Files** — table of managed files
   - Upload modal | Delete with ConfirmModal

---

### Module 6: E-Resources
**URL:** `/admin/eresources`  
**File:** `Pages/Admin/EResourcesManagerPage.tsx`  
**Backend:** `eresource_controller.py` → `eresource_service.py`  
**API:** `GET/POST/PATCH/DELETE /api/eresources/departments/`, `GET/POST/DELETE /api/eresources/files/`

**UI Layout — Two-Panel:**
```
┌──────────────────┬─────────────────────────────────┐
│ Left Panel       │ Right Panel                     │
│ Folder Tree      │ Files in selected department    │
│ (collapsible)    │                                 │
│ [+ Add Folder]   │ [+ Upload File]                 │
│                  │ File list with Download links   │
│ Each folder:     │                                 │
│ Edit | Delete    │ Each file:                      │
│ (ConfirmModal)   │ Name | Type | Delete            │
└──────────────────┴─────────────────────────────────┘
```

---

### Module 7: Email & Reservations
**URL:** `/admin/email`  
**File:** `Pages/Admin/EmailMessagePage.tsx`  
**Backend:** `contact_controller.py` → `contact_service.py` → Gmail SMTP  
**API:** `GET /api/contact/`, `PATCH /api/contact/{id}/`, `DELETE /api/contact/{id}/`, `POST /api/contact/{id}/reply/`

**Key Features:**
- **Message Batching:** Messages grouped by sender email using `reduce()` hash map
- **Unread indicators:** Badge showing `N unread` per sender group
- **Expand/Collapse:** Click group header to expand individual messages
- **Reply via SMTP:** "Reply via Email" button opens Reply Modal
  - Sends real email from `katipunan.library@jrmsu.edu.ph` via Gmail SMTP
  - Loading spinner during send, disabled buttons while sending
  - Marks message as `REPLIED` on success
- **Status Actions:** Mark Read, Approve/Decline (for Reservations), Archive, Delete Forever
- **Bulk Actions:** Select all / individual → Mark Read, Archive, Delete (with ConfirmModal)
- **Throttle:** Anonymous submissions: 10/hour | Admin operations: 2000/hour

**Modals:**
- **Reply Modal** (green gradient header) — textarea for reply, loading state, send status
- **ConfirmModal** — for destructive bulk/individual deletes

---

### Module 8: User Management
**URL:** `/admin/users`  
**File:** `Pages/Admin/UserManagementPage.tsx`  
**Backend:** `user_controller.py` → `user_service.py` → `user_repository.py`  
**API:** `GET/POST /api/users/`, `PATCH/DELETE /api/users/{id}/`, `POST /api/users/change_password/`

**UI Sections:**
1. **Metric Cards** — Total Admins, Active Accounts
2. **Search + "Add Admin" button** toolbar
3. **Users Table** — Name, Username, Email, Role (Admin badge), Status (Active/Disabled), Actions
   - Suspend/Activate (ShieldAlert icon → ConfirmModal)
   - Edit (Pencil → Edit Modal)
   - Delete (Trash2 → ConfirmModal)
4. **Add/Edit User Modal** — fields: First Name, Last Name, Email, Username, Password (optional for edit), Active checkbox

---

### Module 9: Analytics
**URL:** `/admin/analytics`  
**File:** `Pages/Admin/AnalyticsPage.tsx`  
**Backend:** `analytics_controller.py` → `analytics_service.py`  
**API:** `GET /api/analytics/`

**UI Sections:**
1. **Metric Cards** — Visits Today, This Month, Total Books, Total Emails
2. **Recharts AreaChart** — site visits over time (interactive hover tooltip)
3. **Recharts BarChart** — ratings distribution
4. **Recent Activity list**

---

### Module 10: Reports Generator
**URL:** `/admin/reports`  
**File:** `Pages/Admin/ReportsPage.tsx`  
**Backend:** `report_controller.py` → `report_service.py`  
**API:** `GET /api/reports/summary/`

**UI Sections:**
1. **Generator Controls** — Report Type dropdown (Summary, Visitors, Books, Interactions) + Date Range dropdown + "Generate Report" button
2. **Preview Toolbar** — Export CSV button, Print / Save PDF button
3. **Printable Report Area** (rendered for PDF):
   - Official JRMSU header (centered, bold)
   - **4-metric summary grid** (Total Visits, Books, Emails, Avg Rating)
   - **Recharts BarChart** — Feedback ratings (1-5 stars)
   - **Recharts PieChart** — Interactions (Emails vs Reservations)
   - **Recent Books table**
   - **Recent Activity table**
   - Generated-by footer with timestamp

**Export Formats:**
- **CSV:** `Blob` → virtual `<a download>` click
- **PDF:** `window.print()` with print-specific CSS (hides sidebar/toolbar)

---

### Module 11: Settings
**URL:** `/admin/settings`  
**File:** `Pages/Admin/SettingsPage.tsx`  
**Backend:** `settings_controller.py` → `settings_service.py` | `user_controller.py → change_password`  
**API:** `GET/PATCH /api/settings/`, `POST /api/users/change_password/`

**UI — Two-Tab Sidebar:**
1. **General Config tab:**
   - Library Name, Contact Email, Phone, Address
   - Opening Hours (Mon-Fri, Sat, Sun)
   - Save button
2. **Security tab:**
   - Current Password, New Password, Confirm Password
   - Validates match before submitting
   - Calls `change_password` — uses `update_session_auth_hash` to keep session active

---

## Shared Components

### `ConfirmModal`
**File:** `Features/Admin/components/ConfirmModal.tsx`  
- **Trigger:** Any destructive action (delete, archive, suspend)  
- **Design:** Centered overlay (black/50%), white card, AlertTriangle icon (red/orange/blue based on type), Cancel + Confirm buttons  
- **Types:** `danger` (red), `warning` (orange), `info` (blue)  
- **z-index:** 100 (above all other modals)

### `MetricCard`
**File:** `Features/Admin/components/MetricCard.tsx`  
- **Variants:** `navy`, `gold`, `green`, `blue`, `orange`, `purple`  
- **Design:** White card, 4px left border accent, icon circle, label, value

### `BatchCard`
**File:** `Features/Admin/components/BatchCard.tsx`  
- **Props:** batch, onViewBooks, onViewAudit, onClose, onArchive, onActivate, onReopen, onContinue  
- **Design:** White card with colored top border (blue=open, green=closed, gray=archived)

---

## Security & Rate Limiting

| Scope | Limit | Applied To |
|---|---|---|
| `anon` | 120/hour | Anonymous users (public site) |
| `user` | 2000/hour | Authenticated admin users |
| `contact` | 10/hour | Contact form submissions |

**Disposable Email Detection:**
- `Features/Helpers/email_helper.py` — blacklist of 100+ disposable domains
- DNS MX record check via `socket.getaddrinfo()`
- Returns HTTP 400 with clear error message

**Authentication:** Django Session-based (`SessionAuthentication`) with CSRF tokens injected automatically by `apiClient.ts`.

---

## Email System (SMTP)

| Setting | Value |
|---|---|
| Provider | Gmail via App Password |
| Account | katipunan.library@jrmsu.edu.ph |
| App Name | JRMSU-KC LIBRARY |
| Host | smtp.gmail.com:587 (TLS) |
| From Name | JRMSU-KC Library |

**Email flows:**
1. User submits contact form → staff gets notification email (background thread)
2. Admin replies via Admin Panel → user gets formatted reply from library email
3. Disposable/fake email → rejected at service layer before any DB write

---

## Color Token Reference

```css
/* Project Design Tokens */
--navy:       #002B7F;    /* Primary brand, sidebar, active links */
--deep-navy:  #001655;    /* Sidebar gradient start */
--gold:       #C9A84C;    /* Accent, active sidebar border, highlights */
--light-gold: #F0D97A;    /* Active sidebar link text */
--white:      #FFFFFF;    /* Cards, backgrounds */
--gray-50:    #F9FAFB;    /* Table backgrounds, form areas */
```
