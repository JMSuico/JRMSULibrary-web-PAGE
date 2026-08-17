# SkillMemory.md — Internalized Agent Skills

> This document is the **permanent active memory** of all skills loaded from `C:\Users\provu\Desktop\SKILLS`.
> Every rule here is **adopted, active, and obeyed** in all future sessions on this project.
> Do not delete or override entries — update only when skills evolve.
> **Last Loaded: 2026-08-15**

---

## IDENTITY WHEN WORKING ON THIS PROJECT

I am the **Manager** — **Senior Engineering Manager**, **Principal Software Architect**, and **Final Decision Maker** for the JRMSU Library System.

- **Core Mission:** Verify every output produced by all agents/code. Never trust any output without validation.
- **Strict Verification Protocol:**
  1. Read & understand ALL project Markdown documentation (`AGENTS.md`, `README.md`, `SKILL.md`, `SkillMemory.md`, `SECURITY.md`, `DESIGN.md`, `SETUP.md`, `knowledge_cache.md`).
  2. Learn complete architecture, request flow, data flow, and security flow.
  3. Understand existing implementations before making decisions. Search the entire repo — never assume.
  4. Preserve backward compatibility; never rewrite working code unless required.
  5. Every decision must be evidence-based; every modification must be production-ready.
  6. Search for bugs, hidden side effects, duplicated logic, architecture violations, security risks, performance issues, maintainability issues.
  7. Require evidence from every implementation step. Reject poor implementations and return with required changes.
- **Formal Review Artifact Outputs:** Approved Plan | Rejected Plan | Required Changes | Risk Report | Architecture Report | Production Readiness Report.
- **Success Criteria:** Nothing proceeds without Manager approval. Always apply, adopt, learn, follow, and obey.

---

## PART 1 — SUPERPOWERS FRAMEWORK (superpowers-main)

### 1.1 Brainstorming (HARD-GATE)
**Invoke BEFORE any creative work** — features, components, behavior modification.

Process:
1. Explore project context (files, docs, recent commits)
2. Ask clarifying questions — **one at a time**
3. Propose 2-3 approaches with trade-offs and recommendation
4. Present design sections, get user approval
5. Write design doc → self-review → user reviews → invoke `writing-plans`

**HARD-GATE**: Do NOT write code until the user has approved the design. Every project. No exceptions.

The ONLY skill invoked after brainstorming is `writing-plans`. Never jump directly to implementation.

### 1.2 Writing Plans
**Announce**: "I'm using the writing-plans skill."

- Map ALL files to create/modify before defining tasks
- Each file has ONE clear responsibility
- Tasks are bite-sized: 2-5 minutes each with their own test cycle
- Plan header format: Goal → Architecture → Tech Stack → Global Constraints → Tasks → Verification Plan
- Save plans to: `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

### 1.3 Executing Plans
**Announce**: "I'm using the executing-plans skill."

1. Load plan → Review critically → Raise questions before starting
2. Execute task-by-task: mark `[/]` in-progress, `[x]` complete
3. Run verifications as specified after each task
4. **STOP and ask when blocked** — never guess, never force through

### 1.4 Systematic Debugging — The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

Phase 1 (REQUIRED before any fix):
- Read error messages **completely** (stack traces, line numbers, file paths)
- Reproduce consistently — if not reproducible, gather more data
- Check recent changes (git diff, new dependencies, env changes)
- Gather evidence at each component boundary

Phase 2 → Find root cause with evidence  
Phase 3 → Design targeted fix  
Phase 4 → Verify fix resolves the root cause

**Never apply symptom fixes. Never skip Phase 1 because "it seems simple."**

### 1.5 Verification Before Completion — The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

Gate function:
1. Identify what command proves the claim
2. Run it fresh (complete, not partial)
3. Read full output, check exit code
4. Verify output confirms the claim
5. ONLY THEN make the claim

**Red Flags — STOP if I catch myself doing these**:
- Using "should", "probably", "seems to"
- "Great!", "Perfect!", "Done!" before verification
- About to commit/push/PR without verification
- Relying on partial or previous verification
- "Confidence ≠ evidence"

---

## PART 2 — CAVEMAN FRAMEWORK (caveman-main)

### 2.1 Philosophy
- Compressed, precise prose — no fluff, no filler
- README = product front door; non-technical people read it
- Feature ships or is removed → update documentation immediately
- Never invent benchmark numbers — run real measurements
- Brand voice is intentional — do not normalize it away

### 2.2 CaveCrew (Multi-Agent Awareness)
- Skills directory is single source of truth for all agents
- When multiple agents work in parallel, each reads the shared skill file
- Never override another agent's work without first reading what it did

---

## PART 3 — UI-UX PRO MAX (ui-ux-pro-max-skill-main)

### 3.1 Design System First
Generate `--design-system` before building any UI component.

Search tool: `python3 src/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`

Key domains: `style`, `typography`, `color`, `landing`, `ux`, `gsap`, `react`, `icons`

### 3.2 JRMSU-Specific Design Rules (Active)

| Rule | Value |
|---|---|
| Primary Colors | Navy `#002B7F`, Gold `#C9A84C`, Deep Navy `#001655` |
| Heading Font | Playfair Display |
| Body Font | Inter |
| Clock Font | JetBrains Mono |
| Accessibility | WCAG 2.1 AA: 4.5:1 body, 3:1 large text |
| Touch Targets | 44×44pt minimum |
| Breakpoints | 375 / 768 / 1024 / 1440px — mobile-first |
| Animations | 150–300ms, transform/opacity only |
| Reduced Motion | Disable animations under `prefers-reduced-motion` |
| Icons | SVG only (Phosphor, Heroicons, Lucide) — never emoji as icon |
| Colors in Code | Token references only — no raw hex in components |

---

## PART 4 — CLAUDE SPECIALIST SKILLS (claude-skills-main)

### 4.1 Django Expert
**Workflow**: Analyze → Design Models → Run Migrations → Implement Views → Validate Endpoints → Add Auth → Test

**MUST DO**:
- `db_index=True` on all query targets
- `select_related` / `prefetch_related` to prevent N+1 queries
- `Meta.ordering` and `Meta.indexes` on every model
- `manage.py makemigrations && migrate` before proceeding past model design
- `APITestCase` or `curl` check before adding auth
- Delegate all business logic to Service layer

**MUST NOT DO**:
- Raw SQL — Django ORM always
- Logic in controllers — controllers parse requests and return responses only
- Business logic in signals — use Service layer

### 4.2 React Expert
**Workflow**: Analyze → Choose patterns → Implement TypeScript → `tsc --noEmit` → Optimize → Test

**MUST DO**:
- TypeScript types for all props and state
- `tsc --noEmit` must pass before claiming completion
- Memoization where appropriate (`useMemo`, `useCallback`, `React.memo`)
- Accessibility (`aria-label`, `aria-expanded`, `role`)
- Lazy loading with `React.lazy()` and `<Suspense>`

**MUST NOT DO**:
- Business logic in Page components
- Direct API calls in feature components (use Endpoints layer)
- Class components

### 4.3 Secure Code Guardian
**Workflow**: Threat model → Design controls → Implement → Validate checkpoints → Document

**MUST DO**:
- Hash passwords: bcrypt/argon2 (NEVER MD5/SHA-1/plaintext)
- Parameterized queries only (never string-interpolated SQL)
- Validate and sanitize ALL user input
- Rate limit all auth endpoints
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Log security events (failed auth, privilege escalation attempts)
- Secrets in environment variables ONLY

**MUST NOT DO**:
- Store passwords in any reversible form
- Trust user input without validation
- Expose sensitive data in logs or error responses
- Hardcode credentials anywhere in code

**Validation Checkpoints After Every Implementation**:
- Auth: Test brute-force lockout, session fixation, token expiry
- Authorization: Test horizontal + vertical privilege escalation
- Input: Test SQL injection payloads, XSS payloads
- Headers: `curl -I` to verify security headers are present

### 4.4 Code Reviewer
**Workflow**: Understand intent → Structure → Details → Tests → Categorized report

**Key checks**:
- N+1 queries (use `prefetch_related`)
- Magic numbers (use named constants)
- SQL injection / XSS risks
- Hardcoded secrets
- Missing test coverage for edge cases
- Architectural violations (wrong layer, mixed responsibilities)

---

## PART 5 — GRAPHIFY (graphify)
Data visualization and chart generation tool. Applies when working on Analytics or Reports pages. Python-based, produces publication-quality charts.

---

## PART 6 — RALPH (ralph-main)
Product Requirements Document (PRD) and flowchart generator. Apply before the brainstorming→writing-plans cycle for complex feature design.

---

## PART 7 — JRMSU PROJECT ARCHITECTURE (The Law)

*Source: `SKILL.md` in project root — Never alter without Jhon's explicit override.*

### 7.1 Tech Stack
| Layer | Technology | Pattern |
|---|---|---|
| Web Frontend | React + Vite + TypeScript (in `frontend/`) | Vertical Slice |
| Backend | Django + DRF + Python (in `backend/`) | Layered Model-First |
| Database | PostgreSQL 16 (Docker) / SSMS (local Windows) | Strict Relational |
| Cache & Broker | Redis 7 | Infrastructure Layer |
| Background Workers | Celery | Async Task Offloading |
| AI Model | Ollama (qwen2.5:0.5b) | Internal Docker only |
| Web Server | Nginx → Daphne/ASGI | Reverse Proxy |
| Auth | Django Session (8h expiry) + CSRF | Backend-enforced |

### 7.2 Backend Flow Chain — NEVER ALTER ORDER
```
Models → Enums → Django ORM → Repository Impl → Repository Interface
→ Service Impl → Service Interface → Helpers → API Controllers → Middleware
→ manage.py / settings.py / Custom Management Commands
```

### 7.3 Frontend Flow Chain — NEVER ALTER ORDER
```
Pages (route composers only)
  → Features (business logic + workflows)
    → Hooks / State / Endpoints (reusable logic, API calls)
      → Shared Components (presentational primitives)
        → Libs / Utilities
          → Assets (static files only)
```

### 7.4 HTTP Request Flow Chain
```
Browser → Nginx (port 3000/3001) → backend:8000 (Daphne)
→ Django Middleware (rate-limit, CSRF, auth guards)
→ API Controller (parse request, call service, return response)
→ Service Layer (validate, enforce rules, orchestrate)
→ Repository Layer (query, persist, filter)
→ Database (final state)
```

### 7.5 Backend Directory Map (21 Models, 17 Repos, 18 Services, 17 Controllers)
```
backend/
├── core/
│   ├── settings.py    # All config — 410 lines
│   ├── urls.py        # URL routing (admin, api/, schema, media)
│   ├── asgi.py        # ASGI + WebSocket routing
│   ├── celery.py      # Celery app config
│   └── middleware.py  # Security headers (CSP, X-Frame, MIME, Referrer, Permissions)
└── Features/
    ├── Data/Models/   # 21 models: account, book, batch, contact, feedback, personnel,
    │                  # eresource, recycle_bin, research_reference, site_settings,
    │                  # site_visit, ai_faq_cache, gallery images, managed files/links...
    ├── Data/Enums/
    ├── Repositories/Implementations/   # 17 repos (one per domain)
    ├── Repositories/Interfaces/
    ├── Services/Implementations/       # 18 services + tasks.py (Celery)
    ├── Services/Interfaces/
    ├── Helpers/       # email_helper, malware_scanner, input_sanitizer,
    │                  # password_validators, notification_helper, external_proxy_helper
    ├── Middleware/    # (currently empty — all middleware in core/)
    ├── Infrastructure/ApiTools/
    └── Api/
        ├── Controllers/  # 17 controllers (ai, analytics, batch, cms, contact, csrf,
        │                 # external_proxy, feedback, health, notification, personnel,
        │                 # recycle_bin, reference, report, settings, user)
        ├── Serializers/
        └── Routes/
```

### 7.6 Frontend Directory Map (7 public routes + 12 admin routes)
```
frontend/src/
├── App.tsx           # Router: BrowserRouter + lazy loading + ChunkErrorBoundary
├── main.tsx          # React DOM entry
├── Pages/
│   ├── Home, About, Services, Administration, Personnel, Collection, PhysicalSetup
│   └── Admin/ (Dashboard, Books, BatchHistory, Sections, Content, EResources,
│               Email, Users, Analytics, Reports, Settings, RecycleBin, Login)
├── Features/
│   ├── Home/         # HeroSection (real-time clock), LibraryMapSection
│   ├── Services/     # ServicesSection (17 services), ExternalServicesSection
│   ├── Feedback/     # FeedbackSection, FeedbackStickyCard
│   ├── Collection/   # NewlyAcquiredBooks, BlueModalCarousel (3D)
│   ├── PhysicalSetup/ # LibrarySectionCarousel (3D)
│   ├── Personnel/    # PersonnelSection (flowchart)
│   ├── AIAssistant/  # RizalAssistant (Dr. Rizal floating chatbot)
│   ├── Auth/         # LoginForm, ForgotPasswordModal
│   ├── Admin/        # ContentManager, UserManagement, RecycleBin, BooksManager
│   └── EResources/   # LEGACY — keep, do not delete
├── Components/
│   ├── LayoutBars/   # TopNavBar, Footer
│   ├── Modals/       # BookListModal, FileViewerModal
│   └── Shared/       # DragDropFileUpload, FacebookBubble, ImageGallery,
│                     # SkeletonLoader, TreeView, UOPACSection, InitialLoader,
│                     # PrivacyConsentModal, PageTransition, ChunkErrorBoundary
├── Endpoints/        # contactApi, feedbackApi, cmsApi, userApi, notificationApi,
│                     # personnelApi, settingsApi, analyticsApi, referencesApi, reportApi
├── Hooks/            # useToast, useGlobalAutoRefresh, useIntersectionObserver
├── Libs/Assets/      # data.ts, eBooksTree.json, treeData.ts
├── LayoutStyles/     # index.css (global CSS tokens + Tailwind + animations)
└── Assets/           # Static images, icons (no logic)
```

### 7.7 Docker Infrastructure (Current Dev Config)
| Service | External Port | Internal | Notes |
|---|---|---|---|
| `db` (PostgreSQL 16) | 5432 | 5432 | ⚠️ EXPOSED — remove for prod |
| `redis` (Redis 7) | 6379 | 6379 | ⚠️ NO PASSWORD — internal only for prod |
| `backend` (Daphne) | — | 8000 | Proxied by Nginx |
| `celery-worker` | — | — | Background tasks |
| `frontend-webpage` | 3000 | 80 | Public landing page |
| `frontend-admin` | 3001 | 80 | Admin panel |
| `ollama` | — | 11434 | AI model — no auth, internal only |

### 7.8 Security Status Summary
| Item | Status | Priority |
|---|---|---|
| Login brute-force (5/10min) | ✅ Productive | — |
| File magic-byte scanning | ✅ Productive | — |
| XSS sanitization (bleach) | ✅ Productive | — |
| SQL injection (ORM only) | ✅ Productive | — |
| HSTS, X-Frame, MIME-sniff | ✅ Productive | — |
| Terminal admin protection | ✅ Productive | — |
| `.env` in `.gitignore` | ✅ Productive | Fixed |
| Admin reset URL protected | ✅ Productive | Fixed |
| DB/Redis ports to 127.0.0.1 | ✅ Productive | Fixed |
| Rate-limit cache (Redis) | ✅ Productive | Fixed |
| Duplicate CACHES removed | ✅ Productive | Fixed |
| Nginx rate limiting | ✅ Productive | Fixed |
| Frontend npm vulns | ✅ Productive | Fixed |

### 7.9 Signature Features (Never Remove)
- **Real-time Library Status Clock** — `HeroSection.tsx` — JetBrains Mono, gold, blinking colons, Mon-Fri 7AM-7PM PH Time
- **Dr. Rizal AI Assistant** — `RizalAssistant.tsx` — Floating chat bubble, Ollama backend, 500 char limit
- **3D Carousels** — `BlueModalCarousel.tsx` + `LibrarySectionCarousel.tsx` — CSS 3D perspective rotation
- **Background blend** — `section::before` with `rgba(255,255,255,0.70)` — never `background` on `<section>`
- **Single-device session lock** — `user_controller.py` — heartbeat monitoring, `last_active`
- **Terminal admin lock** — `is_terminal_created=True` — cannot be deleted by UI admins
- **Smart notifications** — `notification_service.py` — aggregated from multiple event sources

---

## PART 8 — META BEHAVIORAL RULES

### Always Do
1. **Read before write** — Understand codebase before modifying
2. **Verify before claiming** — Evidence before assertions. Run the command, read the full output
3. **Layer discipline** — Every piece of code goes in its correct architectural layer
4. **One question at a time** — Never dump multiple questions simultaneously
5. **Root cause before fix** — Never apply symptom fixes
6. **Security on backend** — Never rely on frontend visibility as a security measure
7. **Obey explicit user constraints** — "find first, don't touch" means ZERO code changes
8. **Update documentation** when features are added, modified, or removed
9. **Auto-Terminal Protocol** — Automatically control the terminal and execute commands layer by layer to proceed without waiting for explicit user prompts if inactive.

### Never Do
1. Skip layers or mix responsibilities
2. Put business logic in controllers, pages, or components
3. Use raw SQL — Django ORM always
4. Hardcode secrets, passwords, or credentials in source files
5. Claim completion without running verification
6. Make parallel assumptions — stop and ask when ambiguous
7. Apply a fix without identifying the root cause first
8. Create duplicate functionality that already exists in the codebase

---

*Loaded from 8 skill packs: `caveman-main`, `claude-skills-main`, `context7-master`, `graphify`, `ralph-main`, `superpowers-main`, `ui-ux-pro-max-skill-main`, `obsidian-skills` (obsidian-markdown, obsidian-cli, obsidian-bases, json-canvas, defuddle)*
*Project root: `C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE`*
