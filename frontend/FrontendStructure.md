# Frontend Structure — JRMSU Library Landing Page

> Target architecture per SKILL.md Section 4 — Frontend Vertical Slice Structure
> Tech Stack: React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4

---

## Target Directory Tree

```
src/
│
├── Pages/                                    # Route-level page assemblies ONLY — no business logic
│   ├── Home/
│   │   └── HomePage.tsx                     # Main entry route — composes Hero, Maps, Feedback
│   ├── About/
│   │   └── AboutPage.tsx                    # About route — History, Vision, Objectives
│   ├── Administration/
│   │   └── AdministrationPage.tsx           # Administration overview page
│   ├── Collection/
│   │   └── CollectionPage.tsx               # Collection route — New Books, Local Books, Online
│   ├── Personnel/
│   │   └── PersonnelPage.tsx                # Personnel route wrapper
│   ├── PhysicalSetup/
│   │   └── PhysicalSetupPage.tsx            # Physical setup route wrapper
│   └── Services/
│       └── ServicesPage.tsx                  # Services route wrapper
│
├── Features/                                 # Feature-specific vertical slices — owns business workflows
│   │
│   ├── Home/                                # Home page feature slice
│   │   └── components/
│   │       ├── HeroSection.tsx              # Hero with real-time clock and library status
│   │       └── LibraryMapSection.tsx        # Google Maps satellite embed
│   │
│   ├── Services/                            # Library services feature slice
│   │   └── components/
│   │       ├── ServicesSection.tsx           # 17 library services accordion
│   │       └── ExternalServicesSection.tsx   # External services accordion + auto-slideshow
│   │
│   ├── Feedback/                            # Visitor feedback feature slice
│   │   └── components/
│   │       ├── FeedbackSection.tsx           # Feedback accordion + auto-slideshow
│   │       └── FeedbackStickyCard.tsx        # Floating sticky feedback button
│   │
│   ├── Collection/                          # Book collection feature slice
│   │   └── components/
│   │       ├── NewlyAcquiredBooks.tsx        # Newly acquired books display
│   │       └── BlueModalCarousel.tsx         # 3D rotating carousel
│   │
│   ├── PhysicalSetup/                       # Library physical setup feature slice
│   │   └── components/
│   │       └── LibrarySectionCarousel.tsx    # 3D rotating carousel for library areas
│   │
│   ├── Personnel/                           # Library personnel feature slice
│   │   └── components/
│   │       └── PersonnelSection.tsx          # Flowchart layout for staff hierarchy
│   │
│   ├── EResources/                          # E-Resources feature slice (LEGACY — keep, do not delete)
│   │   └── components/
│   │       └── EResourcesPage.tsx           # E-Resources component (unused — legacy ref)
│   │
│   └── AIAssistant/                         # Rizal AI assistant feature slice
│       └── components/
│           └── RizalAssistant.tsx            # Dr. Rizal floating AI assistant chat modal
│
├── Endpoints/                                # API endpoint stubs — frontend to backend bridge
│   └── (empty — created when backend connects)
│
├── Components/                               # Shared reusable UI primitives — presentational ONLY
│   ├── LayoutBars/                          # Global layout frame components
│   │   ├── TopNavBar.tsx                    # Main header navigation with hover dropdowns
│   │   └── Footer.tsx                       # Global footer component
│   ├── Modals/                              # Shared modal components
│   │   ├── BookListModal.tsx                # Modal for full book list display
│   │   └── FileViewerModal.tsx              # Modal for PDF/file viewer
│   └── Shared/                              # Common reusable UI elements
│       ├── FacebookBubble.tsx               # Floating Facebook Messenger bubble
│       ├── ImageGallery.tsx                 # Reusable image slider with auto-play
│       ├── SkeletonLoader.tsx               # Loading animations (Line, Circle, Card, Page)
│       ├── TreeView.tsx                     # Interactive file explorer tree
│       └── UOPACSection.tsx                 # UOPAC QR Code display
│
├── LayoutStyles/                             # Global styling and color system
│   └── index.css                            # CSS tokens, Tailwind base, custom animations
│
├── Hooks/                                    # Shared reusable hooks only
│   └── useIntersectionObserver.ts           # Custom hook for scroll-based fade-in
│
├── Libs/                                     # Shared frontend infrastructure and data
│   └── Assets/                              # CDN URLs, link lists, JSON data
│       ├── data.ts                          # Global constants, static arrays, link mappings
│       ├── eBooksTree.json                  # JSON tree of local books directory
│       └── treeData.ts                      # Types and configs for tree viewer
│
├── Assets/                                   # Static image assets (Vite-resolved)
│   └── (images, icons, media — raw static files ONLY)
│
├── App.tsx                                   # Main router setup with React Suspense + lazy loading
└── main.tsx                                  # React DOM entry point
```

---

## Flow Chain (SKILL.md Section 3A — NEVER alter)

```
Pages           → Route-level composition only
  ↓
Features        → Business logic and workflows
  ↓
Hooks / API     → Reusable logic, shared state, backend calls
  ↓
Components      → Presentational primitives only
  ↓
Libs            → Infrastructure: auth, clients, helpers
  ↓
Assets          → Static files
```

---

## Layer Rules (SKILL.md Section 4)

| Layer | What Belongs | What is FORBIDDEN |
|-------|-------------|-------------------|
| `Pages/` | Route-level composition, layout assembly | Business logic, API calls, feature code |
| `Features/` | Vertical slice workflows, feature hooks, feature API | Global state, shared UI, infrastructure |
| `Endpoints/` | API call functions, request/response types | Business rules, UI rendering |
| `Components/` | Modals, cards, nav bars, shared UI elements | Feature-specific logic, API calls |
| `LayoutStyles/` | CSS tokens, Tailwind base, color variables | Component-specific styles |
| `Hooks/` | Reusable hook logic, observers | Feature-specific hooks (go in Features/) |
| `Libs/Assets/` | Constants, link lists, JSON data, CDN URLs | UI components, business logic |
| `Assets/` | Images, icons, PDFs, media | Any logic or code |
