# JRMSU Library System — Security Status

This document tracks all security implementations within the JRMSU Library System, designed to ensure maximum protection against unauthorized access, malicious file uploads, supply-chain vulnerabilities, and network-based attacks. 

The system has been heavily audited and hardened for deployment to Vercel (Frontend) and Render (Backend).

## Status Definitions
- **[ Not implement ]** - Security feature is not provided or made yet.
- **[ Partial ]** - Temporary or unfinished but working.
- **[ Implemented ]** - Working properly but might need future adjustments.
- **[ Productive ]** - Working properly without any issues for any devices and fully functional for production deployments.

---

## 1. Authentication & Authorization
| Security Feature | Status | Description |
| :--- | :--- | :--- |
| **Login Brute-Force Protection** | **[ Productive ]** | Enforces a strict 5-attempt limit per 10 minutes (cached via Redis), plus a baseline DRF 10/min throttle to completely block credential stuffing. |
| **IsSuperUser API Locks** | **[ Productive ]** | All state-changing endpoints (Create, Update, Delete) across the CMS strictly require the user to be authenticated AND have `is_staff=True`. |
| **Terminal-Created Admin Lock** | **[ Productive ]** | Admins created via the backend terminal cannot be deleted, modified, or forced out by UI-created admins. |
| **Single-Device Session Lock** | **[ Productive ]** | Prevents multiple logins for the same account simultaneously; actively monitors the `last_active` heartbeat. |

## 2. File Uploads & CMS Security
| Security Feature | Status | Description |
| :--- | :--- | :--- |
| **Deep Malware Scanning** | **[ Productive ]** | Uses `libmagic1` and `python-magic` to mathematically scan the magic bytes of every uploaded file. A hacker cannot bypass this by renaming an `.exe` to a `.pdf`. |
| **File Extension Whitelisting** | **[ Productive ]** | Explicitly rejects all executable scripts (`.sh`, `.bat`, `.js`, etc.) and restricts uploads to safe formats (Images, PDFs, Word Docs) depending on the CMS category. |

## 3. Network & Deployment Hardening
| Security Feature | Status | Description |
| :--- | :--- | :--- |
| **Strict CORS (Cross-Origin)** | **[ Productive ]** | Dangerous wildcards (`https://*`) have been removed. It dynamically allows Local LAN IPs for Wi-Fi testing, and relies strictly on the `.env` `ALLOWED_CORS_ORIGINS` for Vercel production. |
| **Anti-"Login Loop" Cookies** | **[ Productive ]** | Uses a smart toggle (`DISABLE_SSL_REDIRECT`). Uses `Lax` cookies for local HTTP testing, and automatically switches to military-grade `SameSite=None` + `Secure=True` HTTPS cookies when deployed. |
| **X-Frame-Options (Clickjacking)** | **[ Productive ]** | Globally set to `DENY` to prevent hackers from embedding the Admin Panel into a malicious iFrame. |
| **MIME-Sniffing Lockdown** | **[ Productive ]** | `X-Content-Type-Options: nosniff` is enforced via custom Middleware to prevent browsers from interpreting uploaded images as executable HTML/JS. |

## 4. Supply Chain & Container Security
| Security Feature | Status | Description |
| :--- | :--- | :--- |
| **NPM Supply Chain Hardening** | **[ Productive ]** | Removed unnecessary backend dependencies (like `express.js`) from the Vite frontend bundle to reduce the attack surface. |
| **Rootless Docker Execution** | **[ Productive ]** | The Django backend container creates and runs under an unprivileged `appuser`. If a hacker compromises the Django process, they are trapped without root permissions. |

## 5. Input Sanitization & AI Security
| Security Feature | Status | Description |
| :--- | :--- | :--- |
| **XSS Protection (Bleach)** | **[ Productive ]** | All public contact form and feedback submissions are scrubbed of executable scripts using the `bleach` library before hitting the database. |
| **SQL Injection Prevention** | **[ Productive ]** | 100% reliance on the Django ORM. Zero raw SQL queries exist in the codebase. |
| **AI Prompt Injection Lockdown** | **[ Productive ]** | The Ollama chatbot restricts user inputs to 500 characters and strictly limits the history array to 6 messages to prevent context-overflow jailbreaks. |
| **Hardware Access Revocation** | **[ Productive ]** | `Permissions-Policy` completely disables Microphone, Camera, and Geolocation access globally to prevent third-party plugins from spying. |

---
*Generated after deep architectural security audit in preparation for Vercel and Render deployment.*
