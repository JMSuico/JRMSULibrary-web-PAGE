# JRMSU Library System API Endpoint Documentation

This document contains a comprehensive mapping of all API endpoints across the **Frontend**, **Backend**, and their related **Database Models**, with explicit mappings to the **Webpage (Public UI)** and **Admin Page** where they are consumed.

---

## 1. System Health & Auth Endpoints
### Backend Models
- **Auth User Models**: Custom Django User (mapped to Admin access).
- **Settings**: `SiteSettings` (Controls system maintenance state, etc.)

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Health Check** | `GET` | `/api/health/` | Check backend server status. | `coreApi.checkHealth()` | System-wide / AdminLayout |
| **CSRF Token** | `GET` | `/api/csrf/` | Retrieve CSRF cookie for security. | Axios Interceptor | Global (All Pages) |
| **Login** | `POST` | `/api/users/login/` | Authenticate an admin user. | `userApi.login()` | Admin Page: `LoginPage.tsx` |
| **Logout** | `POST` | `/api/users/logout/` | End the admin session. | `userApi.logout()` | Admin Page: `AdminLayout.tsx` |
| **Check Session** | `GET` | `/api/users/me/` | Verify current user auth state. | `userApi.checkAuth()` | Admin Page: `AdminLayout.tsx`, `UserManagement.tsx` |
| **Users** | `GET` | `/api/users/` | List all admin users. | `userApi.getUsers()` | Admin Page: `UserManagement.tsx` |
| **Users** | `POST` | `/api/users/` | Create a new admin user. | `userApi.createUser()` | Admin Page: `UserManagement.tsx` |
| **Users** | `PATCH` | `/api/users/{id}/` | Update user details/status. | `userApi.updateUser()` | Admin Page: `UserManagement.tsx` |
| **Users** | `DELETE`| `/api/users/{id}/` | Delete an admin user. | `userApi.deleteUser()` | Admin Page: `UserManagement.tsx` |
| **Reset Password** | `POST` | `/api/users/reset_password_with_code/` | Reset password via email code. | `userApi.resetPassword()` | Admin Page: `ForgotPasswordModal.tsx` |

---

## 2. Content Management System (CMS) Endpoints
### Backend Models
- `PageContent`: Stores HTML/Text content for About, Guidelines, etc.
- `PageImage`: Stores generic images used across pages.
- `LibraryInteriorImage`: Stores images for the main gallery.
- `ManagedLink`: Stores external URLs (e.g., Quick Links).
- `ManagedFile`: Stores downloadable generic files.

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Page Content** | `GET` | `/api/content/` | List all text content blocks. | `cmsApi.getAllContent()` | Webpage: `HomePage`, `AboutPage`<br/>Admin: `ContentManager` |
| **Page Content** | `PATCH` | `/api/content/{id}/` | Update a specific text block. | `cmsApi.updateContent(id, data)` | Admin Page: `ContentManager` |
| **Page Images** | `GET` | `/api/page-images/` | List all dynamic page images. | `cmsApi.getAllImages()` | Webpage: `HomePage`, `AboutPage`<br/>Admin: `ContentManager` |
| **Page Images** | `PATCH` | `/api/page-images/{id}/` | Update a specific image file. | `cmsApi.updateImage(id, file)` | Admin Page: `ContentManager` |
| **Gallery** | `GET` | `/api/gallery/` | List all library interior photos. | `cmsApi.getGalleryImages()` | Webpage: `HomePage`<br/>Admin: `SectionsManager` |
| **Gallery** | `POST` | `/api/gallery/` | Upload a new gallery photo. | `cmsApi.uploadGalleryImage(file)` | Admin Page: `SectionsManager` |
| **Gallery** | `DELETE`| `/api/gallery/{id}/` | Delete a gallery photo. | `cmsApi.deleteGalleryImage(id)` | Admin Page: `SectionsManager` |
| **Links** | `GET` | `/api/links/` | List all managed links. | `cmsApi.getAllLinks()` | Webpage: `HomePage`, `Footer`<br/>Admin: `ContentManager` |
| **Links** | `PATCH` | `/api/links/{id}/` | Update a managed link URL. | `cmsApi.updateLink(id, data)` | Admin Page: `ContentManager` |
| **Files** | `GET` | `/api/managed-files/` | List all downloadable files. | `cmsApi.getAllFiles()` | Webpage: `HomePage`<br/>Admin: `ContentManager` |
| **Files** | `POST` | `/api/managed-files/` | Upload a new downloadable file (auto-replaces singletons). | `cmsApi.createFile(data)` | Admin Page: `ContentManager` |
| **Files** | `PATCH` | `/api/managed-files/{id}/` | Update a downloadable file. | `cmsApi.updateFile(id, file)` | Admin Page: `ContentManager` |
| **Files** | `DELETE`| `/api/managed-files/{id}/` | Delete a downloadable file. | `cmsApi.deleteFile(id)` | Admin Page: `ContentManager` |

---

## 3. E-Resources Endpoints
### Backend Models
- `EResourceDepartment`: Folders/categories for e-resources.
- `EResourceFile`: Actual files (PDFs, docs) inside those departments.

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Departments** | `GET` | `/api/eresource-departments/` | List all departments/folders. | `eResourceApi.getDepartments()` | Webpage: `CollectionPage`<br/>Admin: `EResourcesManager` |
| **Departments** | `POST` | `/api/eresource-departments/` | Create a new department. | `eResourceApi.createDepartment()` | Admin Page: `EResourcesManager` |
| **Departments** | `PATCH` | `/api/eresource-departments/{id}/` | Rename a department. | `eResourceApi.updateDepartment()` | Admin Page: `EResourcesManager` |
| **Departments** | `DELETE`| `/api/eresource-departments/{id}/` | Delete a department. | `eResourceApi.deleteDepartment()` | Admin Page: `EResourcesManager` |
| **Files** | `GET` | `/api/eresource-files/` | List all uploaded resources. | `eResourceApi.getFiles(deptId)` | Webpage: `CollectionPage`<br/>Admin: `EResourcesManager` |
| **Files** | `POST` | `/api/eresource-files/` | Upload a new file. | `eResourceApi.uploadFile()` | Admin Page: `EResourcesManager` |
| **Files** | `DELETE`| `/api/eresource-files/{id}/` | Move a file to the recycle bin. | `eResourceApi.deleteFile(id)` | Admin Page: `EResourcesManager` |

---

## 4. Book Acquisitions Endpoints (New Arrivals)
### Backend Models
- `AcquisitionBatch`: Represents a shipment or batch of new books.
- `NewlyAcquiredBook`: Individual book belonging to a batch.
- `BatchHistory`: Tracks edits/publishes for auditing.

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Batches** | `GET` | `/api/batches/` | List all batches. | `batchApi.getBatches()` | Webpage: `HomePage`<br/>Admin: `BooksManager`, `BatchHistory` |
| **Batches** | `POST` | `/api/batches/` | Create a new book batch. | `batchApi.createBatch(data)` | Admin Page: `BooksManager` |
| **Batches** | `GET` | `/api/batches/{id}/` | Get batch details (including books). | `batchApi.getBatch(id)` | Admin Page: `BooksManager` |
| **Batches** | `PUT` | `/api/batches/{id}/` | Update batch details. | `batchApi.updateBatch(id, data)`| Admin Page: `BooksManager`, `BatchHistory` |
| **Batches** | `DELETE`| `/api/batches/{id}/` | Delete an entire batch. | `batchApi.deleteBatch(id)` | Admin Page: `BooksManager`, `BatchHistory` |
| **Batches** | `POST` | `/api/batches/{id}/publish/` | Mark batch as published. | `batchApi.publishBatch(id)` | Admin Page: `BooksManager` |
| **Batches** | `POST` | `/api/batches/{id}/unpublish/` | Revert batch to draft status. | `batchApi.unpublishBatch(id)` | Admin Page: `BooksManager` |
| **Books** | `POST` | `/api/batches/{id}/books/` | Add a book to a batch. | `batchApi.addBookToBatch()` | Admin Page: `BooksManager` |
| **Books** | `PATCH` | `/api/batches/{id}/books/{book_id}/` | Update book details. | `batchApi.updateBook()` | Admin Page: `BooksManager` |
| **Books** | `DELETE`| `/api/batches/{id}/books/{book_id}/` | Delete a specific book. | `batchApi.removeBookFromBatch()`| Admin Page: `BooksManager` |

---

## 5. Contact, Feedback & Reservation Endpoints
### Backend Models
- `ContactMessage`: Stores contact forms, reservation requests, and credential requests.
- `ContactAttachment`: Stores file uploads linked to a contact message.
- `Feedback`: Stores library service feedback entries.

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Inbox** | `GET` | `/api/contact/` | List all messages & reservations. | `contactApi.getMessages(filters)` | Admin Page: `EmailMessage` |
| **Inbox** | `POST` | `/api/contact/` | Submit a new message. | `contactApi.sendMessage(data)` | Webpage: `ServicesPage`, `HomePage` |
| **Inbox (Reply)** | `POST` | `/api/contact/{id}/reply/` | Reply to a specific message. | `contactApi.replyToMessage()` | Admin Page: `EmailMessage` |
| **Inbox (Bulk)** | `POST` | `/api/contact/bulk-reply/` | Reply to multiple selected users. | `contactApi.bulkReply(ids, msg)` | Admin Page: `EmailMessage` |
| **Inbox (Status)**| `PATCH` | `/api/contact/{id}/` | Update status (Read, Archived). | `contactApi.updateStatus()` | Admin Page: `EmailMessage` |
| **Feedback** | `GET` | `/api/feedback/` | List all user feedback. | `feedbackApi.getFeedback()` | Admin Page: `EmailMessage`, `Analytics` |
| **Feedback** | `POST` | `/api/feedback/` | Submit new feedback (Public). | `feedbackApi.submitFeedback(data)`| Webpage: `ServicesPage`, `HomePage` |
| **Feedback** | `PATCH` | `/api/feedback/{id}/` | Update feedback status. | `feedbackApi.updateFeedbackStatus()`| Admin Page: `EmailMessage` |

---

## 6. Personnel Endpoints
### Backend Models
- `Personnel`: Library staff details (Name, Title, Order, Photo).

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Personnel** | `GET` | `/api/personnel/` | List all library staff members. | `personnelApi.getPersonnel()` | Webpage: `PersonnelPage`<br/>Admin: `PersonnelSection` |
| **Personnel** | `POST` | `/api/personnel/` | Add a new staff member. | `personnelApi.addPersonnel(data)` | Admin Page: `PersonnelSection` |
| **Personnel** | `PATCH` | `/api/personnel/{id}/` | Update a staff member. | `personnelApi.updatePersonnel()` | Admin Page: `PersonnelSection` |
| **Personnel** | `DELETE`| `/api/personnel/{id}/` | Delete a staff member. | `personnelApi.deletePersonnel(id)`| Admin Page: `PersonnelSection` |

---

## 7. AI Assistant Endpoints
### Backend Models
- None (Runs completely in-memory against local Ollama container).

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Chat** | `POST` | `/api/ai/chat/` | Send a message to Dr. Jose Rizal. | `aiApi.sendMessage(message)` | Webpage: `DrJoseRizalAI` Widget |

---

## 8. Analytics & Reporting Endpoints
### Backend Models
- `SiteVisit`: Logs daily unique user visits and page views.
- `GeneratedReport`: Tracks PDF/Excel reports generated by admins.

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Visits** | `GET` | `/api/analytics/count/` | Get total site visitor count. | `analyticsApi.getVisitCount()` | Webpage: `HomePage` |
| **Visits** | `POST` | `/api/analytics/track/` | Track a new site visit. | `analyticsApi.trackVisit()` | Webpage: `App.tsx` (Global) |
| **Visits** | `GET` | `/api/site-visits/` | Get detailed daily visit statistics. | `analyticsApi.getSiteVisits()` | Admin Page: `Analytics`, `Dashboard` |
| **Reports** | `GET` | `/api/reports/` | List all generated reports. | `reportApi.getReports()` | Admin Page: `Reports` |
| **Reports** | `POST` | `/api/reports/` | Generate a new system report. | `reportApi.generateReport(type)` | Admin Page: `Reports` |
| **Reports** | `GET` | `/api/reports/{id}/` | Download a specific report file. | `reportApi.downloadReport(id)` | Admin Page: `Reports` |

---

## 9. Recycle Bin Endpoints
### Backend Models
- `RecycleBinItem`: Stores a serialized copy of deleted objects (Books, Resources) for 30 days before permanent deletion.

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Recycle Bin** | `GET` | `/api/recycle-bin/` | List all deleted items. | `recycleBinApi.getItems()` | Admin Page: `RecycleBinPage` |
| **Recycle Bin** | `POST` | `/api/recycle-bin/{id}/restore/` | Restore a deleted item. | `recycleBinApi.restoreItem(id)` | Admin Page: `RecycleBinPage` |
| **Recycle Bin** | `DELETE`| `/api/recycle-bin/{id}/` | Permanently delete an item. | `recycleBinApi.permanentlyDeleteItem()`| Admin Page: `RecycleBinPage` |

---

## 10. External API Proxies
### Backend Models
- None (Proxies external authentication directly).

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **VitalSource** | `GET` | `/api/external-proxy/vitalsource/` | Authenticates user against VitalSource. | Linked directly. | Webpage: Top Navigation |
| **Scholaar** | `GET` | `/api/external-proxy/scholaar/` | Authenticates user against Scholaar. | Linked directly. | Webpage: Top Navigation |

---

## 11. Research References Endpoints
### Backend Models
- `ResearchReference`: Stores all bibliographic data and optionally attached files.

| Feature | Method | Endpoint Path | Description | Frontend Client Mapping | Used In (Webpage / Admin Page) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **References** | `GET` | `/api/research-references/` | List all research references (supports pagination/search). | `referenceApi.getReferences()` | Webpage: `CollectionPage`<br/>Admin: `ResearchReferencesManager` |
| **References** | `GET` | `/api/research-references/{id}/` | Get details of a single reference. | `referenceApi.getReference(id)` | Admin Page: `ResearchReferencesManager` |
| **References** | `POST` | `/api/research-references/` | Add a new research reference. | `referenceApi.createReference(data)` | Admin Page: `ResearchReferencesManager` |
| **References** | `PATCH` | `/api/research-references/{id}/` | Update a research reference. | `referenceApi.updateReference(id, data)` | Admin Page: `ResearchReferencesManager` |
| **References** | `DELETE`| `/api/research-references/{id}/` | Delete a research reference. | `referenceApi.deleteReference(id)` | Admin Page: `ResearchReferencesManager` |
| **References** | `POST` | `/api/research-references/bulk-delete/`| Delete multiple references. | `referenceApi.bulkDelete(ids)` | Admin Page: `ResearchReferencesManager` |
| **References** | `DELETE`| `/api/research-references/{id}/remove-file/`| Remove the attached file from a reference. | `referenceApi.removeFile(id)` | Admin Page: `ResearchReferencesManager` |
| **References** | `GET` | `/api/research-references/{id}/preview/`| Preview the attached file (PDF/Docx). | `referenceApi.previewFile(id)` | Webpage: `CollectionPage` |
| **References** | `POST` | `/api/research-references/bulk-import/`| Bulk insert multiple records (Legacy). | `referenceApi.bulkImport(data)` | Admin Page: `ResearchReferencesManager` |
| **References** | `POST` | `/api/research-references/sync-preview/`| Compare JSON array with DB to generate a sync diff. | `referenceApi.syncPreview(data)` | Admin Page: `ResearchReferencesManager` |
| **References** | `POST` | `/api/research-references/sync-commit/`| Dispatch sync diff to Celery queue (Returns 202). | `referenceApi.syncCommit(payload)` | Admin Page: `ResearchReferencesManager` |

---

> **Note on Permissions**: All endpoints except for `/api/health/`, `/api/csrf/`, `/api/users/login/`, `/api/analytics/count/`, `/api/analytics/track/`, and the public `GET` methods for content, batches, and eresources require a valid Admin session cookie (`sessionid`) to execute successfully. Any `POST`, `PUT`, `PATCH`, or `DELETE` requests will strictly return a `403 Forbidden` if unauthorized.

