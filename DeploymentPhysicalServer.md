# JRMSU Library — Physical Server Deployment Guide

This guide outlines the exact steps to deploy this project on an actual **physical server** located on the JRMSU campus (e.g., bare-metal server connected to the campus LAN or library Wi-Fi router).

## 1. Prerequisites
On your physical server machine, you must install:
- **Git** (to clone the repository)
- **Docker Desktop** (if using Windows Server/Windows 11) OR **Docker Engine + Docker Compose** (if using Ubuntu/Linux Server).

## 2. Cloning the Project
Open a terminal on the physical server and run:
```bash
git clone <your-repository-url>
cd JRMSULibrary-web-PAGE
```

## 3. What to Add: The `.env` File
You MUST create a `.env` file in the root folder of the project. 

> [!TIP]
> **Pro Tip:** If you already have a working `.env` file from your local development or demo deployment, you can simply **copy and paste it** directly to the physical server! It already contains your `EMAIL_HOST_PASSWORD` and other important variables.

If you don't have it, below is the comprehensive environment template you must copy and paste.

Create a file named `.env` and paste this exactly:
```env
# Security Keys
SECRET_KEY=jrmsu-super-secret-key-2026-production-ready!
DJANGO_DEBUG=False
DISABLE_SSL_REDIRECT=True

# --- OPTION A: LOCAL DOCKER DATABASE (Default for Physical Server) ---
# DB_PASSWORD=YourSuperSecureDBPassword123!
# REDIS_PASSWORD=YourSuperSecureRedisPassword123!

# --- OPTION B: SUPABASE REMOTE DATABASE (If using Cloud DB) ---
DB_ENGINE=postgresql
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_NAME=postgres
DB_PASSWORD=JRMSUKCLIBRARY7109
DB_PORT=5432
DB_USER=postgres.oaujamkhpwszewycylxm
SUPABASE_PROJECT_REF=oaujamkhpwszewycylxm
# (You still need a Redis password if Redis is running locally)
REDIS_PASSWORD=YourSuperSecureRedisPassword123!

# Supabase S3 Storage (AWS configuration)
USE_S3_STORAGE=True
AWS_ACCESS_KEY_ID=c037b792c0de7875e80d6e87d498cd9d
AWS_SECRET_ACCESS_KEY=e12d03a079da2dff6074783f325bf4de795bab134c8e6b214f366c62b6ab4657
AWS_STORAGE_BUCKET_NAME=jrmsu-media
AWS_S3_ENDPOINT_URL=https://oaujamkhpwszewycylxm.supabase.co/storage/v1/s3

# Server Performance
WEB_CONCURRENCY=1
CELERY_CONCURRENCY=1

# External Services (If needed)
EMAIL_HOST_PASSWORD=your_gmail_app_password
NGROK_AUTHTOKEN=your_ngrok_token
```

## 4. What to Adjust: Network Settings (IP Address)
If the server is connected to the library Wi-Fi, students will access the site using the server's local IP address (e.g., `192.168.1.100` or `10.0.0.100`).

1. Open `docker-compose.yml`
2. Scroll to the `backend` service environment variables (**Line 55 to Line 60**).
3. Edit `ALLOWED_HOSTS` and `ALLOWED_CORS_ORIGINS` to include your server's IP address:
```yaml
      ALLOWED_HOSTS: "192.168.1.100,localhost,127.0.0.1"
      ALLOWED_CORS_ORIGINS: "http://192.168.1.100:3000,http://localhost:3000"
```
*(Note: If you are using your `.env` to override these, make sure your `.env` ALLOWED_CORS_ORIGINS contains these local IPs alongside your Vercel domains).*

## 5. Deployment Execution
To start the server, open your terminal in the project folder and run:
```bash
docker-compose up -d --build
```
*The `-d` flag runs it in the background so you can close the terminal. The `--build` flag ensures it compiles the latest React production bundle.*

## 6. Accessing the Site
- **Public Landing Page (Students):** `http://<SERVER_IP>:3000`
- **Admin Panel (Librarians):** `http://<SERVER_IP>:3001`

To create your first admin account, run:
```bash
docker-compose exec backend python manage.py createsuperuser_custom
```

## What to Delete?
**Nothing.** The `docker-compose.yml` is already optimized for a physical server deployment. The exposed database ports have already been deleted for security (Phase 3), and the system is fully hardened.

---

## Optional: Creating a Local Subdomain (e.g., `library.jrmsu.local`)
If you don't want students typing raw IP addresses (like `http://192.168.1.100:3000`), you can ask the University IT Department to create a **Local DNS Record** on the campus Wi-Fi router.

**Instructions for the IT Department:**
1. Access the campus Local DNS Server or Router (e.g., Mikrotik, pfSense).
2. Add a **Static DNS Entry / A Record**.
3. Map the Domain `library.jrmsu.local` (or similar) to the Physical Server's IP Address (e.g., `192.168.1.100`).

Once applied, any student connected to the campus Wi-Fi can type `http://library.jrmsu.local:3000` to access the system.
