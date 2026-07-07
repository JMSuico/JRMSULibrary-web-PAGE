# Security Implementation Plan — JRMSU Library System

## Security Audit Findings

After a comprehensive review of the codebase (backend API, settings, middleware, controllers, services, and frontend API client), I have identified several vulnerabilities and areas for security hardening. 

> [!WARNING]
> Some of these vulnerabilities, specifically related to user creation and rate limiting, pose a high risk and should be patched immediately before any production deployment.

---

### 1. Authentication & Privilege Escalation (High Risk)
**Finding:** 
The `UserViewSet` (`user_controller.py`) relies on the class-level `[permissions.IsAuthenticated]` permission. However, the `UserRepository.create()` method forces `is_staff = True` for all new users.
**Vulnerability:** 
Because there is no specific `IsSuperUser` check on the `create`, `update`, or `destroy` methods, *any* authenticated user could potentially create another admin account, leading to privilege escalation if non-admin accounts ever exist.
**Proposed Fix:** 
Apply the existing `IsSuperUser` permission explicitly to the `create`, `update`, `partial_update`, and `destroy` endpoints in `UserViewSet`.

### 2. Login Brute-Force Vulnerability (Medium Risk)
**Finding:** 
The login endpoint (`POST /api/users/login/`) currently falls back to the global `anon` (120/hour) or `user` (2000/hour) rate limits defined in `settings.py`.
**Vulnerability:** 
These global limits are far too generous for authentication endpoints, making the system susceptible to brute-force or credential-stuffing attacks.
**Proposed Fix:** 
Implement a specific `LoginRateThrottle` (e.g., 5-10 attempts per minute per IP) and apply it directly to the `login` action in `UserViewSet`.

### 3. Hardcoded Secrets in Settings (Medium Risk)
**Finding:** 
In `backend/core/settings.py`, the `EMAIL_HOST_PASSWORD` uses a hardcoded fallback (`'mmuh zbjb nyzg ovir'`).
**Vulnerability:** 
Hardcoded secrets committed to source control can be easily scraped. 
**Proposed Fix:** 
Remove the hardcoded fallback. Use `.env` variables strictly, and raise an `ImproperlyConfigured` error if critical secrets are missing in production.

### 4. Clickjacking & Security Headers (Low/Medium Risk)
**Finding:** 
In `core/settings.py`, `django.middleware.clickjacking.XFrameOptionsMiddleware` is commented out (Line 59).
**Vulnerability:** 
The API or admin panel could be embedded in malicious sites using iframes, leading to clickjacking.
**Proposed Fix:** 
Re-enable `XFrameOptionsMiddleware` and ensure `SECURE_BROWSER_XSS_FILTER` and `SECURE_CONTENT_TYPE_NOSNIFF` are explicitly set to `True`.

### 5. Session & CSRF Security (Configuration)
**Finding:** 
The frontend correctly passes `X-CSRFToken` from cookies. However, cookie security flags are missing for production environments.
**Proposed Fix:** 
In `settings.py`, when `DEBUG = False`, ensure that `SESSION_COOKIE_SECURE = True`, `CSRF_COOKIE_SECURE = True`, and `SESSION_COOKIE_HTTPONLY = True` are enabled so cookies are only transmitted over HTTPS and protected from XSS.

### 6. Analytics/Reports Data Exposure (Low Risk)
**Finding:** 
`ReportViewSet` uses `permissions.IsAuthenticated`.
**Vulnerability:** 
While all current users are staff, this is architecturally brittle. If a non-staff user role is introduced, they would have full access to site analytics and report generation.
**Proposed Fix:** 
Change the permission class on `ReportViewSet` and `SiteVisitViewSet` to require `IsSuperUser` or a specific admin-level permission.

### 7. Unrestricted File Uploads (High Risk)
**Finding:** 
In `contact_controller.py` (`upload_attachment`) and other controllers handling files (`user_controller.py`, `cms_controller.py`), the file extension is taken directly from the user's uploaded file without validation.
**Vulnerability:** 
An attacker could upload executable scripts (e.g., `.php`, `.py`, `.exe`, `.html`) to the media directory. If the web server is misconfigured to execute files in the media directory, this leads to Remote Code Execution (RCE). Malicious HTML could lead to Stored XSS.
**Proposed Fix:** 
Add rigorous file extension validation in `contact_controller.py` and enforce standard validation in serializers for other file uploads. Only allow safe extensions (e.g., pdf, docx, png, jpg).

---

### VI. AI Chatbot Rate Limiting & Session Caching
The integrated AI Chatbot (Rizal Assistant) utilizes the following security protocols:
1. **Frontend Local Storage**: Chat history is persisted via `localStorage` with a strictly enforced 2-hour sliding window expiration (`CACHE_EXPIRY_MS = 2 * 60 * 60 * 1000`). Once the cache naturally expires, the chatbot history is forcibly wiped to preserve user privacy on shared terminals.
2. **Backend Throttling (Rate Limiting)**: The `/api/ai/chat/` endpoint routes to the `AIViewSet` which restricts users under a specific `throttle_scope = 'chat'`. The global setting limits this to **100 requests per hour** to mitigate potential Denial of Service (DoS) and prevent token exhaustion on the local Ollama LLM inference service.
3. **Internal Proxy Security**: The Ollama API (`127.0.0.1:11434`) is never exposed externally. All queries are handled server-side through `ai_service.py` where a trusted System Prompt grounds responses based strictly on validated local library policy data.

---

### VII. Implementation Docker and Kubernetes
This project uses Docker for local testing and containerization. Security constraints apply during orchestration.

## Security Implementation Status (Current)

Based on the recent patches, here is the current status of system security:

**Excellent (Fully Patched & Hardened):**
- **Authentication & Privilege Escalation:** Admin creation, updates, and deletion now strictly require `IsSuperUser`.
- **Brute-Force & Credential Stuffing Prevention:** The login endpoint is securely throttled at 5 attempts per minute.
- **Secret Management:** Hardcoded SMTP credentials were removed from fallback configurations.
- **CSRF & Cookies:** Production cookies are securely flagged (`HttpOnly`, `Secure`, `SameSite`) when `DEBUG = False`.
- **SQL Injection Prevention:** 100% adherence to the Django ORM repository layer; zero raw SQL queries present.
- **File Upload Validation:** All uploads (`contact_controller.py`, `user_controller.py`, `cms_controller.py`) are strictly validated against safe whitelists.
- **CORS Configuration:** `CORS_ALLOWED_ORIGINS` dynamically pulls from `.env` variable for secure cross-origin enforcement in production.
- **HSTS (Strict Transport Security):** `SECURE_HSTS_SECONDS` is enforced in production to demand HTTPS.
- **Dependency Vulnerability Scanning:** Completed audit of frontend (`npm audit`) and backend (`pip-audit`), resulting in zero known vulnerabilities.
- **Action Auditing/Logging:** Added `AuditLogMiddleware` to track and log IP, Username, Endpoint, and Action for all state-changing requests (`POST`/`PUT`/`DELETE`/`PATCH`) in a structured backend log.

**Good (Mostly Secure):**
- **Cross-Site Scripting (XSS):** React sanitizes inputs by default, and `SECURE_BROWSER_XSS_FILTER` is active on the backend.
- **Clickjacking Protection:** `X-Frame-Options` is set to `DENY`.

**Partial (Needs Further Hardening):**
- *(None — all identified issues have been patched)*

**Not Implemented:**
- *(None — all Phase 1 and Phase 2 items are fully implemented)*

## Security Implementation Status (Final)

All proposed changes and architectural security lockdowns have been fully implemented, verified, and pushed to the active codebase. No further user review is required for these items.

The backend is fully secured with robust rate limits, strict SuperUser authorization, file upload validations, and comprehensive security middleware.

---

## Recommended Additional Security Measures (Phase 2)

To move the system from "Mostly Secure" to "Production-Ready", the following tasks are needed:

- [x] 1. **Complete File Extension Validation (CMS):** Add explicit allowed-extension lists to the `cms_controller.py` file upload handlers (`ManagedFileViewSet` and `EResourceFileViewSet`) to prevent even authenticated admins from uploading malicious scripts.
- [x] 2. **Environment-Driven CORS:** Remove `http://localhost:3000` from `settings.py` and implement a comma-separated `.env` variable (`ALLOWED_CORS_ORIGINS`) to prevent unauthorized cross-origin access in production.
- [x] 3. **Enable HSTS:** Add `SECURE_HSTS_SECONDS = 31536000` inside the `if not DEBUG:` block in `settings.py` to enforce HTTPS connections.
- [x] 4. **Dependency Audit:** Run `npm audit` on the frontend and use a tool like `safety` or `pip-audit` to check `requirements.txt` for known CVEs.
- [x] 5. **Detailed Activity Logging:** Implement a lightweight logging middleware that records IP, Username, Endpoint, and Action for all `POST`/`PUT`/`DELETE` requests made to `/api/` for forensic tracking.
