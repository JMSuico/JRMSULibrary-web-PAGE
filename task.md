# JRMSU Library Landing Page — Task Tracker

## Phase 1: Navigation & Global UI
- [x] Update `index.css` with all new styles (gradients, carousel 3D, tree view, floating bubbles, glassmorphism)
- [x] Modify `TopNavBar.tsx` — gradient nav (white→blue), 4 nav items, About dropdown, transparent blending
- [x] Update `data.ts` — new data structures, updated URLs, fixed Gutenberg link

## Phase 2: Hero Section
- [x] Modify `HeroSection.tsx` — University header text (Republic/blue shadow JRMSU), library image card modal, clock redesign (7AM-7PM)

## Phase 3: Home Page Sections
- [x] Modify `PersonnelSection.tsx` — Librarian's Corner blue modal card, "Campus Librarian" title
- [x] Create `BlueModalCarousel.tsx` — Reusable 3D carousel component
- [x] Create `NewlyAcquiredBooks.tsx` — Blue Modal 3D Carousel for books
- [x] Create `LibrarySectionCarousel.tsx` — Library section pictures with auto-slideshow + background change
- [x] Create `LibraryMapSection.tsx` — Google Maps satellite embed (already existed, wired)
- [x] Create `UOPACSection.tsx` — UOPAC QR code section (already existed, wired)

## Phase 4: About Page
- [x] Modify `AboutSection.tsx` — 3 separate navigable modules with exact content (already had tabs)

## Phase 5: Services & E-Resources
- [x] Modify `ServicesSection.tsx` — Full Library Services integration (17 services, 7-step accordion)
- [x] Modify `FeedbackSection.tsx` — Dropdown + classic carousel (already existed)
- [x] Modify `ExternalServicesSection.tsx` — Dropdown + classic carousel (already existed)
- [x] Create `EResourcesPage.tsx` — Merged E-Resources with tree view + online access links
- [x] Create `TreeView.tsx` — Hierarchical file browser for 300+ PDFs
- [x] Create `FileViewerModal.tsx` — Read-only PDF viewer with carousel nav

## Phase 6: Floating UI Elements
- [x] Create `FeedbackStickyCard.tsx` — Sticky feedback card (right middle, already existed, wired)
- [x] Create `FacebookBubble.tsx` — Facebook floating bubble with iframe modal (already existed, wired)
- [x] Create `RizalAssistant.tsx` — RIZAL chatbot floating bubble with video + 3 options (already existed, wired)

## Phase 7: Admin Portal & Backend (Django + MySQL)
- [x] Create Django project in `backend/` (Django 4.2 LTS, DRF, CORS)
- [x] Configure `settings.py` for MySQL (MariaDB 10.4 via XAMPP)
- [x] Create Django apps and models (Account, ContactMessage, Feedback, Personnel, NewlyAcquiredBook, LibraryInteriorImage, EResourceDepartment, EResourceFile)
- [x] Implement DRF ViewSets and Serializers
- [x] Register admin models, create superuser

## Final Assembly
- [x] Update `App.tsx` — Wire all components (12 sections + 3 floating elements)
- [x] Delete `FileServicesSection.tsx` and `OnlineAccessSection.tsx`
- [x] Verify build (`npm run build` — 52 modules, 0 errors)
- [x] Convert 17 `.HEIC` images to `.jpg` via `heic-convert`
