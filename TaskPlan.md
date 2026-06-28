# TaskPlan — Maam Kiara's Navigation Restructure

## Objective
Restructure the JRMSU Library website navigation from 4 nav items (`Home`, `About`, `Services`, `E-Resources`) to 8 nav items (`Home`, `About`, `Services`, `Administration`, `Personnel`, `Collection`, `Physical Setup`), transferring existing UI and functionality without modifying any component's visual design.

---

## Rules to Obey

> [!CAUTION]
> **DO NOT** change any component's UI/styling. Only move/reuse components as-is.

1. **No UI Changes** — Transfer components with their existing styles, classes, and behavior intact
2. **Follow Architecture** — Feature-based vertical-slice: `Pages → Components → Hooks/Types/Lib`
3. **Follow Flowchain** — `section::before` white overlay applies to `<section>` elements only
4. **Keep Existing Imports** — Preserve all data imports, hook usage, and component structure
5. **Color Tokens Only** — No raw hex in new code; use design tokens where applicable
6. **Accessibility** — All new interactive elements need `aria-*` attributes, focus-visible, cursor-pointer
7. **Mobile-First** — All new pages must work at 375px+ with existing responsive patterns
8. **No Duplicate Components** — Reuse existing components via import, never copy/paste
9. **Router Pattern** — Follow existing `react-router-dom` v7 pattern from [App.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/App.tsx)
10. **Nav Pattern** — Follow existing dropdown/sidebar accordion pattern from [TopNavBar.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/TopNavBar.tsx)

---

## Current State → Target State

### Navigation Structure Diff

| # | Current Nav | Target Nav |
|---|---|---|
| 1 | **Home** → Hero, NewlyAcquiredBooks, LibrarySection, Personnel, Map, UOPAC | **Home** → Hero, FeedbackSection, ExternalServicesSection, Map, UOPAC |
| 2 | **About** → Org Structure, History, Quality Objectives | **About** → History of JRMSU Katipunan Campus, Quality Objectives |
| 3 | **Services** → Library Services, Feedback & Complaints, External Services | **Services** → List of Services (only ServicesSection, renamed) |
| 4 | **E-Resources** → File Services, Online Access | *(removed — content moves to Collection)* |
| 5 | — | **Administration** (NEW) → Org Structure, Manual (dropdown: Administration / Manual) |
| 6 | — | **Personnel** (NEW) → PersonnelSection |
| 7 | — | **Collection** (NEW) → Newly Acquired Books, Local Books (was File Services), Online Access (dropdown tabs) |
| 8 | — | **Physical Setup** (NEW) → LibrarySectionCarousel |

### Component Transfer Map

| Component | From | To |
|---|---|---|
| [FeedbackSection](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/FeedbackSection.tsx) | ServicesPage tab | HomePage (below arrow indicator) |
| [ExternalServicesSection](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/ExternalServicesSection.tsx) | ServicesPage tab | HomePage (below FeedbackSection) |
| [PersonnelSection](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/PersonnelSection.tsx) | HomePage | PersonnelPage (new) |
| [NewlyAcquiredBooks](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/NewlyAcquiredBooks.tsx) | HomePage | CollectionPage (new) |
| [LibrarySectionCarousel](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/LibrarySectionCarousel.tsx) | HomePage | PhysicalSetupPage (new) |
| Org Structure (AboutPage `org` tab) | AboutPage | AdministrationPage (new) |
| File Services (EResourcesPage `files` tab) | EResourcesPage | CollectionPage as "Local Books" |
| Online Access (EResourcesPage `online` tab) | EResourcesPage | CollectionPage as "Online Access" |

---

## Proposed Changes

### 1. New Page Files

#### [NEW] [AdministrationPage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/Pages/AdministrationPage.tsx)
- Tab/dropdown with 2 options: **Administration** (Org Structure) and **Manual**
- Administration tab: Reuses the org structure image + lightbox from current AboutPage
- Manual tab: Displays the LIBRARY POLICIES MANUAL PDF (placeholder iframe until PDF is placed in `/assets/`)

#### [NEW] [PersonnelPage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/Pages/PersonnelPage.tsx)
- Directly renders `<PersonnelSection />` component as-is

#### [NEW] [CollectionPage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/Pages/CollectionPage.tsx)
- 3-option dropdown/tab selector: **Newly Acquired Books** | **Local Books** | **Online Access**
- Newly Acquired Books: Renders `<NewlyAcquiredBooks />`
- Local Books: Renders the TreeView + FileViewerModal (was "File Services")
- Online Access: Renders the LinkTable sections (Open Access Journals, Resources, Acquired E-Resources)

#### [NEW] [PhysicalSetupPage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/Pages/PhysicalSetupPage.tsx)
- Directly renders `<LibrarySectionCarousel />` component as-is

---

### 2. Modified Page Files

#### [MODIFY] [HomePage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/Pages/HomePage.tsx)
- **Remove**: `<NewlyAcquiredBooks />`, `<LibrarySectionCarousel />`, `<PersonnelSection />`
- **Add**: `<FeedbackSection />`, `<ExternalServicesSection />` (below existing sections, after hero arrow)
- **Keep**: `<HeroSection />`, `<LibraryMapSection />`, `<UOPACSection />`

#### [MODIFY] [AboutPage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/Pages/AboutPage.tsx)
- **Remove**: `org` tab (Organizational Structure) — moved to Administration
- **Keep**: `history` tab → rename to "History of JRMSU Katipunan Campus"
- **Keep**: `objectives` tab (Quality Objectives)
- Remove org image lightbox state/portal

#### [MODIFY] [ServicesPage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/Pages/ServicesPage.tsx)
- **Remove**: `feedback` and `external` tabs — they move to HomePage
- **Keep**: Only `services` tab with `<ServicesSection />`
- **Rename**: Page title from "Library Services" to "List of Services"
- Remove the tab-pill UI since only one tab remains

#### [DELETE] [EResourcesPage.tsx (Pages)](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/Pages/EResourcesPage.tsx)
- Content moves entirely to CollectionPage
- The component-level [EResourcesPage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/EResourcesPage.tsx) remains available for reuse in CollectionPage

---

### 3. Router & Navigation

#### [MODIFY] [App.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/App.tsx)
- **Remove**: `/e-resources` and `/e-resources/:tab` routes
- **Add**: `/administration`, `/personnel`, `/collection`, `/collection/:tab`, `/physical-setup` routes
- Import new page components

#### [MODIFY] [TopNavBar.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/TopNavBar.tsx)
- **Replace** `navLinks` array with new 7-item structure:
  1. `Home` → `/`
  2. `About` → `/about` (dropdown: History of JRMSU Katipunan Campus, Quality Objectives)
  3. `Services` → `/services` (no dropdown, single page: "List of Services")
  4. `Administration` → `/administration` (dropdown: Administration, Manual)
  5. `Personnel` → `/personnel` (no dropdown)
  6. `Collection` → `/collection` (dropdown: Newly Acquired Books, Local Books, Online Access)
  7. `Physical Setup` → `/physical-setup` (no dropdown)
- Update sidebar accordion state for new dropdown menus (`administrationOpen`, `collectionOpen`)
- Remove old E-Resources state (`eresourcesOpen`)

---

## Open Questions

> [!IMPORTANT]
> **Manual PDF**: The task asks for "LIBRARY POLICIES MANUAL pdf files" to be displayed. No PDF file named "Library Policies Manual" exists in the `/assets/` directory. I will create a placeholder page that expects the PDF at `/assets/library-policies-manual.pdf`. You will need to place the actual PDF file there.

---

## Verification Plan

### Build Check
- `npm run build` — must pass with 0 errors

### Manual Verification
1. All 7 nav items render correctly on desktop and mobile sidebar
2. Each page loads its transferred components with identical UI
3. Dropdown menus work for About, Administration, and Collection
4. No broken imports or missing components
5. All routes navigate correctly
6. Mobile sidebar accordion expands/collapses for dropdown nav items
