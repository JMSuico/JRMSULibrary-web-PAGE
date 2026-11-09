# Frontend System Structure & Global Calling Imports Specification
## JRMSU Katipunan Campus Library System

> **Architecture Standard**: Full Vertical Slice + Global Calling Imports  
> **Tech Stack**: React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4  
> **Date Updated**: November 5, 2026

---

## 1. Directory Tree & Global Calling Hierarchy

```text
frontend/src/
|-- LayoutStyles/                                  # GLOBAL CALLING STYLES: Master styling system & tokens
|   |-- FontSyle/                                  # Typography & font definitions ONLY
|   |   `-- fontStyles.css                         # Inter, Playfair Display, JetBrains Mono tokens & fluid rules
|   |-- MainLayout.css                             # Semantic color tokens, spacing variables, viewport & body layout
|   |-- PartLayout.css                             # Part utilities, pulse rings, modal animations, glassmorphism
|   `-- index.css                                  # MASTER ENTRY: Imports fontStyles.css, MainLayout, PartLayout
|
|-- LayoutBars/                                    # GLOBAL CALLING IMPORTS: Master Layout Frames
|   |-- Header.tsx                                 # Public floating glass navigation header
|   |-- Footer.tsx                                 # Institutional library footer
|   |-- AdminLayout.tsx                            # Admin console layout wrapper
|   `-- index.ts                                   # MASTER BARREL EXPORT: import { ... } from '@/LayoutBars'
|
|-- Shared/                                        # GLOBAL CALLING IMPORTS: Universal UI Primitives
|   |-- Button.tsx                                 # Universal atomic button (7 variants, 4 sizes, icons, loading)
|   |-- Checkbox.tsx                               # Accessible checkbox (checked, unchecked, indeterminate '-')
|   |-- RadioButton.tsx                            # Accessible radio button & group primitive
|   |-- Dropdown.tsx                               # Dropdown selection menu with click-outside auto-close
|   |-- SearchBar.tsx                              # Glassmorphic search bar with clear button & debounced typing
|   |-- DefaultFloatingModalCard.tsx               # Universal floating modal (glass backdrop, ESC close, scroll lock)
|   |-- ModalCard.tsx                              # Responsive modal container card
|   |-- Drawer.tsx                                 # Universal slide-over drawer (left / right / bottom)
|   |-- SkeletonLoader.tsx                         # Shimmer loading skeletons (Line, Circle, Card, Page)
|   |-- Pagination.tsx                             # Universal table & list pagination controls
|   |-- DragDropFileUpload.tsx                     # Drag-and-drop file upload zone
|   |-- ImageGallery.tsx                           # Responsive image viewer slider
|   |-- TreeView.tsx                               # Hierarchical tree explorer
|   |-- Charts/                                    # Universal interactive chart suite
|   |   |-- LinearCurveyChart.tsx                  # Spline curved area chart
|   |   |-- BarGraphChart.tsx                      # Histogram & bar chart visualizer
|   |   |-- PieGraphChart.tsx                      # Donut / pie chart visualizer
|   |   |-- HeatmapChart.tsx                       # 2D intensity density matrix
|   |   `-- index.ts                               # Chart suite barrel export
|   `-- index.ts                                   # MASTER BARREL EXPORT: import { ... } from '@/Shared'
|
|-- Hooks/                                         # GLOBAL CALLING IMPORTS: Universal Utility Hooks
|   |-- usePagination.ts                           # Dynamic pagination math, clamping, and windowed numbers
|   |-- useFluidResponsiveness.ts                  # Viewport dimensions & responsive breakpoint detection
|   |-- useDebounce.ts                             # Universal debouncing hook
|   |-- useToast.ts / useToasts.ts                 # Toast notification system
|   |-- useScrollbar.ts                            # Scroll position, scroll direction, and auto-hide tracking
|   |-- useAutoRefresh.ts                          # Interval polling & WebSocket update listener
|   |-- useGlobalAutoRefresh.ts                    # Central singleton auto-refresh engine
|   |-- useIntersectionObserver.ts                 # Viewport intersection & lazy loading
|   |-- useDraggableScroll.ts                      # Drag-to-scroll container hook
|   |-- useDraggableBubble.ts                      # Floating interactive bubble physics
|   |-- useUndoDelete.ts                           # Soft-delete & undo state tracking
|   `-- index.ts                                   # MASTER BARREL EXPORT: import { ... } from '@/Hooks'
|
|-- Features/                                      # Feature-specific vertical slices (owns business workflows)
|   |-- Home/                                      # Home page slice (HeroSection, LibraryMapSection)
|   |-- Services/                                  # Services slice (ServicesSection, ExternalServicesSection)
|   |-- Feedback/                                  # Feedback slice (FeedbackSection, FeedbackStickyCard)
|   |-- Collection/                                # Collection slice (NewlyAcquiredBooks, BlueModalCarousel)
|   |-- PhysicalSetup/                             # Physical setup slice (LibrarySectionCarousel)
|   |-- Personnel/                                 # Personnel slice (PersonnelSection flowchart)
|   |-- AIAssistant/                               # Dr. Rizal AI Assistant slice (RizalAssistant, RizalBubble)
|   |-- ResearchSurvey/                            # Research survey slice (SurveyStickyCard, SurveyModal)
|   `-- Admin/                                     # Admin management slice (13 domain managers)
|
|-- Pages/                                         # Route-level page assemblies ONLY
|   |-- Home/HomePage.tsx
|   |-- About/AboutPage.tsx
|   |-- Services/ServicesPage.tsx
|   |-- Administration/AdministrationPage.tsx
|   |-- Collection/CollectionPage.tsx
|   |-- Personnel/PersonnelPage.tsx
|   |-- PhysicalSetup/PhysicalSetupPage.tsx
|   `-- Admin/                                     # Admin manager route wrappers
|
|-- Endpoints/                                     # Typed API client services
|-- Libs/                                          # Utilities & infrastructure (apiClient, offlineQueue)
`-- App.tsx                                        # Master application router
```

---

## 2. Global Calling Import Rules

### Rule 1: Master Barrel Exports
All universal UI primitives, hooks, and layout wrappers MUST be consumed via their master barrel export:
```tsx
// Correct Global Calling Imports
import { Button, Dropdown, SearchBar, ModalCard } from '@/Shared';
import { usePagination, useFluidResponsiveness, useDebounce } from '@/Hooks';
import { Header, Footer, AdminLayout } from '@/LayoutBars';
```

### Rule 2: Styling Separation of Concerns
1. **`FontSyle/fontStyles.css`**: Strictly for font tokens, `@theme` font families, text sizes, and font-specific fluid typography overrides.
2. **`MainLayout.css`**: Strictly for semantic color tokens, spacing variables, base `#root` / `body` stacking contexts, and responsive device layout wrappers.
3. **`PartLayout.css`**: Strictly for component-level utilities, glassmorphic cards, pulse rings, modal animations, carousels, and loaders.
4. **`index.css`**: Strictly the master entrypoint that aggregates `fontStyles.css`, `MainLayout.css`, and `PartLayout.css`.

### Rule 3: Zero Business Logic in Shared/ or LayoutBars/
* Universal primitives in `Shared/` are purely presentational and accessible.
* Layout frames in `LayoutBars/` only handle navigation shells, responsive drawers, and layout outlets.

---

## 3. Verification & Compliance
* **Type-Check**: `npx tsc --noEmit` exits with 0 errors.
* **Build**: `npm run build` compiles 2,714 modules with 0 errors.
