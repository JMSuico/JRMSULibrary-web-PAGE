# JRMSU Library Admin System - Formulas and Logic Algorithms

This document outlines the underlying logic, variables, and formulas used across the dashboard, analytics, and reports generator modules in the system.

## 1. Dashboard & Analytics Modules

**Location/Codebase:**
- Backend: `report_controller.py`, `report_service.py`, `book_repository.py`
- Frontend: `DashboardPage.tsx`, `AnalyticsPage.tsx`, `reportApi.ts`

### 1.1 Total Books Logic
- **Formula:** Count of all `BatchBook` entries that belong to a batch where `is_display_batch = True`.
- **Variables:** `total_books`
- **Algorithm:** 
  1. Query `AcquisitionBatch.objects.filter(is_display_batch=True)`.
  2. Aggregate the count of related `BatchBook` instances.

### 1.2 Site Visits Tracking
- **Formula:** Incremental counter tracked per unique session or IP address over time.
- **Variables:** `total_visits`, `visits_this_month`
- **Algorithm:**
  1. A middleware or API endpoint (`SiteVisitViewSet`) records a `SiteVisit` entry on the first load of the homepage.
  2. `total_visits = count(SiteVisit.objects.all())`
  3. `visits_this_month = count(SiteVisit.objects.filter(timestamp__month=current_month))`

### 1.3 Rating Averages
- **Formula:** Weighted Average of all submitted 1 to 5 star ratings.
- **Algorithm:** 
  1. Retrieve `SiteRating` object counts.
  2. `Total Score = (count_1 * 1) + (count_2 * 2) + (count_3 * 3) + (count_4 * 4) + (count_5 * 5)`
  3. `Average Rating = Total Score / (count_1 + count_2 + count_3 + count_4 + count_5)`
- **Variables:** `average_rating`, `count_1` to `count_5`

### 1.4 System Status Calculation
- **Formula:** Conditional check of critical backend services.
- **Algorithm:** 
  1. Database ping successful = "Operational"
  2. If exception = "Degraded" or "Offline"

---

## 2. Reports Generator Module

**Location/Codebase:**
- Frontend: `ReportsPage.tsx`
- Dependencies: `recharts` (for visual graphs), browser `window.print()` for PDF generation, `Blob` API for CSV generation.

### 2.1 Export to CSV
- **Algorithm:**
  1. Map `ReportSummary` JSON objects into a 2D array (`string[][]`).
  2. Join columns with `,` and wrap values in `"` to escape commas.
  3. Join rows with `\n`.
  4. Create a Blob object `new Blob([csvContent], { type: 'text/csv' })`.
  5. Generate a download URL and trigger a virtual `<a href... download>` click.

### 2.2 Visual Charts (PDF Export)
- **Algorithm:**
  1. Translate the `ratings_summary` object into a flat array structure for `BarChart`.
  2. Map `total_emails` and `total_reservations` into an array for `PieChart`.
  3. Render via `recharts` inside a `print-area` div.
  4. Use standard browser printing to save the DOM as an official PDF report.

---

## 3. Email & Reservations Module (Batching Logic)

**Location/Codebase:**
- Frontend: `EmailMessagePage.tsx`

### 3.1 Contact Message Batching
- **Algorithm:**
  1. Fetch all `ContactMessage` array from the API.
  2. Iterate and group objects into a Dictionary (Hash Map) using `email` as the primary key.
  3. Maintain a `totalCount` and `unreadCount` inside the accumulator.
  4. Render the hash map values in an expandable UI component.
- **Code snippet:**
  ```javascript
  const groupedMessages = filtered.reduce((acc, msg) => {
    const key = msg.email;
    if (!acc[key]) acc[key] = { name: msg.name, email: msg.email, messages: [], unreadCount: 0, totalCount: 0 };
    acc[key].messages.push(msg);
    acc[key].totalCount += 1;
    if (msg.status === 'UNREAD') acc[key].unreadCount += 1;
    return acc;
  }, {});
  ```
