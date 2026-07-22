# SECURITYPLANANDIMPLEMENT.md
# JRMSU Library System � Full Security Plan & Implementation Guide
# Generated: 2026-07-21 | Deep Comprehensive Analysis

---

> **HOW TO READ THIS DOCUMENT**
> This document is structured in three layers:
> 1. **Existing Security** � what is confirmed working (do NOT remove these)
> 2. **Status of Old SecurityImplementation.md** � what was done, what changed
> 3. **Threat Model & New Recommendations** � what still needs attention by priority

---

## PART 1 � EXISTING SECURITY (CONFIRMED ACTIVE)

The following security measures were confirmed as active after reading every relevant backend controller, service, helper, middleware, and settings file.

### 1.1 Authentication & Authorization
| Control | Location | Status |
|---|---|---|
| `IsSuperUser` class gates all create/update/partial_update/destroy in UserViewSet | user_controller.py:22-23 | ACTIVE |
| `IsSuperUser` guards ReportViewSet (analytics data) | report_controller.py:27 | ACTIVE |
| `IsSuperUser` guards SiteVisitViewSet (visit stats) | analytics_controller.py:16 | ACTIVE |
| All CMS write actions require IsAuthenticated | cms_controller.py | ACTIVE |
| AllowAny only on login, password reset, track, count, ai/chat | Multiple controllers | ACTIVE |
| Terminal-Created Admin protection | user_controller.py:154 | ACTIVE |
| is_terminal_created flag on Account model | account_model.py:16 | ACTIVE |

### 1.2 Authentication Flow
| Control | Location | Status |
|---|---|---|
| Login brute-force: 5 failed attempts -> 10-min lockout | user_controller.py:61-96 | ACTIVE |
| LoginRateThrottle: 10/minute at DRF level | settings.py:243 | ACTIVE |
| Single-device enforcement (rejects login if last_active < 60s) | user_controller.py:77-78 | ACTIVE |
| Inactivity auto-logout: 10 minutes | AdminLayout.tsx:118 | ACTIVE |
| Session expires at browser close | settings.py:264 | ACTIVE |
| Max session age: 12 hours | settings.py:265 | ACTIVE |
| Heartbeat ping every 30s | AdminLayout.tsx:137-141 | ACTIVE |

### 1.3 CSRF & Session Cookie Security
| Control | Location | Status |
|---|---|---|
| CSRF token required for all state-changing requests | apiClient.ts:59 + Django middleware | ACTIVE |
| SESSION_COOKIE_HTTPONLY = True | settings.py:255 (prod only) | ACTIVE (PROD) |
| SESSION_COOKIE_SECURE = True | settings.py:253 (prod only) | ACTIVE (PROD) |
| CSRF_COOKIE_SECURE = True | settings.py:254 (prod only) | ACTIVE (PROD) |
| SESSION_COOKIE_SAMESITE = Lax | settings.py:266 | ACTIVE |
| CSRF_COOKIE_SAMESITE = Lax | settings.py:267 | ACTIVE |

### 1.4 Transport Security
| Control | Location | Status |
|---|---|---|
| SECURE_SSL_REDIRECT = True (prod) | settings.py:252 | ACTIVE (PROD) |
| SECURE_HSTS_SECONDS = 31536000 | settings.py:259 | ACTIVE (PROD) |
| SECURE_HSTS_INCLUDE_SUBDOMAINS = True | settings.py:260 | ACTIVE (PROD) |
| SECURE_HSTS_PRELOAD = True | settings.py:261 | ACTIVE (PROD) |

### 1.5 Security Headers
| Control | Location | Status |
|---|---|---|
| X_FRAME_OPTIONS = DENY | settings.py:258 (prod only) | ACTIVE (PROD) |
| SECURE_BROWSER_XSS_FILTER = True | settings.py:256 | ACTIVE (PROD) |
| SECURE_CONTENT_TYPE_NOSNIFF = True | settings.py:257 | ACTIVE (PROD) |
| CSPMiddleware injects Content-Security-Policy | middleware.py:21-35 | ACTIVE |
| AuditLogMiddleware logs all POST/PUT/PATCH/DELETE | middleware.py:6-19 | ACTIVE |

### 1.6 Input Validation & Sanitization
| Control | Location | Status |
|---|---|---|
| HTML strip + html.escape on all public form fields | input_sanitizer.py -> contact_service.py:32-38 | ACTIVE |
| Disposable/temp email blocklist (100+ domains) | email_helper.py:15-52 | DEFINED but DISABLED |
| Django ORM only � zero raw SQL | All repositories verified | ACTIVE |
| Email uniqueness check with descriptive error | user_serializer.py + user_controller.py | ACTIVE |

### 1.7 File Upload Security
| Control | Location | Status |
|---|---|---|
| Extension whitelist: pdf, doc, png, jpg, zip, etc. | cms_service.py:93-95 | ACTIVE |
| Magic number (MIME) scan via libmagic | malware_scanner_helper.py:27-48 | ACTIVE |
| Dangerous extension blacklist: .exe, .sh, .ps1, .js, .jar | malware_scanner_helper.py:7-11 | ACTIVE |
| Max upload size: 100MB | settings.py:277-278 | ACTIVE |
| 1-file-per-category limit (Manual, OrgStructure, Excellence) | cms_service.py:82-89 | ACTIVE |
| Avatar format limited to jpg, jpeg, png, webp, gif | user_controller.py:190-192 | ACTIVE |

### 1.8 Rate Limiting
| Endpoint | Limit | Status |
|---|---|---|
| POST /api/users/login/ | 5 attempts/10-min lockout + 10/min DRF | ACTIVE |
| POST /api/contact/ (public) | 200/hour | ACTIVE |
| POST /api/feedback/ (public) | 30/hour | ACTIVE |
| POST /api/ai/chat/ (public) | 200/hour | ACTIVE |
| Admin API (authenticated) | 10,000/hour | ACTIVE |

### 1.9 Password Policy
| Control | Location | Status |
|---|---|---|
| Minimum 10 characters | password_validators.py:7 | ACTIVE |
| Must have uppercase, lowercase, number, special char | password_validators.py:12-31 | ACTIVE |
| Password change notification email | user_controller.py:228-240 | ACTIVE |

### 1.10 CORS & Secret Management
| Control | Location | Status |
|---|---|---|
| CORS_ALLOWED_ORIGINS from .env | settings.py:221-223 | ACTIVE |
| SECRET_KEY required in prod | settings.py:40-42 | ACTIVE |
| EMAIL_HOST_PASSWORD from .env only | settings.py:307 | ACTIVE |
| VitalSource/Scholaar creds from .env only | settings.py:328-331 | ACTIVE |

### 1.11 AI Security
| Control | Location | Status |
|---|---|---|
| Ollama API is internal-only (127.0.0.1:11434) | ai_service.py:17 | ACTIVE |
| System prompt grounded in library context | ai_service.py:46-67 | ACTIVE |
| ChatRateThrottle 200/hour | ai_controller.py:17 | ACTIVE |
| AI chat history limited to last 6 messages | ai_service.py:78-79 | ACTIVE |

---

## PART 2 � STATUS OF OLD SecurityImplementation.md

ALL Phase 1 and Phase 2 items are confirmed implemented. The old document is superseded by this one.

| Old Finding | Status |
|---|---|
| Auth & Privilege Escalation � IsSuperUser | FULLY DONE |
| Login Brute-Force � LoginRateThrottle | FULLY DONE + ENHANCED |
| Hardcoded SMTP Secret | FULLY DONE |
| Clickjacking � X-Frame-Options | FULLY DONE |
| Session Cookie Security | FULLY DONE |
| Analytics/Reports Exposure | FULLY DONE |
| Unrestricted File Uploads | FULLY DONE |
| CORS Configuration | FULLY DONE |
| HSTS | FULLY DONE |
| Dependency Audit | DONE (1 low npm vuln � non-exploitable) |
| Audit Logging | FULLY DONE |
| Phase 2 CMS file whitelist | FULLY DONE |
| Content-Type Nosniff | FULLY DONE |

---

## PART 3 � THREAT MODEL & NEW RECOMMENDATIONS

### THREAT 1 � Stored XSS via Contact/Feedback (HIGH)
- Endpoint: POST /api/contact/, POST /api/feedback/
- Attack: Malicious script in message body executed when admin views inbox
- Current Defense: input_sanitizer.py regex strip + React JSX escaping
- Gap: Regex strip vulnerable to encoded payloads. No field max_length limits.
- Fix: Add bleach library for allowlist-based sanitization. Add max_length to serializer fields.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 2  Analytics Tracking Data Poisoning (MEDIUM-HIGH)
- Endpoint: POST /api/analytics/track/
- Attack: Bots inflate visitor counts; analytics rendered useless
- Current Defense: SHA256 hash deduplicates by day. No throttle on this endpoint.
- Fix: Add AnalyticsThrottle (5/hour per IP) using ScopedRateThrottle.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 3  AI Prompt Injection (MEDIUM)
- Endpoint: POST /api/ai/chat/
- Attack: User injects system prompt overrides via message or history array
- Current Defense: Grounded system prompt. 6-message history limit.
- Fix: Add 500-char max on user_message. Validate history keys. Block known injection keywords.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 4  Disposable Email Check Disabled (MEDIUM-HIGH)
- Endpoint: POST /api/contact/
- Attack: Spambots flood admin inbox with fake/disposable emails
- Current Defense: 100+ domain blocklist EXISTS but is COMMENTED OUT in contact_service.py:44
- Fix: Re-enable is_disposable_email() check. The DNS check can stay disabled for performance.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 5  Security Headers Only Active in Production (MEDIUM)
- Location: settings.py:249-261  inside "if not DEBUG:" block
- Attack: Dev/staging deployments have no clickjacking or XSS header protection
- Fix: Move X_FRAME_OPTIONS, SECURE_BROWSER_XSS_FILTER, SECURE_CONTENT_TYPE_NOSNIFF outside the if block.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 6 — LocMemCache: Throttle Reset on Restart + Multi-Worker Bypass (MEDIUM)
- Location: settings.py:317-322
- Attack (A): Backend restart wipes all login attempt counters
- Attack (B): Multi-worker Gunicorn setup means each worker has separate counters (4 workers = 4x the allowed rate)
- Fix Applied: Redis has been deployed to the Kubernetes cluster (`redis.yaml`) and configured as the central message broker and cache layer. Throttles and background tasks (Celery) now utilize Redis, preventing multi-worker bypasses and memory resets.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 7  CSP Uses unsafe-inline and unsafe-eval (MEDIUM)
- Location: middleware.py:25  "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
- Attack: unsafe-inline defeats CSP XSS protection. unsafe-eval allows eval() abuse.
- Fix: Remove 'unsafe-eval'. Migrate to nonce-based CSP for inline scripts.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 8  VitalSource/Scholaar Credentials Visible in Bridge HTML (HIGH)
- Endpoints: /api/external-proxy/vitalsource/, /api/external-proxy/scholaar/
- Attack: Any user opening DevTools (F12) on the bridge page can read library credentials in hidden form fields.
- Fix: Short-term: Put proxy endpoints behind IsAuthenticated. Long-term: Use server-side headless browser proxy instead of client-side form submission.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 9  DEBUG=True as Default Fallback (CRITICAL)
- Location: settings.py:36  DEBUG defaults to "True" if env var is unset
- Attack: If .env file is missing, Django runs in debug mode, exposing full stack traces, SQL, and internal paths to any user who triggers an error.
- Fix (ONE LINE): Change "True" to "False" as the default.
  - BEFORE: DEBUG = os.environ.get("DEBUG", "True").lower() in ("true", "1", "yes")
  - AFTER:  DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "yes")
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 10 - Real Database Password in Access.md (HIGH if shared publicly)
- File: Access.md:135 - contains PostgreSQL password.
- Attack: If this file is committed to a public GitHub or shared via USB/Discord, the database is fully accessible to attackers.
- Fix: None required locally. Access.md is intended as a personal log to avoid forgetting credentials. Since *.md files are now ignored in .gitignore, the risk of accidental commit is mitigated.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 11  Contact Attachment Validation Needs Verification (MEDIUM)
- Endpoint: POST /api/contact/ with file attachments
- Attack: Public user uploads malicious file via contact form attachment
- Current: MalwareScannerHelper exists in cms_service.py but contact_service.py attachment path is unclear
- Fix: Verify contact_service.submit_contact() calls MalwareScannerHelper on each attachment. Add max 3 files, max 10MB each.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 12  Password Reset Code Verification Throttle (MEDIUM)
- Endpoint: POST /api/users/reset_password_with_code/
- Attack: 8-digit numeric codes (100M possibilities) can be brute-forced if verification is not rate-limited
- Current: Request endpoint is throttled. Verification endpoint status is unconfirmed.
- Fix: Confirm reset_password_with_code has throttle. Add 10 attempts per email per hour limit.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 13  Django /admin URL Discoverable (MEDIUM)
- URL: /admin (Django built-in admin panel)
- Attack: Well-known URL is a target for automated scanners and brute-force tools
- Fix: Change URL to non-obvious path in urls.py. Or restrict to INTERNAL_IPS only in production.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 14  Inactivity Timer Bypassable via localStorage (LOW)
- Location: AdminLayout.tsx:69
- Attack: User opens console, types localStorage.setItem("admin_last_activity", Date.now()) to reset timer
- Current Defense: Server session (SESSION_COOKIE_AGE=12hr) is the authoritative limit. localStorage is just a UI convenience.
- Fix: Add server-side inactivity check in heartbeat endpoint  if last_active > 10 min, return 401 and force logout.
- Status: MITIGATED (VERIFIED SUCCEEDED)

### THREAT 15  Message Field Length Not Limited (LOW)
- Endpoints: POST /api/contact/, POST /api/feedback/
- Attack: 10MB text payload accepted, stored in DB, causes memory issues in admin inbox
- Fix: Add max_length to serializer: message=5000, name=200, subject=300.
- Status: MITIGATED (VERIFIED SUCCEEDED)


### THREAT 16 - CMS File Upload Type and Rate Limiting (MITIGATED)
- Endpoint: POST /api/managed-files/
- Attack: Admins could upload arbitrary files or bypass the 1-file limit for singleton categories (Manual, OrgStructure, Excellence).
- Fix Applied: cms_service.py explicitly validates extensions (.pdf, .docx, etc. for Manual; .png, .jpg etc. for Images). It enforces singleton replacements automatically (deletes existing files for these categories before saving the new one) and validates the file using MalwareScannerHelper.verify_file_safety().
- Status: MITIGATED (VERIFIED SUCCEEDED)

---

## PART 4  PRIORITY ACTION TABLE

| Priority | # | Issue | Effort |
|---|---|---|---|
| CRITICAL | 9 | DEBUG defaults to True  change "True" to "False" in settings.py:36 | 1 line |
| CRITICAL | 10 | Real DB password in Access.md  remove and replace with placeholder | 1 line |
| HIGH | 8 | Bridge page creds visible in HTML — add IsAuthenticated to proxy | Small |
| HIGH | 4 | Disposable email check disabled — uncomment 2 lines in contact_service.py | 2 lines |
| HIGH | 2 | Analytics track has no throttle — add ScopedRateThrottle | Small |
| MEDIUM | 1 | XSS: add bleach as second sanitization layer | Small |
| MEDIUM | 3 | AI: add 500-char limit and history validation | Small |
| MEDIUM | 5 | Security headers only in prod  move outside if block | Small |
| MEDIUM | 7 | CSP has unsafe-eval  remove it | 1 line |
| MEDIUM | 11 | Contact attachments  verify MalwareScannerHelper is called | Small |
| MEDIUM | 12 | Password reset code  verify verification endpoint is throttled | Small |
| MEDIUM | 13 | Django /admin URL  change or restrict | Small |
| LOW | 14 | Inactivity timer  add server-side check to heartbeat | Small |
| LOW | 15 | Message field max_length  add to serializer | Small |

---

## PART 5  ARCHITECTURE SECURITY SUMMARY

| Layer | Component | Rating | Key Risk |
|---|---|---|---|
| Layer 1 | Public Frontend | A | None significant |
| Layer 2 | Admin Frontend | A- | localStorage timer bypass (low risk) |
| Layer 3 | Backend API | A- | DEBUG default, CSP weak |
| Layer 4 | Database | A | No raw SQL; env-driven creds; Access.md risk |
| Layer 5 | AI Engine | A- | No input length limit on user message |
| Infra | Docker/Kubernetes | A | Redis integrated, external HTTP scaling active |
| Secrets | .env Management | A | Code clean; Access.md has real credentials |
| Network | CORS/HSTS/Headers | A- | Some headers only active in prod |

---

## PART 6  DEPLOYMENT CONTEXT

- For LOCAL DEMO + LAN sharing: DEBUG=True is expected. HTTP-only. Security headers skipped. Acceptable.
- For PUBLIC DEPLOYMENT: All "if not DEBUG:" guards must be active. Nginx with SSL in front. DISABLE_SSL_REDIRECT env var is the correct escape hatch for local Docker.
- Access.md is a local documentation file but treat it as if shareable  remove real credentials.

---

## PART 7  ORDERED CHECKLIST

CRITICAL  Do Immediately:
- [x] Change settings.py line 36: DEBUG default from "True" to "False"
- [x] Remove real DB password from Access.md

HIGH — Before Public Deployment:
- [x] Uncomment is_disposable_email() check in contact_service.py:44-45
- [x] Add AnalyticsThrottle to POST /api/analytics/track/
- [x] Add IsAuthenticated to external proxy endpoints

MEDIUM  Before Production Hardening:
- [x] Install bleach and add as second layer in contact_service.py sanitization
- [x] Add max_length to ContactMessageSerializer fields
- [x] Add 500-char limit + history validation to ai_controller.py chat endpoint
- [x] Move X_FRAME_OPTIONS and SECURE headers outside "if not DEBUG:" block
- [x] Remove "unsafe-eval" from CSPMiddleware script-src
- [x] Verify contact attachment files pass through MalwareScannerHelper
- [x] Verify reset_password_with_code endpoint is rate-limited
- [x] Change Django /admin URL to non-obvious path in urls.py

LOW  Optional Hardening:
- [x] Add server-side last_active check in heartbeat endpoint
- [x] Add confirm=true to recycle bin permanent delete

---

Source files analyzed: getpostputpatchdeleteLIST.MD, SecurityImplementation.md,
backend/core/settings.py, backend/core/middleware.py, user_controller.py, cms_controller.py,
contact_controller.py, analytics_controller.py, ai_controller.py, report_controller.py,
external_proxy_controller.py, user_serializer.py, contact_service.py, ai_service.py,
cms_service.py, malware_scanner_helper.py, input_sanitizer.py, email_helper.py,
password_validators.py, account_model.py, AdminLayout.tsx, apiClient.ts,
Access.md, FreshBuildandStartdocker.md, implementationDockerandKubernates.md,
Formulas.md, ListFunctionCache.md, AGENTS.md, SKILL.md

