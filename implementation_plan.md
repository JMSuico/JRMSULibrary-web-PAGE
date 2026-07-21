# JRMSU Library Landing Page — Complete Redesign & Admin Portal

Comprehensive redesign of the JRMSU Katipunan Campus Library Landing Page based on the user's complete vision. This plan covers every idea and thought provided — nothing has been changed or omitted.

---

## User Review Required

> [!IMPORTANT]
> This is a large-scale overhaul involving **30+ new/modified components**, a **separate admin portal**, and **backend API**. Estimated implementation time is significant. Please review all sections carefully before approving.

> [!WARNING]
> The admin portal runs on a **separate port** (e.g., `localhost:3001/admin`) and requires a backend server (Express) with a database (SQLite/JSON) for persistence. This adds complexity to the project setup.

> [!CAUTION]
> The Library Section pictures are in `.HEIC` format (Apple format). These may need conversion to `.jpg`/`.webp` for browser compatibility. The eBooks tree view requires files to be present in `assets/eBooks/eBooks/Department/` — currently only a directory exists.

---

## Open Questions

> [!IMPORTANT]
> 1. **HEIC Image Conversion**: The Library Section pictures (`assets/Library pic/`) are all in `.HEIC` format, which browsers do not natively support. Should I convert them to `.jpg` during the build, or do you have `.jpg` versions available?
> 2. **RIZAL Chatbot**: Option 1 "Chat with Rizal chatbot" — should this use the Gemini AI API (already in your dependencies with `@google/genai`), or should it link to an external chatbot service?
> 3. **Discussion Room Booking**: Option 3 "Acquired room in Discussion room 1 and 2, Tutorium room 1 and 2, or the table in the Library" — should this be a simple form submission, or a full booking system with availability checking?
> 4. **Admin Authentication**: Should the admin panel have a login page with username/password, or is it unprotected for now?
> 5. **Database Choice**: For the admin backend (books management, section management, etc.), should I use SQLite, a JSON file store, or another database?
> 6. **Librarian Title**: You specified changing "Chief Librarian" to "Campus Librarian" for Kiara Keren M. Alavanza in the Librarian's Corner section. Should this also be updated everywhere else (Org Structure, Personnel Section, Footer)?
> 7. **Seameo-innotech eBooks**: No URL was provided for this resource in E-Resources. Should I add a placeholder or omit it?

---

# Comprehensive Bug Fix Plan

This document outlines the systematic plan to resolve the 4 reported issues while strictly adhering to the project's architecture and flowchains.

## User Review Required
Please review the plan below. Note that I will proceed with implementation immediately upon your approval.

## Proposed Changes

### [Backend: Services Layer]
Fix the `Reports Generator` deletion bug. The crash is caused by a missing method (`move_to_bin`) in the `RecycleBinService` which causes the backend to fail with a 500/400 error when deleting reports.
#### [MODIFY] [i_recycle_bin_service.py](file:///c:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/backend/Features/Services/Interfaces/i_recycle_bin_service.py)
- Add the `move_to_bin` interface method.
#### [MODIFY] [recycle_bin_service.py](file:///c:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/backend/Features/Services/Implementations/recycle_bin_service.py)
- Implement `move_to_bin` which delegates to the `create` method of the repository.

### [Frontend: Features/Admin]
Fix the `Carousel Customize` image upload bug where the backend rejects string URLs for the `background_image` field.
#### [MODIFY] [Settings.tsx](file:///c:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/frontend/src/Features/Admin/components/Settings.tsx)
- Strip the `background_image` string property from the JSON payload when a new file is not selected, ensuring the backend retains the existing image.

Fix the `Email & Reservation` bulk sending performance issue.
#### [MODIFY] [EmailMessage.tsx](file:///c:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/frontend/src/Features/Admin/components/EmailMessage.tsx)
- Rewrite the `processQueue` logic to process batches of 3 emails concurrently using `Promise.all`, speeding up bulk replies significantly.

### [Frontend: Features/AIAssistant]
Fix the `AI Rizal Assistant` scroll focus issue.
#### [MODIFY] [RizalAssistant.tsx](file:///c:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/frontend/src/Features/AIAssistant/components/RizalAssistant.tsx)
- Add `overscroll-contain` to the main scroll area to trap scroll events and prevent the browser from shifting scroll focus to the `<body>`.

## Verification Plan

### Automated Tests
- None required, we will verify manually.

### Manual Verification
- **Phase 1 (Reports)**: Create a report and delete it. Ensure it moves to the recycle bin without errors.
- **Phase 2 (Carousel)**: Save carousel settings without changing the image to verify it doesn't throw a validation error.
- **Phase 3 (Emails)**: Select 4+ emails and initiate a bulk reply to observe the 3-by-3 concurrent execution.
- **Phase 4 (Rizal Assistant)**: Open the chat, scroll, move the mouse out, scroll the page, move the mouse back in, and verify the chat scrolls properly.

---

### Phase 1: Navigation & Global UI Overhaul

#### [MODIFY] [TopNavBar.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/TopNavBar.tsx)

**NavMenu Gradient Background:**
- Apply a **horizontal gradient** from **white on the left** to **blue on the right** across the entire navigation bar
- CSS: `background: linear-gradient(to right, #ffffff, #1e3a8a)` (or similar blue matching the JRMSU brand)

**Nav Links ("Home, About, Services, E-Resources"):**
- Restructure nav links to exactly 4 items: **Home**, **About**, **Services**, **E-Resources**
- Remove "Staff" and "File Services" and "Online Access" from the navbar
- Merge "File Services" and "Online Access" into the new "**E-Resources**" nav item
- Apply a **blended transparent white overlay** transitioning from semi-white to **fully transparent** so the background picture is visible through the navigation area
- CSS overlay: `background: linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0))` applied to each white section

**About Dropdown Navigation:**
- Add a **dropdown menu** under "About" with 3 sub-items that navigate to separate page sections/modules:
  1. Organizational Structure
  2. History of JRMSU
  3. JRMSU Library Quality Objectives

#### [MODIFY] [index.css](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/index.css)

- Update the `section::before` pseudo-element to blend from **transparent white to fully transparent** so the background picture is always visible
- Add gradient nav styles
- Add dropdown menu CSS
- Add all new component styles (carousel, tree view, floating bubbles, etc.)

---

### Phase 2: Hero Section & Home Page Redesign

#### [MODIFY] [HeroSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/HeroSection.tsx)

**University Header Text Display (above "Excellence in Information"):**
```
Republic of the Philippines              → Black fonts
JOSE RIZAL MEMORIAL STATE UNIVERSITY     → Blue font with shadow effect
KATIPUNAN CAMPUS                         → Blue Bold fonts
Katipunan, Zamboanga del Norte           → Blue fonts
```

**"Excellence in Information" tagline** → Blue color fonts

**Hero Card Modal:**
- Display the image `assets/JRMSU library lib.jpg` in a card modal positioned from middle to bottom
- Overlay text on the card:
  - "**The Gateway to Academic Excellence**"
  - "Empowering the JRMSU Katipunan community through accessible resources, expert guidance, and a modern digital research environment."
- Color blending: **blue gradient from middle to bottom** with transparency over the text area

**Timestamp / Clock Widget (below the card):**
- "Library is Open" status indicator
- Live clock: `HH:MM:SS AM/PM`
- Date: `MM:DD:YYYY`
- Static text: "Working days MONDAY TO FRIDAY"
- Static text: "7AM TO 7PM"
- Update the `isOpen` logic: working hours are **7:00 AM to 7:00 PM**, Monday to Friday (currently 8 AM–5 PM)

---

### Phase 3: Home Page Sections (Below Hero)

#### [MODIFY] [PersonnelSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/PersonnelSection.tsx)

**Library Personnel Section Title:**
- "Library Personnel"
- Subtitle: "Meet the dedicated library professionals committed to supporting learning, research, and academic excellence at JRMSU."

**Librarian's Corner — Blue Modal Card:**
- **LEFT SIDE** of the card:
  - Title: "**Librarian's Corner**"
  - Paragraph 1: "From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence."
  - Paragraph 2: "The Library of Jose Rizal Memorial State University Katipunan Campus is committed to supporting the University's Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources and services. In adherence to the standards, the library continuously enhances its collections, facilities, and technological services to meet the evolving needs of its academic community. It also promotes information literacy, strengthens research support, and fosters collaborative linkages to contribute to institutional development. The library remains dedicated to delivering quality services and nurturing a culture of lifelong learning among its users."
  - Paragraph 3: "Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!"

- **RIGHT SIDE** of the card:
  - Photo of **Kiara Keren M. Alavanza**
  - Title: "**Campus Librarian**" (changed from "Chief Librarian")

#### [NEW] [NewlyAcquiredBooks.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/NewlyAcquiredBooks.tsx)

**"NEWLY ACQUIRED BOOKS" Section — Blue Modal 3D Carousel:**

Design specifications (preserved exactly as provided):
- Centered inside a soft dark background or subtle gradient backdrop
- Each slide is a **BLUE MODAL CARD** (glass + modern UI style)
- **Active card:**
  - Deep blue gradient background (`#1e3a8a → #2563eb` or similar)
  - White text
  - Rounded large modal-style card (16–24px radius)
  - Soft glow shadow (blue neon-like outer glow)
  - Title at top, description below, optional icon/image
- **Side cards:**
  - Smaller scale
  - Darker/transparent blue
  - Blurred (backdrop blur effect)
  - Lower opacity
  - Positioned in 3D perspective behind active card

Carousel behavior:
- Horizontal 3D slide transition
- Smooth animation (CSS transitions or `transform translate3d`)
- Left and right navigation arrows (modern minimal style, circular buttons)
- Active index state controls the centered card
- Infinite loop optional (wrap-around navigation)
- Arrow left in the middle left side / Arrow right in the middle right side

Component structure:
- Default export: `BlueModalCarousel`
- Accept props: `items`, `initialIndex` (optional), `onChange` (optional callback)

Animation style:
- Smooth easing (0.4s–0.7s duration)
- Depth effect using `translateZ` + `scale`
- Soft glassmorphism blur on inactive cards

Overall feel:
- Modern SaaS UI
- Blue futuristic modal aesthetic
- Clean spacing, bold typography, premium look

#### [NEW] [LibrarySectionCarousel.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/LibrarySectionCarousel.tsx)

**"Library Section" Picture Carousel:**
- Same carousel function as the Newly Acquired Books carousel
- **Additional feature:** Changes the **webpage background picture** dynamically
- Auto-slideshow: slides to the left **every 5 seconds**
- Uses images from `assets/Library pic/` and `assets/PHYSICAL SET-UP 2026/`

#### [NEW] [LibraryMapSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/LibraryMapSection.tsx)

**"LIBRARY MAP AND LOCATION" Section:**
- Google Maps embed for **JRMSU Katipunan Library Campus**
- Exact coordinates: **8.510036, 123.286343**
- Address: Barangay Dos, Katipunan, Zamboanga del Norte
- Google Maps link: https://maps.app.goo.gl/D6EMrqq27fw4JTuW6
- Display in **SATELLITE MODE** (use `maptype=satellite` in embed URL)

#### [NEW] [UOPACSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/UOPACSection.tsx)

**"UOPAC — Union Online Public Access Catalog" Modal Card:**
- Header: "University Libraries"
- Title: "UOPAC"
- Subtitle: "Union Online Public Access Catalog"
- Display QR Code image from: `assets/uopac qr code.png`
- Text: "Scan QR to Register"
- OR: "CLICK THIS LINK" → https://library.jrmsu.edu.ph/opac/registration

---

### Phase 4: About Page — Separate Module Navigation

#### [MODIFY] [AboutSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/AboutSection.tsx)

Restructure "About" into **3 separate navigable modules** (accessible via the navbar dropdown):

**Module 1: "Organizational Structure"**
- Modal card displaying the image: `assets/organizational structure library.png`

**Module 2: "History of JRMSU"**
- Modal card displaying this EXACT text (not changed):

> Jose Rizal Memorial State University was established by virtue of RA 9852 with Congresswoman Cecilia G. Jalosjos-Carreon as principal author, Congressman Cesar Jalosjos as co-author. It was approved by President Gloria Macapagal-Arroyo on December 15, 2009. It was formerly the Jose Rizal Memorial State Collge by virtue of RA 8193 sponsored by Congressman Romeo G. Jalosjos of the 1st District of Zamboanga del Norte which was approved on June 11, 1996 by the President of the Republic, Fidel V. Ramos. It was a consolidation of the Rizal Memorial Vocational School (RMNVS) in Dapitan City, the Zamboanga del Norte School of Arts and Trades (ZNSAT) in Dipolog City, and the Siocon National Vocational School (SNVS) in the Municipality of Siocon. In 2002, two higher education institutions (HEIs) within Zamboanga del Norte, namely the Katipunan National Agricultural School (KNAS) in the municipality of Katipunan and the Zamboanga del Norte Agricutural College (ZNAC) in the Municipality of Tampilisan, were integrated into then JRMSC pursuant to CHED Memorandum Order No. 27 series of 2000 thus comprising the fourth and fifth campuses, respectively of JRMSU.
>
> The first President was Dr. Felipe O. Ligan who was appointed in 1997. On June 7, 2002 CHED Special Order No. 35, s. 2002 appointed Dr. Henry A. Sojor as the OIC President of the Jose Rizal Memorial State College in concurrent capacity as President of Central Visayas Polytechnic College in Dumaguete City now Negros Oriental State University.
>
> In the span of two years and eight months, the Board of Trustee then deemed it best for the College to have its permanent leader. Thus, on March 1, 2005, Dr. Edgar S. Balbuena assumed office as second President of JRMSC pursuant to BOT Resolution No. 04, series of 2005 Chairmaned by Fr. Rolando V. Rosa, OP.
>
> With the appointment of Dr. Balbuena, the College charted a new course. With his extraordinary leadership it took only four years and nine months for the College to be elevated to the status of a University. Indeed the growth of the University means a continuing and growing commitment for academic excellence and quality, research, and productivity, community involvement and partnership for national development and global competitiveness. Evidently, he emerged as a dynamo, leading the people of Zamboanga del Norte and adjacent provinces towards improved quality life.

**Module 3: "JRMSU Library Quality Objectives"**
- Modal card displaying these EXACT 5 objectives (not changed):

1. Increase the acquisition of print, digital, and multimedia resources by 10% annually to ensure modern, relevant, and accessible materials that support instruction, research, extension, and production.
2. Increase library user engagement by 10% and ensure the 100% provision of adaptive, inclusive, and transformative library facilities that foster creativity, critical thinking, and lifelong learning.
3. Forge at least one (1) local and one (1) international formal partnership or collaboration each year, and implement at least one (1) joint program or activity with academic institutions, government agencies, or library networks to strengthen resource sharing, collaboration, and service innovation.
4. Ensure that 100% of library personnel participate in at least two (2) capacity-building or professional development activities per year, strengthening their skills in technology, research support, customer service, and library management.
5. Achieve a minimum of 90% overall user satisfaction rating in the annual library survey by continuously delivering equitable, technology-driven, and user-centered services.

---

### Phase 5: Services & E-Resources Pages

#### [MODIFY] [ServicesSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/ServicesSection.tsx)

**"LIBRARY SERVICES" Module:**
- Use the full content from [Library Services.md](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/Library%20Services.md)
- Display all 17 library services with the Citizens Charter accordion

#### [MODIFY] [FeedbackSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/FeedbackSection.tsx)

**"Feedback & Complaints Mechanism" — Separate Module under Services:**
- Title: "Feedback & Complaints Mechanism"
- Subtitle: "We value your feedback. Browse through the step-by-step guide below."
- **Dropdown function** to expand/collapse
- **Carousel**: Classic single-card display, slideshow through images from `assets/Feedback and complains mechanism/` (10 images)

#### [MODIFY] [ExternalServicesSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/ExternalServicesSection.tsx)

**"External Services" — Separate Module under Services:**
- Title: "External Services"
- Subtitle: "Explore our external library services and partner resources."
- **Dropdown function** to expand/collapse
- **Carousel**: Classic single-card display, slideshow through images from `assets/Library External Services/` (20 images)

#### [NEW] [EResourcesPage.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/EResourcesPage.tsx)

**Merge "File Services" and "Online Access" into "E-Resources" nav section.**

**E-Books and Journals — Tree View Component:**
- Hierarchical collapsible/expandable tree view of files originating from `assets/eBooks/eBooks/Department/`.
- Dynamically recursively reads the directory structure (e.g., `AGRI/BS Agriculture/`, `CBA/`, `CCS/`, etc.).
- When a user clicks a file:
  - A **floating modal card** appears.
  - User can **view and read the file** (PDF, Word, Excel reader iframe or viewer component).
  - **Read-only** — cannot be downloaded.
  - **Carousel navigation** within the modal to go to next/previous files in the same folder.

**Online Access — Link Lists:**
Display as organized link lists:

**Open Access Journal:**
| Resource | URL |
|---|---|
| Agriculture | https://www.mdpi.com/journal/agriculture |
| List of Scientific Journal | https://en.wikipedia.org/wiki/Lists_of_academic_journals |
| List of Academic Journal | https://en.wikipedia.org/wiki/Lists_of_academic_journals |
| Worldcat | https://search.worldcat.org/ |
| Google Book | https://books.google.com/?hl=en |
| Online Free E-Books | https://www.free-ebooks.net/ |
| Gutenberg | https://www.free-ebooks.net/ |
| Scribd | https://www.scribd.com/ |
| GetFreeEbooks | https://getfreeebooks.com/ |
| DOST Publication | https://www.dost.gov.ph/index.php?option=com_content&task=view&id=712&Itemid=201&appgw_azwaf_jsc=YU_apB7IN_mPNkdEH_BnTZWX6lhlM7xFfn7z7yLstI4 |
| Highwire Press | https://www.highwirepress.com/ |
| IPL Magazines | https://www.ipl.org/ |

**Resources:**
| Resource | URL |
|---|---|
| Science Direct | https://www.sciencedirect.com/ |
| Philippine Elib | https://www.elib.gov.ph/ |
| ERIC Educ. Res. Info. Center | https://eric.ed.gov/ |
| Gale Database | https://link.gale.com/apps/menu?userGroupName=phusm&prodId=MENU |
| Philippine E-Journals | https://ejournals.ph/ |
| Springer Nature Link | https://link.springer.com/ |
| E-Library USA | https://docs.google.com/forms/d/e/1FAIpQLSdK93TrYAkWrl32xWxlOItfYFTTgUQPY_Ws2ZhxfuVMvojpiA/viewform?fbclid=IwAR07NWjxpHNoE7hV4WL85sW_9xMSLKWsWn5gbpsXCDdEUuVVxt0HAny2GPM |
| Seameo-innotech eBooks | *(no URL provided)* |
| ProQuest | *(no URL provided)* |

**Acquired E-Resources:**
| Resource | URL |
|---|---|
| Bookshelf | https://www.vitalsource.com/ |
| Scholaar | https://scholaar.com/ |

---

### Phase 6: Floating UI Elements & Interactive Features

#### [NEW] [FeedbackStickyCard.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/FeedbackStickyCard.tsx)

**Middle Right Side — Sticky Feedback Card:**
- Floating "sticky mark" card UI on the **middle right side** of the page
- On click → redirect to: https://jrmsu.online/feedback/

#### [NEW] [FacebookBubble.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/FacebookBubble.tsx)

**Bottom Right Corner — Facebook Floating Bubble:**
- Floating bubble UI with **Facebook icon**
- On click → opens an **iframe modal / lightbox / embedded dialog** displaying: https://www.facebook.com/JRMSUkatipunanlibrary

#### [NEW] [RizalAssistant.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/RizalAssistant.tsx)

**Bottom Right Corner — RIZAL Floating Bubble:**
- Floating bubble named: **"RIZAL"**
- Introduction text:
  > Heads up, Ilustrados!
  > Please meet RIZAL, your friendly
  > R- Reference and
  > I - Information
  > Z- Zealous
  > A- Assistance
  > L - Librarian.
  > Feel free to connect with him.

- Default bubble displays the video: `assets/rizal waiving 2.mp4` as a floating UI in the bottom right corner
- User may toggle to display as icon using: `assets/rizal reading.mp4`

**3 Options when expanded:**
1. **Chat with Rizal chatbot** — AI chatbot interaction
2. **Send email** — Opens email compose
3. **Acquired room** — Book/reserve:
   - Discussion Room 1
   - Discussion Room 2
   - Tutorium Room 1
   - Tutorium Room 2
   - Table in the Library

---

### Phase 7: Admin Portal & Backend (Separate Port)

> [!IMPORTANT]
> The backend relies on **Django and MySQL** (via XAMPP/Apache). It will be configured strictly to use MySQL as mandated by the `PROJECT_SKILL.md`.

#### [NEW] `backend/` — Django REST Framework Backend

- Django project running on a separate port (`:8000` or `:3001` if preferred for the frontend proxy)
- REST API endpoints (`/api/`) built with Django REST Framework for:
  - Books CRUD (`/api/books/`)
  - Library Section Pictures CRUD (`/api/sections/`)
  - Tree View Files CRUD (`/api/files/`)
  - E-Resources CRUD (`/api/e-resources/`)
  - Analytics data (`/api/analytics/`)
- **Database:** MySQL via XAMPP (`django.db.backends.mysql`). SQLite is strictly forbidden.
- Models defined per `PROJECT_SKILL.md` (e.g., `NewlyAcquiredBook`, `LibraryInteriorImage`, `EResourceDepartment`, `EResourceFile`).
- When new data is added via admin, it **automatically reflects** on the public website.

#### [NEW] `admin/` — Admin Frontend (or integrated in React App under `/admin`)

**Dashboard:**
- **Analytics linear charts** — Newly acquired books over time
- **Bar graphs** — Website visitor count

**Module: "New Acquired Books Management"**
- 2 summary modal cards:
  - Total Books (value count)
  - Genre or Categories (values)
- Below: List of newly acquired books
- **Search bar**
- **Add Books** button
- **Filter/Sort** function button
- **View toggle**: Grid by card OR by table
- **Actions per book**: View, Edit, Remove
- When a new book is added → automatically displays on the official webpage as a new card modal

**Module: "Library Section Picture Management"**
- 1 summary modal card:
  - Total Pictures (value count)
- Below: List of library section pictures
- **Search bar**
- **Add Section** button
- **Filter/Sort** function button
- **View toggle**: Grid by card OR by table
- **Actions per picture**: View, Edit, Remove
- When a new section picture is added → automatically displays on the official webpage as a new card modal

**Module: "Tree View Management"**
- Full file management for the E-Books tree view
- Actions: **Add, Edit, Move, Delete** files in the tree view
- Changes reflect on the public website's E-Resources tree view

**Module: "E-Resources Management"**
- **Edit, Add, Remove** online access links and resources
- Changes reflect on the public website's E-Resources section

---

## File Change Summary

### Modified Files (10)
| File | Changes |
|---|---|
| [TopNavBar.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/TopNavBar.tsx) | Gradient nav, 4 nav items, About dropdown, transparent blending |
| [HeroSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/HeroSection.tsx) | University header, library image card, clock redesign, 7AM-7PM hours |
| [PersonnelSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/PersonnelSection.tsx) | Librarian's Corner blue modal card, "Campus Librarian" title |
| [AboutSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/AboutSection.tsx) | 3 separate navigable modules with exact content |
| [ServicesSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/ServicesSection.tsx) | Full Library Services.md content integration |
| [FeedbackSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/FeedbackSection.tsx) | Dropdown + classic carousel slideshow |
| [ExternalServicesSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/ExternalServicesSection.tsx) | Dropdown + classic carousel slideshow |
| [index.css](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/index.css) | All new styles (gradient, carousel 3D, tree view, floating bubbles, glassmorphism) |
| [App.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/App.tsx) | Reorganized sections, new component imports, E-Resources merge |
| [data.ts](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/assets/data.ts) | Updated links/URLs per exact specifications, new book data structures |

### New Files (12+)
| File | Purpose |
|---|---|
| `src/components/NewlyAcquiredBooks.tsx` | Blue Modal 3D Carousel for newly acquired books |
| `src/components/BlueModalCarousel.tsx` | Reusable 3D carousel component |
| `src/components/LibrarySectionCarousel.tsx` | Library section pictures with background change |
| `src/components/LibraryMapSection.tsx` | Google Maps satellite embed |
| `src/components/UOPACSection.tsx` | UOPAC QR code and registration link |
| `src/components/EResourcesPage.tsx` | Merged E-Resources with tree view |
| `src/components/TreeView.tsx` | Hierarchical file browser component |
| `src/components/FileViewerModal.tsx` | Read-only file viewer (PDF, Word, Excel) |
| `src/components/FeedbackStickyCard.tsx` | Sticky feedback card (middle-right) |
| `src/components/FacebookBubble.tsx` | Facebook floating bubble with iframe |
| `src/components/RizalAssistant.tsx` | RIZAL chatbot floating bubble with video |
| `server/index.ts` | Express backend server for admin API |
| `admin/` directory | Complete admin portal application |

### Deleted Files
| File | Reason |
|---|---|
| [FileServicesSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/FileServicesSection.tsx) | Merged into E-Resources |
| [OnlineAccessSection.tsx](file:///C:/Users/provu/Desktop/JRMSU%20LIBRARY%20LANDING%20PAGE/src/components/OnlineAccessSection.tsx) | Merged into E-Resources |

---

## Verification Plan

### Automated Tests
- `npm run lint` — TypeScript type checking for all new components
- `npm run build` — Verify production build succeeds with all changes

### Manual Verification
1. Run `npm run dev` and visually verify each section matches the specifications
2. Test the navigation gradient (white → blue), dropdown menus, and transparent blending
3. Verify the hero section displays all university text with correct colors and fonts
4. Test the Blue Modal 3D Carousel for Newly Acquired Books (arrows, animation, 3D depth)
5. Test the Library Section carousel auto-slideshow (5-second interval) and background change
6. Verify Google Maps embed is in **satellite mode** at coordinates **8.510036, 123.286343**
7. Test UOPAC QR code display and registration link
8. Test About dropdown navigation to all 3 modules with exact text content
9. Test Services accordion, Feedback carousel, External Services carousel
10. Test E-Resources tree view file browser and read-only viewer
11. Test floating bubbles (Facebook iframe, RIZAL video, Feedback sticky card)
12. Start admin server on separate port and test all CRUD operations
13. Verify that admin changes (new books, new sections) appear automatically on the public site
14. Test responsive design on mobile and tablet viewports
