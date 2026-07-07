# List of Functions Using Cache and Cookies
This document outlines all features and functions within the JRMSU Library project that actively rely on caching mechanisms, local storage, or browser cookies.

## 1. Frontend Caching (Local Storage)
### AI Chatbot History (`RizalAssistant.tsx`)
- **Type**: `localStorage`
- **Key**: `rizal_chat_history`
- **Purpose**: Persists the user's conversation with the AI across page reloads.
- **Expiration**: 2 hours (7,200,000 ms). Automatically purges old chats to protect privacy on shared terminals.

## 2. Backend Caching (In-Memory)
### Django LocMemCache (`backend/core/settings.py`)
- **Type**: Server-side RAM cache
- **Name**: `jrmsu-library-cache`
- **Purpose**: Powers the Django REST Framework Throttling (Rate Limiting).
- **Functions Protected**:
  - `LoginRateThrottle` (5 attempts / minute)
  - `ContactRateThrottle` (200 requests / hour)
  - `ChatRateThrottle` (100 AI chats / hour)

## 3. Browser Security Cookies
### Authentication & CSRF
- **Type**: Encrypted HTTP Cookies
- **Variables**: `csrftoken` and `sessionid`
- **Purpose**: 
  - `sessionid` securely maintains the Admin's login state.
  - `csrftoken` blocks Cross-Site Request Forgery attacks.
- **Production Flags**: When `DJANGO_DEBUG=False`, these cookies are locked with `HttpOnly`, `Secure` (HTTPS only), and `SameSite='Lax'` flags.

## Verification Checklist
- [x] AI Chat history survives F5 refresh but dies after 2 hours.
- [x] Admin login is strictly rate-limited using the backend cache.
- [x] Cookies are securely transmitted to `/api/` endpoints via `withCredentials: true` in `axios.ts`.
