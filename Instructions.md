# JRMSU Library — Docker Terminal Instructions

## CRITICAL RULE: Two Different Shells

There are TWO separate places you type commands. Getting confused between them
is the most common mistake.

```
YOUR WINDOWS POWERSHELL (Host Machine)
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE>
  |
  |--- docker-compose exec backend bash   <-- this ENTERS the container
  |
  v
LINUX SHELL (Inside the Backend Container)
root@b1765c3a371a:/app#
  |
  |--- python manage.py migrate           <-- run Django commands HERE (no docker-compose!)
  |--- python manage.py shell
  |--- exit                               <-- type this to go back to Windows
```

RULE: docker-compose commands are ONLY run in your WINDOWS PowerShell.
      Python/Django commands are ONLY run inside the container bash.
      NEVER mix them.

---

## How to Run Django Commands (Two Ways)

### WAY 1 — One-shot (Recommended: No need to enter the container)

Run these directly from your Windows PowerShell terminal:

```powershell
# Apply database migrations
docker-compose exec backend python manage.py migrate

# Open Django Python shell
docker-compose exec backend python manage.py shell

# Show migration status
docker-compose exec backend python manage.py showmigrations

# Create a superuser
docker-compose exec backend python manage.py createsuperuser

# Seed assets
docker-compose exec backend python manage.py seed_assets
```

You stay in Windows PowerShell the whole time. Each command runs and finishes.

### WAY 2 — Interactive (Enter the container, then run freely)

Step 1: From your Windows PowerShell, enter the container:

```powershell
docker-compose exec backend bash
```

Step 2: You are now INSIDE the container (Linux). You will see:
root@b1765c3a371a:/app#

Step 3: Now type Django commands WITHOUT "docker-compose exec backend":

```bash
python manage.py migrate
python manage.py shell
python manage.py showmigrations
python manage.py createsuperuser
```

Step 4: When done, type "exit" to return to your Windows terminal:

```bash
exit
```

---

## Access PostgreSQL Database from Terminal

### From Windows PowerShell (one-shot):

```powershell
docker-compose exec db psql -U jrmsu_admin -d jrmsu_library
```

### Once inside psql (you will see: jrmsu_library=#):

```sql
-- List all database tables
\dt

-- Count books in database
SELECT COUNT(*) FROM "Features_book";

-- See all user accounts
SELECT username, email, role FROM "Features_account";

-- See recently uploaded files
SELECT title, file FROM "Features_managedfile" ORDER BY id DESC LIMIT 10;

-- Exit psql and return to Windows
\q
```

---

## How to See Backend Logs (Like the Django Dev Server)

In Docker mode, the backend does NOT show logs like:
  "Starting development server at http://127.0.0.1:8000/"

Instead, it runs with Gunicorn (production server). To watch live logs:

```powershell
# Watch backend logs live (press Ctrl+C to stop watching)
docker-compose logs -f backend

# Watch database logs
docker-compose logs -f db

# Watch all containers at once
docker-compose logs -f

# See last 50 lines of backend logs
docker-compose logs --tail=50 backend
```

---

## How to Get the Same Hot-Reload Experience as Django Dev Server

Docker mode uses Gunicorn (production). It does NOT hot-reload.

If you want the live reloading Django dev server experience, you have two choices:

### Option A — Run Backend Locally (Outside Docker)

Stop only the backend container and run Django locally instead:

```powershell
# Stop the backend container only
docker-compose stop backend

# Start local Django dev server (SSMS must be running)
cd backend
venv\Scripts\activate
python manage.py runserver 8000
```

Now you get:
  "Django version 4.2.30, using settings 'core.settings'"
  "Starting development server at http://127.0.0.1:8000/"
  "Watching for file changes with StatReloader"

### Option B — Restart the Docker Backend After Changes

After you change Python files and want Docker to pick them up:

```powershell
# Restart just the backend container (fast, no full rebuild)
docker-compose restart backend

# Or rebuild just the backend image (slower, but picks up requirements changes)
docker-compose build --no-cache backend
docker-compose up -d
```

---

## Quick Reference — Common Mistakes

| Mistake                                   | Fix                                                    |
|-------------------------------------------|--------------------------------------------------------|
| Typed `docker-compose exec` INSIDE bash   | Type `exit` first, then run the command in PowerShell  |
| `bash: docker-compose: command not found` | You are inside the container — type `exit` to leave    |
| Changes to Python files not showing       | Run `docker-compose restart backend`                   |
| Want live hot-reload                      | Run Django locally with `python manage.py runserver`   |
| Backend crashes on start                  | Check logs: `docker-compose logs backend`              |
| Database not found error                  | Run `docker-compose exec backend python manage.py migrate` |

---

## Container Status Commands

```powershell
# Check if all containers are running
docker-compose ps

# Check container resource usage
docker stats

# Stop all containers
docker-compose down

# Start all containers (already built)
docker-compose up -d

# Full rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```


---

## Command Frequency Guide (Most Used to Least Used)

Use this as a quick-reference card. Commands at the top you will type almost every day.
Commands at the bottom you may only need once or rarely.

---

### MOST USED — Daily Commands

These are the commands you will use every single time you work on the project.

```powershell
# START all 4 layers (run this every time you open your laptop to work)
docker-compose up -d

# STOP all containers (run this when you are done for the day)
docker-compose down

# CHECK if all containers are healthy and running
docker-compose ps

# WATCH live backend logs (to see API requests and errors in real time)
docker-compose logs -f backend
```

---

### OFTEN USED — After Code Changes

These commands are used whenever you edit Python files or add new features.

```powershell
# After editing any Python file — restart the backend to apply changes
docker-compose restart backend

# After adding a new Django model or changing an existing model
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# After changing requirements-docker.txt (adding a new pip package)
docker-compose build --no-cache backend
docker-compose up -d
```

---

### SOMETIMES USED — Debugging and Inspection

Use these when something goes wrong or you want to inspect data.

```powershell
# See the last 50 lines of backend logs to find errors
docker-compose logs --tail=50 backend

# See logs for all containers at once
docker-compose logs -f

# Enter the backend container to run multiple commands freely
docker-compose exec backend bash

# Open the Django Python shell (test queries and models interactively)
docker-compose exec backend python manage.py shell

# Check which migrations have already been applied
docker-compose exec backend python manage.py showmigrations

# Access the PostgreSQL database via terminal
docker-compose exec db psql -U jrmsu_admin -d jrmsu_library

# See all running container resource usage (CPU, RAM)
docker stats
```

---

### LESS USED — Setup and First-Time Commands

These are mostly run once when first setting up the project or after a major reset.

```powershell
# First-time only: apply all database migrations to a fresh database
docker-compose exec backend python manage.py migrate

# First-time only: create the default admin account
docker-compose exec backend python manage.py createsuperuser

# First-time only: seed eBooks and asset data into the database
docker-compose exec backend python manage.py seed_assets

# Collect static files manually (usually done automatically in Dockerfile)
docker-compose exec backend python manage.py collectstatic --noinput
```

---

### RARELY USED — Full Rebuild and Reset

Only use these when something is seriously broken or you need a completely fresh start.

```powershell
# Full rebuild of all images from scratch (ignores cache — takes 5-10 minutes)
docker-compose build --no-cache

# Full rebuild and start in one command
docker-compose build --no-cache
docker-compose up -d

# Stop and REMOVE all containers, networks, and volumes (WARNING: deletes database data!)
docker-compose down -v

# Nuclear option: remove ALL Docker images and start completely fresh
docker system prune -a
```

> WARNING: `docker-compose down -v` deletes your PostgreSQL database data permanently.
> Only use this if you want to reset everything to a completely blank state.
> After running it, you must re-run migrations and create a new superuser.

---

### INSIDE THE CONTAINER — Commands After `docker-compose exec backend bash`

Once you are inside the Linux container (you see root@.../app#), use these WITHOUT "docker-compose exec backend":

```bash
# Most used inside container
python manage.py migrate
python manage.py makemigrations
python manage.py showmigrations
python manage.py shell
python manage.py createsuperuser

# Exit the container and return to Windows PowerShell
exit
```

### INSIDE PSQL — Commands After `docker-compose exec db psql -U jrmsu_admin -d jrmsu_library`

Once inside the database terminal (you see jrmsu_library=#):

```sql
-- List all tables
\dt

-- Count records in a table
SELECT COUNT(*) FROM "Features_book";
SELECT COUNT(*) FROM "Features_account";
SELECT COUNT(*) FROM "Features_managedfile";

-- View recently added books
SELECT title, author, created_at FROM "Features_book" ORDER BY id DESC LIMIT 10;

-- Exit psql
\q
```

---

### Summary Table

| Frequency       | Command                                         | Purpose                              |
|-----------------|-------------------------------------------------|--------------------------------------|
| DAILY           | `docker-compose up -d`                          | Start the whole system               |
| DAILY           | `docker-compose down`                           | Stop the whole system                |
| DAILY           | `docker-compose ps`                             | Check container health               |
| DAILY           | `docker-compose logs -f backend`                | Watch live API logs                  |
| OFTEN           | `docker-compose restart backend`                | Apply Python file changes            |
| OFTEN           | `...python manage.py makemigrations`            | Detect model changes                 |
| OFTEN           | `...python manage.py migrate`                   | Apply model changes to DB            |
| SOMETIMES       | `docker-compose logs --tail=50 backend`         | Debug backend errors                 |
| SOMETIMES       | `docker-compose exec backend bash`              | Enter interactive container shell    |
| SOMETIMES       | `docker-compose exec db psql ...`               | Inspect database directly            |
| LESS            | `...python manage.py createsuperuser`           | Create admin account (first time)    |
| LESS            | `...python manage.py seed_assets`               | Seed ebook/asset data (first time)   |
| RARELY          | `docker-compose build --no-cache`               | Full rebuild (broken cache)          |
| RARELY          | `docker-compose down -v`                        | Full reset (DELETES data!)           |
| RARELY          | `docker system prune -a`                        | Remove ALL Docker images             |