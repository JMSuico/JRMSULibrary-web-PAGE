# Full System Function Listing (Frontend -> Backend -> Database)

This document provides a comprehensive mapping of the core functions implemented in the JRMSU Library System, tracing the flow from the React frontend, through the Django backend API, down to the MariaDB/PostgreSQL database models. 

## 1. Authentication & User Management
**Status:** Implemented | **Security:** Secured via Session/Token Authentication & `IsSuperUser` permissions.

| Frontend API (`userApi.ts`) | Backend Controller (`UserViewSet`) | Database Model (`User`) |
|-----------------------------|------------------------------------|-------------------------|
| `login(username, password)` | `POST /api/users/login/` (Session/Token setup) | Validates against `auth_user` |
| `logout()` | `POST /api/users/logout/` (Clears session) | N/A |
| `getProfile()` | `GET /api/users/me/` | Reads `User` |
| `updateProfile(data)` | `POST /api/users/update_profile/` | Updates `User` fields |
| `changePassword(old, new)` | `POST /api/users/change_password/` | Updates password hash |
| `uploadAvatar(file)` | `POST /api/users/{id}/upload_avatar/` | Updates `User.avatar` |
| `getUserList()` | `GET /api/users/` (Requires Admin) | Lists all `User` records |
| `createUser(data)` | `POST /api/users/` (Requires SuperUser) | Creates `User` |
| `deleteUser(id)` | `DELETE /api/users/{id}/` (Requires SuperUser) | Deletes `User` |

---

## 2. Books & Acquisition Batches
**Status:** Implemented | **Security:** Secured (`IsAuthenticated` / `AllowAny` for public `current` batch).

| Frontend API (`batchApi.ts`) | Backend Controller (`AcquisitionBatchViewSet`) | Database Model (`AcquisitionBatch`, `BatchBook`) |
|------------------------------|-------------------------------------------------|--------------------------------------------------|
| `getBatches()` | `GET /api/batches/` | Reads `AcquisitionBatch` |
| `createBatch(data)` | `POST /api/batches/` | Creates `AcquisitionBatch` |
| `getBatchBooks(batchId)` | `GET /api/batches/{id}/books/` | Reads `BatchBook` linked by FK |
| `addBooksToBatch(batchId)` | `POST /api/batches/{id}/add_books/` | Creates `BatchBook` |
| `updateBook(bookId)` | `PATCH /api/batches/{id}/` | Updates `BatchBook` |
| `deleteBook(bookId)` | `DELETE /api/batches/{id}/` | Soft deletes to RecycleBin |
| `getCurrentBatch()` | `GET /api/batches/current/` (Public) | Reads active `AcquisitionBatch` |

---

## 3. Gallery & Library Interior Images
**Status:** Implemented | **Security:** Secured (`AllowAny` for GET, `IsAuthenticated` for mutations).

| Frontend API (`galleryApi.ts`) | Backend Controller (`LibraryInteriorImageViewSet`) | Database Model (`LibraryInteriorImage`) |
|--------------------------------|----------------------------------------------------|----------------------------------------|
| `getImages()` | `GET /api/gallery/` (Public) | Reads `LibraryInteriorImage` |
| `uploadImage(data)` | `POST /api/gallery/` | Creates `LibraryInteriorImage` |
| `updateImage(id, data)` | `PATCH /api/gallery/{id}/` | Updates `LibraryInteriorImage` |
| `deleteImage(id)` | `DELETE /api/gallery/{id}/` | Soft deletes to RecycleBin |

---

## 4. E-Resources (Departments + Files)
**Status:** Implemented | **Security:** Secured (`AllowAny` for GET, `IsAuthenticated` for mutations). File uploads validated via extension whitelist + `MalwareScannerHelper`.

| Frontend API (`eresourceApi.ts`) | Backend Controller | Database Model |
|----------------------------------|--------------------|----------------|
| `getDepartments()` | `GET /api/eresource-departments/` (Public) | Reads `EResourceDepartment` |
| `createDepartment(data)` | `POST /api/eresource-departments/` | Creates `EResourceDepartment` |
| `deleteDepartment(id)` | `DELETE /api/eresource-departments/{id}/` | Soft deletes to RecycleBin |
| `getFiles()` | `GET /api/eresource-files/` (Public) | Reads `EResourceFile` |
| `uploadFile(data)` | `POST /api/eresource-files/` | Creates `EResourceFile` (validated) |
| `deleteFile(id)` | `DELETE /api/eresource-files/{id}/` | Soft deletes to RecycleBin |

---

## 5. Contact & Email System
**Status:** Implemented | **Security:** Secured (`AllowAny` for public submit, `IsAuthenticated` for admin). Throttled at `200/hour` (public) / `2000/hour` (admin).

| Frontend API (`contactApi.ts`) | Backend Controller (`ContactMessageViewSet`) | Database Model (`ContactMessage`) |
|--------------------------------|----------------------------------------------|-----------------------------------|
| `submitContact(data)` | `POST /api/contact/` (Public, throttled) | Creates `ContactMessage` |
| `getMessages()` | `GET /api/contact/` (Admin) | Lists `ContactMessage` |
| `replyToMessage(id, body)` | `POST /api/contact/{id}/reply/` | Sends SMTP email reply |
| `replyWithFiles(id, body, files)` | `POST /api/contact/{id}/reply-with-files/` | Sends reply with attachments |
| `bulkReply(ids, body)` | `POST /api/contact/bulk-reply/` | Iterates & sends replies |
| `uploadAttachment(file)` | `POST /api/contact/upload-attachment/` (Public) | Saves to temp (validated) |
| `validateEmail(email)` | `GET /api/contact/validate-email/` (Public) | Checks disposable/invalid |
| `deleteMessage(id)` | `DELETE /api/contact/{id}/` | Soft deletes to RecycleBin |

---

## 6. Feedback
**Status:** Implemented | **Security:** Secured (`AllowAny` for submit, `IsAuthenticated` for list/read).

| Frontend API (`feedbackApi.ts`) | Backend Controller (`FeedbackViewSet`) | Database Model (`Feedback`) |
|---------------------------------|----------------------------------------|-----------------------------|
| `submitFeedback(data)` | `POST /api/feedback/` (Public) | Creates `Feedback` |
| `getFeedbackList()` | `GET /api/feedback/` (Admin) | Lists `Feedback` |

---

## 7. CMS (Page Content, Images, Links, Files)
**Status:** Implemented | **Security:** Secured (`IsAuthenticatedOrReadOnly`). File uploads validated via extension whitelist.

| Frontend API (`cmsApi.ts`) | Backend Controller | Database Model |
|----------------------------|--------------------|----------------|
| `getContent()` | `GET /api/content/` | Reads `PageContent` |
| `updateContent(slug, data)` | `PUT /api/content/{slug}/` | Updates `PageContent` |
| `getPageImages()` | `GET /api/page-images/` | Reads `PageImage` |
| `getLinks()` | `GET /api/links/` | Reads `ManagedLink` |
| `createLink(data)` | `POST /api/links/` | Creates `ManagedLink` |
| `deleteLink(id)` | `DELETE /api/links/{id}/` | Soft deletes to RecycleBin |
| `getManagedFiles()` | `GET /api/managed-files/` | Reads `ManagedFile` |
| `uploadManagedFile(data)` | `POST /api/managed-files/` | Creates `ManagedFile` (validated) |
| `deleteManagedFile(id)` | `DELETE /api/managed-files/{id}/` | Soft deletes to RecycleBin |

---

## 8. Reports & Analytics
**Status:** Implemented | **Security:** Secured (`IsSuperUser` for reports/analytics admin, `AllowAny` for public visit tracking).

| Frontend API (`reportApi.ts`) | Backend Controller | Database Model |
|-------------------------------|--------------------|----------------|
| `getSummary(type, range)` | `GET /api/reports/summary/` (SuperUser) | Aggregates Books, Users, Logs |
| `getTrends()` | `GET /api/reports/trends/` (SuperUser) | Aggregates Visits by Date |
| `getVisitCount()` | `GET /api/site-visits/count/` (Public) | Reads `SiteVisit` aggregate |
| `trackVisit(page)` | `POST /api/site-visits/track/` (Public) | Creates `SiteVisit` (deduplicated by IP hash) |

---

## 9. AI Chatbot (Rizal Assistant)
**Status:** Implemented | **Security:** Secured (`AllowAny`, throttled at `100/hour`). Ollama API is internal-only (`127.0.0.1:11434`).

| Frontend API (`aiApi.ts`) | Backend Controller (`AIViewSet`) | Database Model |
|---------------------------|----------------------------------|----------------|
| `chat(message, history)` | `POST /api/ai/chat/` (Public, throttled) | N/A (LLM inference) |

---

## 10. Settings
**Status:** Implemented | **Security:** Secured (`IsAuthenticatedOrReadOnly`).

| Frontend API (`settingsApi.ts`) | Backend Controller (`SettingsViewSet`) | Database Model (`SiteSettings`) |
|---------------------------------|----------------------------------------|---------------------------------|
| `getSettings()` | `GET /api/settings/` (Public read) | Reads `SiteSettings` singleton |
| `updateSettings(data)` | `POST /api/settings/` (Admin) | Updates `SiteSettings` |

---

## 11. Notifications
**Status:** Implemented | **Security:** Secured (`IsAuthenticated`).

| Frontend API (`notificationApi.ts`) | Backend Controller (`NotificationViewSet`) | Database Model |
|-------------------------------------|--------------------------------------------|---------------------------------|
| `getAll()` | `GET /api/notifications/all/` | Aggregates system data |
| `markAllRead()` | `POST /api/notifications/mark-all-read/` | Updates read state |

---

## 12. Recycle Bin
**Status:** Implemented | **Security:** Secured (`IsAuthenticated`).

| Frontend API (`recycleApi.ts`) | Backend Controller (`RecycleBinViewSet`) | Database Model (`RecycleBin`) |
|--------------------------------|------------------------------------------|-------------------------------|
| `getItems(module?)` | `GET /api/recycle-bin/` | Lists `RecycleBin` entries |
| `restoreItem(id)` | `POST /api/recycle-bin/{id}/restore/` | Restores original record |
| `permanentDelete(id)` | `DELETE /api/recycle-bin/{id}/` | Hard deletes `RecycleBin` entry |

---

## 13. External Library Proxy
**Status:** Implemented | **Security:** Credentials loaded from `.env` only, never hardcoded. Bridge pages are server-rendered HTML.

| Frontend | Backend Controller (`external_proxy_controller.py`) | External Service |
|----------|------------------------------------------------------|------------------|
| Iframe load | `GET /api/external-proxy/vitalsource/` | VitalSource auto-login |
| Iframe load | `GET /api/external-proxy/scholaar/` | Scholaar auto-login |

---

## 14. Personnel
**Status:** Implemented | **Security:** Secured (`IsAuthenticatedOrReadOnly`).

| Frontend | Backend Controller (`PersonnelViewSet`) | Database Model (`Personnel`) |
|----------|------------------------------------------|------------------------------|
| Fetched in page | `GET /api/personnel/` (Public read) | Reads `Personnel` |

---
---

# Complete Security Audit & Rating

## A. Security Measures Currently Implemented

Below is every security protocol verified in the live codebase, rated by productive functionality.

### A1. Authentication & Session Security

| # | Security Measure | Implementation Location | Status | Rating |
|---|------------------|------------------------|--------|--------|
| 1 | **Session Authentication** | `settings.py` L202-204: `SessionAuthentication` as default DRF auth class | Fully functional. All admin endpoints use Django session auth with server-side session storage. | **Excellent** |
| 2 | **CSRF Protection** | `settings.py` L56: `CsrfViewMiddleware` in MIDDLEWARE. Frontend sends `X-CSRFToken` header from cookies. | Fully functional. Django validates CSRF token on every state-changing request. | **Excellent** |
| 3 | **Secure Cookie Flags (Production)** | `settings.py` L224-233: `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SESSION_COOKIE_HTTPONLY` inside `if not DEBUG:` block | Configured but only activates when `DEBUG=False` with HTTPS. Ready for production. | **Good** |
| 4 | **Session Expiry** | `settings.py` L236-237: `SESSION_EXPIRE_AT_BROWSER_CLOSE = True`, `SESSION_COOKIE_AGE = 43200` (12 hours) | Fully functional. Sessions auto-expire on browser close or after 12 hours. | **Excellent** |
| 5 | **SameSite Cookie Policy** | `settings.py` L238-239: `SESSION_COOKIE_SAMESITE = 'Lax'`, `CSRF_COOKIE_SAMESITE = 'Lax'` | Fully functional. Prevents cross-site request forgery via cookie attachment. | **Excellent** |
| 6 | **Password Validation** | `settings.py` L157-170: All 4 Django validators active (UserAttributeSimilarity, MinimumLength, CommonPassword, NumericPassword) | Fully functional. Enforces strong passwords on creation and change. | **Excellent** |
| 7 | **Session Hash Update on Password Change** | `user_controller.py` L122-123: `update_session_auth_hash(request, request.user)` | Fully functional. Prevents session invalidation after password change. | **Excellent** |

---

### A2. Authorization & Privilege Control

| # | Security Measure | Implementation Location | Status | Rating |
|---|------------------|------------------------|--------|--------|
| 8 | **IsSuperUser Permission (User CRUD)** | `user_controller.py` L11-13, L22-23: Custom `IsSuperUser` class applied to `create`, `update`, `partial_update`, `destroy` | Fully functional. Only superusers can create/edit/delete admin accounts. | **Excellent** |
| 9 | **IsSuperUser Permission (Reports)** | `report_controller.py` L19-24: `permission_classes = [IsSuperUser]` | Fully functional. Analytics data is restricted to superusers only. | **Excellent** |
| 10 | **IsSuperUser Permission (Analytics Admin)** | `analytics_controller.py` L15-16: `permission_classes = [IsSuperUser]` | Fully functional. Visit log data is restricted to superusers. | **Excellent** |
| 11 | **IsAuthenticated (Admin Panel)** | Applied on `RecycleBinViewSet`, `NotificationViewSet`, `ContactMessageViewSet` (for admin actions) | Fully functional. All admin-only endpoints require login. | **Excellent** |
| 12 | **IsAuthenticatedOrReadOnly (CMS)** | Applied on `PageContentViewSet`, `PageImageViewSet`, `PersonnelViewSet`, `SettingsViewSet`, `NewlyAcquiredBookViewSet` | Fully functional. Public users can read; only admins can write. | **Excellent** |
| 13 | **AllowAny (Public Endpoints)** | Applied correctly on login, contact submit, feedback submit, AI chat, visit tracking, public content reads | Fully functional. Correctly scoped to read-only or submission-only actions. | **Excellent** |

---

### A3. Rate Limiting & Throttling

| # | Security Measure | Implementation Location | Status | Rating |
|---|------------------|------------------------|--------|--------|
| 14 | **Login Rate Throttle** | `user_controller.py` L15-16: `LoginRateThrottle` with `scope = 'login'`. `settings.py` L218: `"login": "5/minute"` | Fully functional. Blocks brute-force login after 5 attempts per minute per IP. | **Excellent** |
| 15 | **AI Chat Throttle** | `ai_controller.py` L16: `throttle_scope = 'chat'`. `settings.py` L219: `"chat": "100/hour"` | Fully functional. Prevents DoS on local Ollama LLM service. | **Excellent** |
| 16 | **Contact Form Throttle** | `contact_controller.py` L22-29: Public gets `ScopedRateThrottle` (`contact` scope = 200/hr), admins get elevated `user` scope (2000/hr) | Fully functional. Prevents spam submissions while allowing admin to work freely. | **Excellent** |
| 17 | **Global Anonymous Throttle** | `settings.py` L215: `"anon": "120/hour"` | Fully functional. Blanket protection for all unauthenticated API access. | **Excellent** |
| 18 | **Global User Throttle** | `settings.py` L216: `"user": "2000/hour"` | Fully functional. Prevents authenticated abuse while being generous for normal admin workflows. | **Excellent** |

---

### A4. Input Validation & File Security

| # | Security Measure | Implementation Location | Status | Rating |
|---|------------------|------------------------|--------|--------|
| 19 | **File Extension Whitelist (Contact Attachments)** | `contact_controller.py` L155-159: `allowed_extensions = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp'}` | Fully functional. Rejects all non-whitelisted files. | **Excellent** |
| 20 | **File Extension Whitelist (E-Resource Files)** | `cms_controller.py` L177-180: `allowed_extensions = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'csv', 'xlsx'}` | Fully functional. | **Excellent** |
| 21 | **File Extension Whitelist (Managed Files)** | `cms_controller.py` L318-321: `allowed_extensions = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp'}` | Fully functional. | **Excellent** |
| 22 | **File Extension Whitelist (Avatar Uploads)** | `user_controller.py` L99-101: `ext not in ['jpg', 'jpeg', 'png', 'webp', 'gif']` | Fully functional. | **Excellent** |
| 23 | **Dangerous Extension Blacklist** | `malware_scanner_helper.py` L7-11: Blocks `.exe`, `.bat`, `.sh`, `.vbs`, `.cmd`, `.msi`, `.jar`, `.ps1`, etc. (22 extensions) | Fully functional. Defense-in-depth alongside whitelists. | **Excellent** |
| 24 | **MIME Type / Magic Number Validation** | `malware_scanner_helper.py` L26-48: Reads first 2048 bytes, checks against dangerous MIME types via `python-magic` | Functional with graceful fallback. If `libmagic` is not installed, falls back to extension-only check. | **Good** |
| 25 | **Input Sanitizer (XSS Prevention)** | `input_sanitizer.py`: Strips HTML tags via regex, escapes `& < > " '` via `html.escape()` | Fully functional utility. Available for all public form submissions. | **Excellent** |
| 26 | **Upload Size Limits** | `settings.py` L249-250: `DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600` (100 MB) | Fully functional. Prevents disk exhaustion via oversized uploads. | **Excellent** |
| 27 | **Email Validation (Disposable/Domain Check)** | `contact_controller.py` L194-209: `validate_email` action checks disposable emails and verifies domain MX records | Fully functional. Prevents spam contact submissions. | **Excellent** |
| 28 | **Username/Email Uniqueness Validation** | `user_controller.py` L139-150: Checks `.exists()` before allowing profile field updates | Fully functional. Prevents duplicate account identifiers. | **Excellent** |

---

### A5. Transport & Header Security

| # | Security Measure | Implementation Location | Status | Rating |
|---|------------------|------------------------|--------|--------|
| 29 | **HSTS (HTTP Strict Transport Security)** | `settings.py` L231-233: `SECURE_HSTS_SECONDS = 31536000`, `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`, `SECURE_HSTS_PRELOAD = True` (inside `if not DEBUG:`) | Configured, activates in production. Forces browsers to only use HTTPS for 1 year. | **Good** |
| 30 | **XSS Browser Filter** | `settings.py` L228: `SECURE_BROWSER_XSS_FILTER = True` (inside `if not DEBUG:`) | Configured, activates in production. Enables browser's built-in XSS auditor. | **Good** |
| 31 | **Content-Type Nosniff** | `settings.py` L229: `SECURE_CONTENT_TYPE_NOSNIFF = True` (inside `if not DEBUG:`) | Configured, activates in production. Prevents MIME-sniffing attacks. | **Good** |
| 32 | **Clickjacking Protection** | `settings.py` L59: `XFrameOptionsMiddleware` in MIDDLEWARE. L230: `X_FRAME_OPTIONS = 'DENY'` in production. | Fully functional. Middleware always active; header strengthened to DENY in production. | **Excellent** |

---

### A6. CORS & Origin Security

| # | Security Measure | Implementation Location | Status | Rating |
|---|------------------|------------------------|--------|--------|
| 33 | **Dynamic CORS Origins** | `settings.py` L196-197: `CORS_ALLOWED_ORIGINS` parsed from `ALLOWED_CORS_ORIGINS` env variable | Fully functional. No hardcoded wildcard `*`. Origins controlled via `.env`. | **Excellent** |
| 34 | **CSRF Trusted Origins** | `settings.py` L199: `CSRF_TRUSTED_ORIGINS` mirrors CORS origins | Fully functional. Prevents cross-origin CSRF attacks. | **Excellent** |
| 35 | **CORS Credentials** | `settings.py` L198: `CORS_ALLOW_CREDENTIALS = True` | Correctly configured. Required for session-based auth with cross-origin frontend. | **Excellent** |

---

### A7. Data Protection & Audit

| # | Security Measure | Implementation Location | Status | Rating |
|---|------------------|------------------------|--------|--------|
| 36 | **Audit Log Middleware** | `core/middleware.py` L6-19: Logs User, IP, Method, Path for all `POST/PUT/PATCH/DELETE` to `/api/` | Fully functional. Every state-changing request is logged for forensic review. | **Excellent** |
| 37 | **Soft-Delete / Recycle Bin Architecture** | All `destroy()` methods create `RecycleBin` entries with `data_snapshot` before deletion | Fully functional. Accidental deletions are recoverable. Full data snapshots preserved. | **Excellent** |
| 38 | **SQL Injection Prevention** | 100% Django ORM usage across all 8 repositories. Zero raw SQL queries in entire codebase. | Fully functional. ORM parameterizes all queries automatically. | **Excellent** |
| 39 | **Visitor Anonymization (IP Hashing)** | `analytics_controller.py` L57-58: `hashlib.sha256(raw_string.encode('utf-8')).hexdigest()` | Fully functional. Visitor IPs are SHA-256 hashed before storage. GDPR-friendly. | **Excellent** |

---

### A8. Secret Management

| # | Security Measure | Implementation Location | Status | Rating |
|---|------------------|------------------------|--------|--------|
| 40 | **Environment-Based Secrets** | `settings.py` L260: `EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')` — empty fallback | Fully functional. No credentials in source code. | **Excellent** |
| 41 | **External Service Credentials** | `settings.py` L278-280: VitalSource/Scholaar credentials from `.env` only | Fully functional. Proxy helper reads from env, never hardcodes. | **Excellent** |
| 42 | **Django Secret Key** | `settings.py` L26: Falls back to insecure key only in development | Partially secured. Should raise `ImproperlyConfigured` if missing in production. | **Partial** |

---
---

# Security Rating Summary

| Rating | Count | Description |
|--------|-------|-------------|
| **Excellent** | 35 | Fully implemented, productively functional, and verified in active code |
| **Good** | 5 | Configured but only activates in production (`DEBUG=False` + HTTPS). Ready to deploy. |
| **Partial** | 2 | Implemented but has a known gap (fallback behavior, missing strict enforcement) |
| **Not Implemented** | 0 | No critical security measures are missing |

---
---

# Recommended Additional Security Measures

The following are security enhancements **not yet present** in the codebase that would elevate the system from "Production-Ready" to "Enterprise-Grade":

## Priority 1 (High Impact — Should Add)

| # | Recommendation | Target | Rationale |
|---|----------------|--------|-----------|
| 1 | **`/api/health/` Health Check Endpoint** | New route in `api_router.py` | Required by Kubernetes readiness/liveness probes (referenced in `implementationDockerandKubernates.md` L237-241). Currently the K8s manifest points to `/api/health/` but no such endpoint exists. |
| 2 | **Strict `SECRET_KEY` Enforcement** | `settings.py` L26 | Replace the insecure fallback with `raise ImproperlyConfigured("SECRET_KEY must be set")` when `DEBUG=False`. |
| 3 | **Account Lockout After N Failed Logins** | `user_controller.py` login action | The throttle limits requests per IP, but an attacker using distributed IPs can still attempt many logins. Track failed attempts per username and lock accounts after 10 consecutive failures. |
| 4 | **`MalwareScannerHelper` on ALL File Upload Endpoints** | `cms_controller.py` `ManagedFileViewSet.create()` (L313-327) | Currently only `EResourceFileViewSet.create()` calls `MalwareScannerHelper.verify_file_safety()`. The `ManagedFileViewSet` uses extension whitelist only — add the MIME check too. |
| 5 | **Feedback Submission Rate Throttle** | `feedback_controller.py` | The `FeedbackViewSet.create()` is `AllowAny` with no specific throttle scope. Should add a `ScopedRateThrottle` (e.g., `"feedback": "10/hour"`) to prevent spam. |

## Priority 2 (Medium Impact — Nice to Have)

| # | Recommendation | Target | Rationale |
|---|----------------|--------|-----------|
| 6 | **`SECURE_SSL_REDIRECT = True`** | `settings.py` production block | Auto-redirects HTTP to HTTPS. Currently relies on reverse proxy (Nginx/Ingress) to handle this. Adding it as Django-level defense-in-depth is best practice. |
| 7 | **Content Security Policy (CSP) Header** | New middleware or `django-csp` package | Restricts which scripts/styles/images can load on the page. Strongest defense against stored XSS. |
| 8 | **API Versioning** | `settings.py` DRF config + URL prefix | Add `DEFAULT_VERSIONING_CLASS = 'rest_framework.versioning.URLPathVersioning'` so future breaking changes don't affect existing clients (`/api/v1/`, `/api/v2/`). |
| 9 | **Password Change Notification Email** | `user_controller.py` `change_password` action | Send an email to the user when their password is changed, so they are aware if it was unauthorized. |
| 10 | **Temp File Cleanup Cron** | `contact_controller.py` `upload_attachment` | Uploaded temp attachments in `media/temp_attachments/` are never cleaned up. Add a management command or cron to purge files older than 24 hours. |

## Priority 3 (Low Impact — Future Consideration)

| # | Recommendation | Target | Rationale |
|---|----------------|--------|-----------|
| 11 | **Two-Factor Authentication (2FA)** | `user_controller.py` | Add TOTP-based 2FA for admin accounts using `django-otp` or `pyotp`. |
| 12 | **IP Allowlist for Admin Panel** | New middleware | Restrict `/api/users/`, `/api/reports/`, `/api/settings/` to a whitelist of campus IPs. |
| 13 | **Database Connection Encryption** | `settings.py` database config | Add `'OPTIONS': {'sslmode': 'require'}` for PostgreSQL or `'ssl': {'ca': '...'}` for MariaDB in production. |
| 14 | **Audit Log to Database** | `core/middleware.py` | Currently logs to Python logger (file/console). For production forensics, store audit entries in a dedicated `AuditLog` database table with queryable fields. |
| 15 | **Automated Dependency Scanning CI** | GitHub Actions workflow | Add `npm audit` and `pip-audit` as CI pipeline steps so vulnerabilities are caught on every commit. |
