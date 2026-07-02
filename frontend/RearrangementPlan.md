# Frontend Rearrangement Plan

> Based on **SKILL.md Section 4** — Frontend Vertical Slice Structure
> This is a **STRUCTURE-ONLY** migration. No UI, functions, color scheme, styles, or component logic will change.
> Only file locations and import paths will be updated.

---

## Critical Rules to Obey During Rearrangement

```
RULE 1:  DO NOT change any UI, functions, color scheme, styles, or components.
RULE 2:  DO NOT delete any files — only MOVE them to the correct layer.
RULE 3:  DO NOT rename any files — same filenames, better placement.
RULE 4:  DO NOT skip any layer — follow the exact flow chain from SKILL.md Section 3A.
RULE 5:  DO NOT mix responsibilities — each layer has strict boundaries.
RULE 6:  DO update ALL import paths in every moved file AND in files that reference them.
RULE 7:  DO add a one-line layer comment to the top of every moved file (SKILL.md Section 10).
RULE 8:  DO verify the app compiles after EVERY batch of moves.
RULE 9:  DO follow the Placement Decision Guide (SKILL.md Section 12) for every file.
RULE 10: The flow chain order is: Pages → Features → Hooks/State/API → Shared Components → Libs → Assets
```

---

## Current Structure (FLAT — Violates SKILL.md)

```
src/
├── components/          ← ALL 21 components dumped here (violates vertical slice)
│   ├── BlueModalCarousel.tsx
│   ├── BookListModal.tsx
│   ├── EResourcesPage.tsx
│   ├── ExternalServicesSection.tsx
│   ├── FacebookBubble.tsx
│   ├── FeedbackSection.tsx
│   ├── FeedbackStickyCard.tsx
│   ├── FileViewerModal.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── ImageGallery.tsx
│   ├── LibraryMapSection.tsx
│   ├── LibrarySectionCarousel.tsx
│   ├── NewlyAcquiredBooks.tsx
│   ├── PersonnelSection.tsx
│   ├── RizalAssistant.tsx
│   ├── ServicesSection.tsx
│   ├── SkeletonLoader.tsx
│   ├── TopNavBar.tsx
│   ├── TreeView.tsx
│   └── UOPACSection.tsx
├── Pages/               ← Flat pages (should have subfolders)
│   ├── AboutPage.tsx
│   ├── AdministrationPage.tsx
│   ├── CollectionPage.tsx
│   ├── HomePage.tsx
│   ├── PersonnelPage.tsx
│   ├── PhysicalSetupPage.tsx
│   └── ServicesPage.tsx
├── assets/              ← Data files (should be Libs/Assets/)
│   ├── data.ts
│   ├── eBooksTree.json
│   └── treeData.ts
├── hooks/               ← Lowercase (should be Hooks/)
│   └── useIntersectionObserver.ts
├── App.tsx
├── index.css            ← Should be in LayoutStyles/
└── main.tsx
```

---

## Target Structure (SKILL.md Section 4 — Exact Match)

```
src/
├── Pages/                          # Route-level page assemblies only — no business logic
│   ├── Home/
│   │   └── HomePage.tsx
│   ├── About/
│   │   └── AboutPage.tsx
│   ├── Administration/
│   │   └── AdministrationPage.tsx
│   ├── Collection/
│   │   └── CollectionPage.tsx
│   ├── Personnel/
│   │   └── PersonnelPage.tsx
│   ├── PhysicalSetup/
│   │   └── PhysicalSetupPage.tsx
│   └── Services/
│       └── ServicesPage.tsx
│
├── Features/                       # Feature-specific vertical slices
│   ├── Home/
│   │   └── components/
│   │       ├── HeroSection.tsx
│   │       └── LibraryMapSection.tsx
│   ├── Services/
│   │   └── components/
│   │       ├── ServicesSection.tsx
│   │       └── ExternalServicesSection.tsx
│   ├── Feedback/
│   │   └── components/
│   │       ├── FeedbackSection.tsx
│   │       └── FeedbackStickyCard.tsx
│   ├── Collection/
│   │   └── components/
│   │       ├── NewlyAcquiredBooks.tsx
│   │       └── BlueModalCarousel.tsx
│   ├── PhysicalSetup/
│   │   └── components/
│   │       └── LibrarySectionCarousel.tsx
│   ├── Personnel/
│   │   └── components/
│   │       └── PersonnelSection.tsx
│   ├── EResources/
│   │   └── components/
│   │       └── EResourcesPage.tsx
│   └── AIAssistant/
│       └── components/
│           └── RizalAssistant.tsx
│
├── Endpoints/                      # API endpoint stubs (create empty for now)
│   └── (empty — stubs created when backend connects)
│
├── Components/                     # Shared reusable UI primitives — presentational only
│   ├── LayoutBars/
│   │   ├── TopNavBar.tsx
│   │   └── Footer.tsx
│   ├── Modals/
│   │   ├── BookListModal.tsx
│   │   └── FileViewerModal.tsx
│   └── Shared/
│       ├── FacebookBubble.tsx
│       ├── ImageGallery.tsx
│       ├── SkeletonLoader.tsx
│       ├── TreeView.tsx
│       └── UOPACSection.tsx
│
├── LayoutStyles/                   # Global styling and color system
│   └── index.css
│
├── Hooks/                          # Shared reusable hooks only
│   └── useIntersectionObserver.ts
│
├── Libs/                           # Shared frontend infrastructure and data
│   └── Assets/
│       ├── data.ts
│       ├── eBooksTree.json
│       └── treeData.ts
│
├── Assets/                         # Static image assets (Vite-resolved)
│   └── (images, icons, media — raw static files only)
│
├── App.tsx                         # Main router setup with React Suspense
└── main.tsx                        # React DOM entry point
```

---

## Exact File Move Map (35 moves)

Each row: `CURRENT PATH` → `TARGET PATH` | Reason (SKILL.md rule)

### Phase 1: Pages → Subfolders (7 moves)

| # | From | To | Rule |
|---|------|-----|------|
| 1 | `src/Pages/HomePage.tsx` | `src/Pages/Home/HomePage.tsx` | Section 4: Pages use subfolder per route |
| 2 | `src/Pages/AboutPage.tsx` | `src/Pages/About/AboutPage.tsx` | Section 4: Pages use subfolder per route |
| 3 | `src/Pages/AdministrationPage.tsx` | `src/Pages/Administration/AdministrationPage.tsx` | Section 4: Pages use subfolder per route |
| 4 | `src/Pages/CollectionPage.tsx` | `src/Pages/Collection/CollectionPage.tsx` | Section 4: Pages use subfolder per route |
| 5 | `src/Pages/PersonnelPage.tsx` | `src/Pages/Personnel/PersonnelPage.tsx` | Section 4: Pages use subfolder per route |
| 6 | `src/Pages/PhysicalSetupPage.tsx` | `src/Pages/PhysicalSetup/PhysicalSetupPage.tsx` | Section 4: Pages use subfolder per route |
| 7 | `src/Pages/ServicesPage.tsx` | `src/Pages/Services/ServicesPage.tsx` | Section 4: Pages use subfolder per route |

### Phase 2: Feature Slices (10 moves)

| # | From | To | Feature Slice |
|---|------|-----|---------------|
| 8 | `src/components/HeroSection.tsx` | `src/Features/Home/components/HeroSection.tsx` | Home |
| 9 | `src/components/LibraryMapSection.tsx` | `src/Features/Home/components/LibraryMapSection.tsx` | Home |
| 10 | `src/components/ServicesSection.tsx` | `src/Features/Services/components/ServicesSection.tsx` | Services |
| 11 | `src/components/ExternalServicesSection.tsx` | `src/Features/Services/components/ExternalServicesSection.tsx` | Services |
| 12 | `src/components/FeedbackSection.tsx` | `src/Features/Feedback/components/FeedbackSection.tsx` | Feedback |
| 13 | `src/components/FeedbackStickyCard.tsx` | `src/Features/Feedback/components/FeedbackStickyCard.tsx` | Feedback |
| 14 | `src/components/NewlyAcquiredBooks.tsx` | `src/Features/Collection/components/NewlyAcquiredBooks.tsx` | Collection |
| 15 | `src/components/BlueModalCarousel.tsx` | `src/Features/Collection/components/BlueModalCarousel.tsx` | Collection |
| 16 | `src/components/LibrarySectionCarousel.tsx` | `src/Features/PhysicalSetup/components/LibrarySectionCarousel.tsx` | PhysicalSetup |
| 17 | `src/components/PersonnelSection.tsx` | `src/Features/Personnel/components/PersonnelSection.tsx` | Personnel |

### Phase 3: Feature Slices — Legacy & AI (2 moves)

| # | From | To | Feature Slice |
|---|------|-----|---------------|
| 18 | `src/components/EResourcesPage.tsx` | `src/Features/EResources/components/EResourcesPage.tsx` | EResources (legacy) |
| 19 | `src/components/RizalAssistant.tsx` | `src/Features/AIAssistant/components/RizalAssistant.tsx` | AIAssistant |

### Phase 4: Shared Components (7 moves)

| # | From | To | Shared Category |
|---|------|-----|-----------------|
| 20 | `src/components/TopNavBar.tsx` | `src/Components/LayoutBars/TopNavBar.tsx` | LayoutBars |
| 21 | `src/components/Footer.tsx` | `src/Components/LayoutBars/Footer.tsx` | LayoutBars |
| 22 | `src/components/BookListModal.tsx` | `src/Components/Modals/BookListModal.tsx` | Modals |
| 23 | `src/components/FileViewerModal.tsx` | `src/Components/Modals/FileViewerModal.tsx` | Modals |
| 24 | `src/components/FacebookBubble.tsx` | `src/Components/Shared/FacebookBubble.tsx` | Shared |
| 25 | `src/components/ImageGallery.tsx` | `src/Components/Shared/ImageGallery.tsx` | Shared |
| 26 | `src/components/SkeletonLoader.tsx` | `src/Components/Shared/SkeletonLoader.tsx` | Shared |
| 27 | `src/components/TreeView.tsx` | `src/Components/Shared/TreeView.tsx` | Shared |
| 28 | `src/components/UOPACSection.tsx` | `src/Components/Shared/UOPACSection.tsx` | Shared |

### Phase 5: Hooks, Libs, LayoutStyles (5 moves)

| # | From | To | Layer |
|---|------|-----|-------|
| 29 | `src/hooks/useIntersectionObserver.ts` | `src/Hooks/useIntersectionObserver.ts` | Hooks |
| 30 | `src/assets/data.ts` | `src/Libs/Assets/data.ts` | Libs/Assets |
| 31 | `src/assets/eBooksTree.json` | `src/Libs/Assets/eBooksTree.json` | Libs/Assets |
| 32 | `src/assets/treeData.ts` | `src/Libs/Assets/treeData.ts` | Libs/Assets |
| 33 | `src/index.css` | `src/LayoutStyles/index.css` | LayoutStyles |

### Phase 6: Import Path Updates (CRITICAL)

After all files are moved, update ALL import paths in:

| File | Imports to Update |
|------|-------------------|
| `src/App.tsx` | All 7 page imports, TopNavBar, FacebookBubble, FeedbackStickyCard, RizalAssistant, Footer, SkeletonLoader |
| `src/main.tsx` | index.css path → `./LayoutStyles/index.css` |
| `src/Pages/Home/HomePage.tsx` | HeroSection, FeedbackSection, ExternalServicesSection, LibraryMapSection, UOPACSection |
| `src/Pages/Services/ServicesPage.tsx` | ServicesSection |
| `src/Pages/Collection/CollectionPage.tsx` | NewlyAcquiredBooks, TreeView, FileViewerModal, data imports |
| `src/Pages/Personnel/PersonnelPage.tsx` | PersonnelSection |
| `src/Pages/PhysicalSetup/PhysicalSetupPage.tsx` | LibrarySectionCarousel |
| Every Feature component | useIntersectionObserver hook, data.ts imports, shared component imports |
| Every shared component | Any cross-references to other shared components or data |

### Phase 7: Create Empty Directories & Stubs

| # | Directory | Purpose |
|---|-----------|---------|
| 34 | `src/Endpoints/` | API endpoint stubs (empty — populated when backend connects) |
| 35 | `src/Assets/` | Static image assets placeholder |

### Phase 8: Cleanup

- Delete empty `src/components/` directory (all files moved out)
- Delete empty `src/hooks/` directory (moved to `src/Hooks/`)
- Delete empty `src/assets/` directory (moved to `src/Libs/Assets/`)
- Verify no orphan imports remain

### Phase 9: Verify

- Run `npm run dev` — confirm app compiles with zero errors
- Check every page route loads correctly in browser
- Verify no broken imports in console

---

## Execution Order (MUST follow this sequence)

```
Step 1:  Create all target directories first (empty folders)
Step 2:  Move Pages into subfolders (Phase 1)
Step 3:  Move Feature components (Phase 2 + 3)
Step 4:  Move Shared Components (Phase 4)
Step 5:  Move Hooks, Libs, LayoutStyles (Phase 5)
Step 6:  Create Endpoints/ and Assets/ stubs (Phase 7)
Step 7:  Update ALL import paths across the entire project (Phase 6)
Step 8:  Add layer comments to top of every moved file (SKILL.md Section 10)
Step 9:  Delete old empty directories (Phase 8)
Step 10: Run dev server and verify (Phase 9)
```

---

## Layer Ownership Reference (SKILL.md Section 4 — Layer Rules)

| Layer | What Belongs | What is FORBIDDEN |
|-------|-------------|-------------------|
| `Pages/` | Route-level composition, layout assembly | Business logic, API calls, feature code |
| `Features/` | Vertical slice workflows, feature hooks | Global state, shared UI, infrastructure |
| `Endpoints/` | API call functions, request/response types | Business rules, UI rendering |
| `Components/` | Modals, cards, nav bars, shared UI elements | Feature-specific logic, API calls |
| `LayoutStyles/` | CSS tokens, Tailwind base, color variables | Component-specific styles |
| `Hooks/` | Reusable hook logic, observers | Feature-specific hooks |
| `Libs/Assets/` | Constants, link lists, JSON data, CDN URLs | UI components, business logic |
| `Assets/` | Images, icons, PDFs, media | Any logic or code |

---

## File Comment Template (SKILL.md Section 10)

Every moved file gets this at line 1:

```tsx
// [Layer: Features/Home] — HeroSection component.
// Renders the hero banner with real-time clock and library status.
// Do NOT put API calls or global state here.
```

```tsx
// [Layer: Components/LayoutBars] — TopNavBar component.
// Global header navigation with hover dropdowns.
// Do NOT put feature-specific logic or API calls here.
```

---

*This plan follows SKILL.md Sections 2, 3A, 4, 10, 12, and 13 exactly. No shortcuts. No layer skipping. No mixed responsibilities.*
