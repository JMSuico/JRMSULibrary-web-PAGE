# Research & Thesis References Module - Implementation Approach

## 1. Goal Description
The goal is to create a new "Research & Thesis References" module that tracks detailed book records per department. 
The module will be accessible via:
1. **Public Webpage**: A new item in the "Collection" dropdown navigation leading to a searchable resource list.
2. **Admin Panel**: A new tab inside the `ContentManager` (next to "Excellence in Information") to allow admins to add, edit, and delete reference records.

The required fields are: `Departments`, `NO.`, `ACC. NO.`, `CALL NUMBER`, `TITLE`, `AUTHOR`, `COPYRIGHT`, `REMARKS`, `Resource Status`.

---

## 2. Best Approach & Architecture

Because this catalog can contain thousands of records, we need a robust approach that includes **database-level pagination and search**.

### Backend (Django)
- **Model (`research_reference_model.py`)**: 
  Create a dedicated model with fields mapped to your requirements. `Departments` can be a string choice or a foreign key if you want to manage departments dynamically.
- **API (`reference_controller.py`)**: 
  Implement a ViewSet with built-in search (by Title, Author, Call Number) and pagination (e.g., 50 items per page).

### Frontend Admin Panel (`ContentManager.tsx`)
- **New Tab**: Add a `Research References` tab next to `Excellence in Information`.
- **Data Table**: Create a data table that fetches data from the backend. Instead of a simple map, we will include a search bar and pagination controls so the browser doesn't freeze when loading thousands of books.
- **Modals**: Add an `Add/Edit Reference` floating modal with a form containing all the required fields.

### Frontend Public Page (`ResearchReferencesPage.tsx`)
- **Navigation (`TopNavBar.tsx`)**: Add a dropdown link under "Collection" called "Research & Thesis References".
- **Public View**: Create a beautiful, read-only table interface where students can search for books by Title, Author, or Department.

---

## 3. Proposed Changes

### Backend Components

#### [NEW] `backend/Features/Data/Models/research_reference_model.py`
Creates the `ResearchReference` model with fields for `department`, `acc_no`, `call_number`, `title`, `author`, `copyright`, `remarks`, and `resource_status`.

#### [NEW] `backend/Features/Api/Serializers/reference_serializer.py`
Creates the serializer to convert the model to JSON.

#### [NEW] `backend/Features/Repositories/Implementations/reference_repository.py`
Handles database queries, filtering by department, and searching.

#### [NEW] `backend/Features/Services/Implementations/reference_service.py`
Handles business logic.

#### [NEW] `backend/Features/Api/Controllers/reference_controller.py`
Exposes `/api/research-references/` for GET (public) and POST/PATCH/DELETE (admin).

#### [MODIFY] `backend/Features/Api/Routes/api_router.py`
Registers the new `research-references` endpoint.

---

### Frontend Components

#### [NEW] `frontend/src/Endpoints/referenceApi.ts`
Creates the API client functions to fetch, create, update, and delete reference items.

#### [MODIFY] `frontend/src/Features/Admin/components/ContentManager.tsx`
- Adds the `research-references` state to the `activeTab` tabs.
- Adds the `Research References` tab button next to `Excellence in Information`.
- Renders the reference table with an "Add Record" button.
- Adds the Add/Edit Reference floating modal.

#### [MODIFY] `frontend/src/Components/LayoutBars/TopNavBar.tsx`
Adds the "Research & Thesis References" link to the dropdown under the "Collection" menu item.

#### [NEW] `frontend/src/Pages/Collection/ResearchReferencesPage.tsx`
Creates the public-facing page where users can view and search the reference catalog.

#### [MODIFY] `frontend/src/App.tsx`
Registers the `/collection/research-references` route.

---

> [!IMPORTANT]
> **Open Question for You:**
> Do you want the "Departments" column to be a simple text input where you can type anything, or should it be a strict dropdown list of predefined departments (e.g., CBA, CCS, CED)? If predefined, I can hardcode the options or create a separate manager for them.
> 
> Also, since catalogs are usually large, would you eventually want a "Bulk Upload via Excel/CSV" feature, or is manual one-by-one entry sufficient for now?

---

## 4. Verification Plan
- Run `python manage.py makemigrations` and `python manage.py migrate` inside the docker container.
- Verify the Admin Panel correctly displays the new tab and allows adding records.
- Verify the public webpage correctly displays the searchable table.
- Verify the Navigation bar correctly links to the new page.
