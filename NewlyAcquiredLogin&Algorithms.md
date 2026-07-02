# Detailed System Design Prompt

## Newly Acquired Books Module (Hybrid Batch-Based Approach)

---

# 1. Business Problem

The library acquires books annually, but the arrival of books is unpredictable. New books may arrive:

* once a year,
* multiple times a year,
* months apart,
* or after a long period without any new acquisitions.

Because of this, the system should not rely on a fixed display period such as 7 days, 90 days, or 180 days.

Instead, the system should display newly acquired books based on **book acquisition events (batches)** rather than the number of days that have passed.

---

# 2. Core Business Rule

### Main Rule

A batch of newly acquired books remains displayed indefinitely until a newer batch is created.

The display of newly acquired books is event-driven, not time-driven.

---

# 3. Batch Concept

A Batch represents one acquisition event.

Examples:

### Batch A

June 29, 2026

* 50 books arrived.

### Batch B

December 30, 2026

* 10 books arrived.

Even if Batch B only contains 10 books, Batch B replaces Batch A in the Newly Acquired Books display.

---

# 4. Batch Lifecycle

## Open Batch

When librarians start entering newly arrived books, they create a new batch.

The batch remains open while:

* books are still being encoded,
* librarians are still receiving books from the same delivery.

---

## Continue Existing Batch

If the librarian stops working and continues tomorrow:

* continue using the same batch;
* do not create another batch.

Example:

Day 1:

20 books entered.

Day 2:

30 more books entered.

Result:

50 books in one batch.

---

## Close Batch

The batch is closed when:

* all books from that delivery have been entered;
* librarian confirms cataloging is complete.

---

# 5. Active Batch Rule

Only one batch can be marked as:

### Current Display Batch

This batch supplies all books shown in the:

* Newly Acquired Books page
* Home page carousel
* Dashboard widgets
* Public catalog highlights

---

# 6. Replacement Rule

When a new batch is created:

1. Previous display batch becomes archived.
2. New batch becomes active.
3. Newly Acquired UI automatically refreshes.

No manual deletion is required.

---

# Example

### Batch A

50 books.

Displayed.

Six months pass.

No new books.

Still displayed.

---

### Batch B

10 books arrive.

Displayed.

Batch A automatically disappears from the Newly Acquired page.

---

# 7. Why No Fixed Expiry?

The library cannot predict:

* when books will arrive,
* how many books will arrive,
* whether there will be long periods without acquisitions.

Because of this:

### Fixed expiry causes problems.

Example:

Batch A:

200 books.

180-day expiry.

No new books arrive.

Result:

Newly Acquired page becomes empty.

This is undesirable because the latest acquisitions should still be visible.

---

# Better Rule

Display the latest acquisition batch regardless of age.

---

# 8. Optional Safety Expiry

A safety expiry should exist only for system protection.

Purpose:

* forgotten open batches;
* duplicate active batches;
* abandoned encoding sessions;
* data errors.

The safety expiry should never determine what books appear on the UI.

It should only help administrators detect problems.

---

# 9. Recommended Database Structure

## Books Table

Stores:

* title
* author
* accession number
* category
* acquisition batch reference
* date encoded

---

## Acquisition Batch Table

Stores:

* batch name
* batch description
* opened date
* closed date
* active status
* archive status
* display status
* safety expiry
* batch creator
* remarks

---

## Batch History Table

Stores:

* who opened batch
* who closed batch
* when books were added
* status changes
* audit logs

---

# 10. Backend Responsibilities

## Create Batch

Creates a new acquisition event.

---

## Add Book To Batch

Adds books into an existing batch.

---

## Continue Batch

Allows librarians to continue entering books tomorrow without creating another batch.

---

## Close Batch

Marks cataloging as complete.

---

## Archive Previous Batch

Automatically archives the previously displayed batch.

---

## Activate New Batch

Makes the newest batch the current display batch.

---

## Get Current Display Batch

Returns only the latest active batch.

---

## Get Batch History

Allows librarians to view previous acquisitions.

---

## Reopen Batch

Allows administrators to reopen an unfinished batch.

---

## Extend Safety Expiry

Allows administrators to extend the protection period if necessary.

---

# 11. Frontend Display Requirements

---

# Admin Dashboard

### Batch Card

Display:

* Batch Name
* Number of Books
* Date Started
* Status
* Active/Archived Badge

Actions:

* Continue Batch
* Close Batch
* View Books
* Archive
* Reopen

---

# Newly Acquired Books Page

Display only:

### Current Active Batch

Show:

* Book Cover
* Title
* Author
* Date Acquired
* Accession Number
* Category

---

# Public Homepage

Display:

### Latest Acquisition Collection

Examples:

"Newly Acquired Books – Batch June 2026"

---

# Empty State

If there are no acquisitions yet:

Display:

"No newly acquired books available."

---

# Batch History Page

Display:

* Batch Name
* Number of Books
* Open Date
* Close Date
* Status
* Librarian

Searchable by:

* Year
* Month
* Batch Name

---

# 12. Recommended Workflow

```text
Books Arrive
      ↓
Create New Batch
      ↓
Encode Books
      ↓
Need More Encoding Tomorrow?
      ↓
Yes ───── Continue Same Batch
No
      ↓
Close Batch
      ↓
Display Batch Publicly
      ↓
Wait For Next Acquisition
      ↓
New Books Arrive
      ↓
Archive Old Batch
      ↓
Create New Batch
      ↓
Display New Batch
```

---

# Recommended Final Architecture

### Hybrid Event-Based Batch System

Features:

✔ Batch Open/Close
✔ Continue Batch Across Multiple Days
✔ Auto Replace Previous Batch
✔ No Fixed Expiry for Display
✔ Long Safety Expiry for Protection Only
✔ One Active Display Batch Only
✔ Complete Batch History
✔ Supports Unpredictable Annual Book Arrivals
✔ Works even if no books arrive for several years.

This approach is the most suitable architecture for a **library management system with unpredictable yearly acquisitions and large batches of books**.
