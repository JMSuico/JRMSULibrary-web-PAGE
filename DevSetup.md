# JRMSU Library — Development Setup Guide (DevSetup.md)

This guide provides step-by-step instructions on how to set up the JRMSU Library project on your local machine. You can choose to run the project **without Docker (Local Mode)** or **with Docker (Container Mode)**.

---

## Mode 1: Running Locally (Without Docker)
This is the traditional way of running the stack on your bare-metal OS. 

### Prerequisites
- **Node.js** (v20+)
- **Python** (v3.11+)
- **SQL Server / SSMS 19** (Running locally on port 1433)
- **Ollama** (Running locally)

### Step 1: Database Setup
The backend requires a configured `.env` file and a SQL Server database. We have an interactive script to automate this.
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Run the database setup script:
   ```bash
   python setup_db.py
   ```
3. **What this does:** 
   - It will prompt you for your SQL Server details (use `localhost` and Windows or SQL Server Auth).
   - It automatically logs into your local SQL Server, creates a database named `JRMSUKatipunanCampusLibrary`, creates the necessary users/roles, and automatically generates your `.env` file with the correct connection strings.

### Step 2: Backend Setup (Django)
1. Open a terminal in the `backend` folder.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Prepare the database and initial data:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py imports_assets
   ```
5. Start the backend server:
   ```bash
   python manage.py runserver 8000
   ```
   *The backend API is now running at `http://localhost:8000`*

### Step 3: Frontend Setup (React/Vite)
1. Open a **second** terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend is now running at `http://localhost:3000`*

### Step 4: AI Engine Setup
1. Open a **third** terminal.
2. Download and run the local AI model used by the library:
   ```bash
   ollama run qwen2.5:1.5b
   ```

**You are now fully running locally!**

---

## Mode 2: Running with Docker (Recommended for quick testing)
Docker containerizes all 5 layers (Frontend, Backend, Database, Redis, and AI). You do not need to install Python, Node, or SQL Server.

### Prerequisites
- **Docker Desktop** (Running on your machine)

### Step 1: Prepare Environment
1. Ensure your `.env` file is present in the root of the project (if you don't have one, copy `.env.docker` to `.env` and fill in passwords).
2. Note: Docker mode uses **PostgreSQL** instead of SQL Server.

### Step 2: Build and Start Containers
1. Open a terminal in the root of the project.
2. Run the Docker Compose build command:
   ```bash
   docker-compose up --build -d
   ```
   *This will download all dependencies, build the images, and start the containers in the background.*

### Step 3: Initial Database Setup (First time only)
Because Docker creates a fresh PostgreSQL database, you need to populate it.
1. Run the database migrations:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```
2. Create an admin account for the system:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```
3. Import the default library assets (eBooks, Org Structure, etc.):
   ```bash
   docker-compose exec backend python manage.py imports_assets
   ```

### Step 4: Access the System
Once Docker is running, you can access your system here:
- **Public Website:** `http://localhost:3000`
- **Admin Dashboard:** `http://localhost:3001/admin`
- **Backend API:** `http://localhost:8000/api`

### Troubleshooting Docker
If you ever need to completely wipe the system and start fresh (Warning: deletes database records!):
```bash
docker-compose down -v --remove-orphans
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

---

## Configuration Files to Edit

When setting up the project for the first time, you may need to edit the following configuration files:

### 1. The Environment File (`.env`)
This is the most critical file to edit. It stores your database passwords, API keys, and secret configurations. 
- **Location:** The root folder of the project (`/JRMSU LIBRARY LANDING PAGE/.env`)
- **What to do (Docker Mode):** Copy the provided `.env.docker` file, rename the copy to exactly `.env`, and fill in the missing passwords (e.g., `DB_PASSWORD`, `EMAIL_HOST_PASSWORD`).
- **What to do (Local Mode):** When you run `python setup_db.py`, it will automatically generate this file for you based on your inputs. If you need to change your SQL Server password later, you edit this file directly.
**Example (`.env`):**
```env
DB_PASSWORD="MySecurePassword123!"
SECRET_KEY="replace-this-with-a-very-long-secure-random-string"
EMAIL_HOST_PASSWORD="my-gmail-app-password"
```

### 2. Frontend Environment Variables
If you need to change the API URL that the frontend connects to (for example, if you are sharing your local server over Wi-Fi with classmates):
- **Location:** Open `docker-compose.yml` (if using Docker) or `.env` in the frontend (if running locally).
- **What to edit:** Look for `VITE_API_BASE_URL`. Change it from `http://localhost:8000/api` to your computer's Wi-Fi IP address.
**Example (`docker-compose.yml` frontend section):**
```yaml
    environment:
      # Change localhost to your computer's IP address if sharing on Wi-Fi
      - VITE_API_BASE_URL=http://192.168.1.5:8000/api
```

### 3. Docker Orchestration (`docker-compose.yml`)
If you want to disable a specific container (like the AI engine to save RAM) or change exposed ports:
- **Location:** The root folder of the project (`/JRMSU LIBRARY LANDING PAGE/docker-compose.yml`)
- **What to edit:** You can safely comment out the `ollama` block if you don't want to run the heavy AI engine locally. You can also edit the `ports` mapping.
**Example (Commenting out the AI Engine):**
```yaml
#  ollama:
#    image: ollama/ollama
#    container_name: jrmsu_ollama
#    ports:
#      - "11434:11434"
```
**Example (Changing a taken port from 3000 to 8080):**
```yaml
  frontend-webpage:
    ports:
      - "8080:3000" # Host port 8080 maps to container port 3000
```

### 4. Switching from Docker to Local Development
If you were previously running the system in Docker, your `.env` file is currently configured to look for a PostgreSQL database named `db` inside the Docker network. If you try to run the backend locally using `python manage.py runserver`, it will crash because it cannot find the `db` host.

To switch back to Local Development (using SQL Server on your machine):
- **Location:** The root folder of the project (`/JRMSU LIBRARY LANDING PAGE/.env`)
- **What to edit:** You have two options to fix this:
  1. **The Automatic Way:** Simply run `python setup_db.py` in the `backend` folder. It will overwrite your `.env` file with the correct local SQL Server credentials (`DB_ENGINE=mssql`, `DB_HOST=localhost`, etc.).
  2. **The Manual Way:** Open your `.env` file and manually change the database credentials from Docker (PostgreSQL) to your local SQL Server.
**Example (Manual Change in `.env`):**
```env
# REMOVE the Docker credentials:
# DB_ENGINE=postgresql
# DB_HOST=db
# DB_PORT=5432

# ADD your local SQL Server credentials:
DB_ENGINE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USER=JRMSUKatipunanCampusLibrary
DB_PASSWORD=JRMSUKatipunanCampusLibrary
DB_MSSQL_DRIVER=ODBC Driver 17 for SQL Server
```
