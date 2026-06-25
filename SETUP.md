# JRMSU Library Landing Page — SETUP

## Prerequisites

| Tool       | Version    | Download |
|------------|------------|----------|
| Node.js    | >= 20      | https://nodejs.org |
| Python     | 3.14.3     | https://python.org |
| XAMPP      | Latest     | https://apachefriends.org (optional, for MySQL) |

---

## 1. Frontend (React + Vite)

Open **one** terminal at the **project root**:

```
cd C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE
```

### Install dependencies
```
npm install
```

### Run dev server (port 3000)
```
npm run dev
```

Frontend loads at: **http://localhost:3000**

### Build for production
```
npm run build
```
Output goes to `dist/`.

---

## 2. Backend — Django (SQLite — fast setup)

Open a **second** terminal at the **project root**, then:

```
cd Backend
```

### Activate virtual environment
```
venv\Scripts\activate
```
(You should see `(venv)` in the prompt.)

### Apply database migrations
```
python manage.py migrate
```

### Seed CMS data from asset files
```
python manage.py seed_assets
```

### Create an admin account (optional)
```
python manage.py createsuperuser
```

### Run backend server (port 8000)
```
python manage.py runserver 8000
```

Backend loads at: **http://localhost:8000**

---

## 3. Backend — XAMPP / MySQL (optional, replaces SQLite)

Skip this section if you are fine with SQLite.

### 3a. Start XAMPP

1. Open **XAMPP Control Panel** (as Administrator).
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.
4. Click **Admin** next to MySQL to open **phpMyAdmin**.

### 3b. Create the database

In phpMyAdmin:
1. Click **New** (left sidebar).
2. Database name: `jrmsu_library`
3. Collation: `utf8mb4_general_ci`
4. Click **Create**.

### 3c. Configure Django to use MySQL

Edit `Backend\core\settings.py`.

Find the `DATABASES` block (around line 40). Replace it with:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "jrmsu_library",
        "USER": "root",
        "PASSWORD": "",
        "HOST": "127.0.0.1",
        "PORT": "3306",
        "OPTIONS": {
            "sql_mode": "STRICT_TRANS_TABLES",
        },
    }
}
```

### 3d. Activate venv, migrate & run

```
cd Backend
venv\Scripts\activate
python manage.py migrate
python manage.py seed_assets
python manage.py runserver 8000
```

---

## 4. Run Both Together (one command)

From the **project root**:

```
npm run start
```

This runs `npm run dev` (frontend port 3000) and `npm run backend` (Django port 8000) concurrently in a single terminal.

---

## 5. Running Tests

### Backend API tests
```
cd Backend
venv\Scripts\activate
python test_api.py
```

### Frontend type-check
```
npm run lint
```

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `'python' is not recognized` | Install Python 3.14+ and check PATH |
| `'npm' is not recognized` | Install Node.js 20+ and check PATH |
| `'venv' is not recognized` | Run `python -m venv venv` inside `Backend/` |
| `ModuleNotFoundError: No module named '...'` | `pip install -r requirements.txt` or manually `pip install <module>` |
| `CORS error in browser` | Make sure Django is running on port 8000 |
| Images not loading in gallery | Django server must be running (`npm run backend`) |
| `django.db.utils.OperationalError` with MySQL | Start XAMPP MySQL first |
| Migration issues after switching to MySQL | Delete old `Backend\db.sqlite3`, re-run `migrate` |

---

## 7. Key URLs

| Page | URL |
|------|-----|
| Landing Page | http://localhost:3000 |
| Django Admin | http://localhost:8000/admin/ |
| Gallery API | http://localhost:8000/api/gallery |
| Books API | http://localhost:8000/api/books |
| Resources API | http://localhost:8000/api/resources |
| Auth Login | POST http://localhost:8000/api/auth/login |
| phpMyAdmin | http://localhost/phpmyadmin |

---

## 8. Project Layout (quick reference)

```
JRMSU LIBRARY LANDING PAGE/     ← root
├── src/                        ← React frontend
│   ├── Features/
│   ├── Pages/
│   ├── components/
│   └── main.tsx
├── Backend/                    ← Django backend
│   ├── core/                   ← settings, urls
│   ├── Features/               ← models, API, serializers
│   ├── manage.py
│   ├── test_api.py
│   └── venv/                   ← Python virtual env
├── assets/                     ← images, eBooks (served by Django)
├── package.json
├── vite.config.ts
└── SETUP.md                    ← this file
```
