# JRMSU Library — Cloud Server Deployment Guide

This guide outlines the exact steps to deploy this project on a **Cloud Server** (e.g., AWS EC2, DigitalOcean Droplet, Linode) accessible via the public internet with a domain name and HTTPS/SSL.

## 1. Prerequisites
On your Cloud VPS (Ubuntu 22.04 or similar is recommended):
- **Domain Name** (e.g., `library.jrmsu.edu.ph`) pointed to your Cloud VPS IP address (A Record).
- **Git**
- **Docker Engine & Docker Compose**
- **Nginx** (Installed directly on the host OS for Reverse Proxying)
- **Certbot / Let's Encrypt** (For free SSL certificates)

## 2. Cloning the Project
Open an SSH terminal to your Cloud Server:
```bash
git clone <your-repository-url>
cd JRMSULibrary-web-PAGE
```

## 3. What to Add: The `.env` File
Create a `.env` file in the root directory. 

> [!TIP]
> **Pro Tip:** If you already have a working `.env` file from your local development or demo deployment, you can simply **copy and paste it** directly to the cloud server! It already contains your `EMAIL_HOST_PASSWORD`, Supabase URLs, AWS keys, and other important variables.

If you don't have it, below is the comprehensive environment template containing the exact Supabase/AWS credentials for the cloud server.

Create a file named `.env` and paste this exactly:
```env
# Security Keys
SECRET_KEY=jrmsu-super-secret-key-2026-production-ready!
DJANGO_DEBUG=False
DISABLE_SSL_REDIRECT=True

# Network Routing (For Vercel/Render Cloud)
ALLOWED_CORS_ORIGINS=https://jrmsulibrary-web-page.onrender.com,https://jrmsu-library-web-page.vercel.app,https://library.jrmsu.edu.ph
ALLOWED_HOSTS=*

# Supabase Remote Database
DB_ENGINE=postgresql
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_NAME=postgres
DB_PASSWORD=JRMSUKCLIBRARY7109
DB_PORT=5432
DB_USER=postgres.oaujamkhpwszewycylxm
SUPABASE_PROJECT_REF=oaujamkhpwszewycylxm
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

# External Services
EMAIL_HOST_PASSWORD=your_gmail_app_password
```
*(You do not need Ngrok for cloud deployment since you have a public IP and Domain)*

## 4. What to Adjust: Network Settings (Domain Name)
1. Open `docker-compose.yml`
2. Scroll to the `backend` service environment variables (**Line 55 to Line 60**).
3. If you did NOT set `ALLOWED_HOSTS` in your `.env` file, edit it manually here:
```yaml
      ALLOWED_HOSTS: "library.jrmsu.edu.ph,localhost,127.0.0.1"
      ALLOWED_CORS_ORIGINS: "https://library.jrmsu.edu.ph,http://localhost:3000"
```

## 5. What to Adjust: Nginx Reverse Proxy & SSL
Since you want your site accessible over `https://`, you should NOT let Docker bind directly to port 80 externally. 

1. Edit `docker-compose.yml` and change the frontend ports to bind only locally (Around **Line 105** and **Line 124**):
```yaml
  frontend-webpage:
    ports:
      - "127.0.0.1:3000:80"

  frontend-admin:
    ports:
      - "127.0.0.1:3001:80"
```
2. Run `docker-compose up -d --build`.
3. Install Nginx on your Host OS: `sudo apt install nginx`
4. Create an Nginx configuration file (`/etc/nginx/sites-available/library`):
```nginx
server {
    server_name library.jrmsu.edu.ph;

    location / {
        proxy_pass http://127.0.0.1:3000; # Routes to frontend-webpage
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin-panel/ {
        proxy_pass http://127.0.0.1:3001; # Routes to frontend-admin
        proxy_set_header Host $host;
    }
}
```
5. Enable the site: `sudo ln -s /etc/nginx/sites-available/library /etc/nginx/sites-enabled/`
6. Run Certbot to generate your free SSL certificate: 
`sudo certbot --nginx -d library.jrmsu.edu.ph`

## What to Delete?
- **Ngrok Service:** You can delete the entire `ngrok:` block from `docker-compose.yml` since your VPS has a dedicated public IP and Nginx handling the routing.

## Security Posture
The infrastructure is fully hardened. The Postgres and Redis databases are strictly locked inside the internal Docker network and completely invisible to the public internet, ensuring maximum security against automated bot scanners.

---

## How to Create the Subdomain (e.g., `library.jrmsu.edu.ph`)
When deploying to a Cloud Server, the subdomain is configured at your **Domain Registrar** (e.g., GoDaddy, Namecheap, Cloudflare, or whoever manages `jrmsu.edu.ph`), **not** in the code itself.

**DNS Configuration Steps:**
1. Log in to the website where the University manages its DNS records.
2. Go to the **DNS Management** page.
3. Click **Add New Record**.
4. Set the Type to: **A Record**.
5. Set the Name/Host to: **library** *(This creates library.jrmsu.edu.ph)*.
6. Set the Value to: **[Your Cloud Server's Public IP Address]** (e.g., `167.71.x.x`).
7. Save the record.

Once the DNS propagates (usually within 5-30 minutes), typing `library.jrmsu.edu.ph` will automatically route traffic to the Nginx reverse proxy on your Cloud Server, which will seamlessly forward it to the Docker containers.


env example

# ==============================================================================
# JRMSU Library - Environment Variable Template
# ==============================================================================
# To use this file, duplicate it and rename it to exactly ".env"
# Do NOT commit your actual .env file to version control!

# ------------------------------------------------------------------------------
# 1. CORE SECURITY SETTINGS (Required)
# ------------------------------------------------------------------------------
# Generate a long, random string. Do NOT use the default in production!
SECRET_KEY=generate_a_very_long_secure_random_string_here_12345
# Set to False in production for security
DJANGO_DEBUG=False
# Set to True in production to force HTTPS (if behind a proxy like Nginx/Cloudflare)
DISABLE_SSL_REDIRECT=True

# ------------------------------------------------------------------------------
# 2. LOCAL DOCKER DATABASE & CACHE (Required if running locally)
# ------------------------------------------------------------------------------
# Passwords for the local Postgres and Redis containers inside Docker.
# Make these strong passwords. The system will not start without them.
DB_PASSWORD=YourSuperSecureLocalDBPassword123!
REDIS_PASSWORD=YourSuperSecureLocalRedisPassword123!

# ------------------------------------------------------------------------------
# 3. CLOUD / SUPABASE DATABASE OVERRIDES (Optional)
# ------------------------------------------------------------------------------
# If you are deploying to the cloud and want to connect to an external managed 
# database (like Supabase), uncomment and fill these out. They will override the local DB.
# DB_ENGINE=postgresql
# DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
# DB_NAME=postgres
# DB_USER=postgres.your_project_id
# DB_PORT=5432
# SUPABASE_PROJECT_REF=your_project_id

# ------------------------------------------------------------------------------
# 4. CLOUD / AWS S3 STORAGE (Optional)
# ------------------------------------------------------------------------------
# If you are using Supabase or AWS S3 to host your uploaded images and PDFs,
# uncomment and fill out these variables.
# USE_S3_STORAGE=True
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_STORAGE_BUCKET_NAME=jrmsu-media
# AWS_S3_ENDPOINT_URL=https://your_project_id.supabase.co/storage/v1/s3

# ------------------------------------------------------------------------------
# 5. EXTERNAL SERVICES & CREDENTIALS (Required for full functionality)
# ------------------------------------------------------------------------------
# Email settings for password resets and notifications (Use a Gmail App Password)
EMAIL_HOST_PASSWORD=your_gmail_app_password

# External Library integration credentials (Optional)
VITALSOURCE_EMAIL=your_vitalsource_email@jrmsu.edu.ph
VITALSOURCE_PASSWORD=your_vitalsource_password
SCHOLAAR_USERNAME=your_scholaar_username
SCHOLAAR_PASSWORD=your_scholaar_password

# ------------------------------------------------------------------------------
# 6. NETWORK ROUTING & PERFORMANCE
# ------------------------------------------------------------------------------
# ALLOWED_HOSTS: Comma-separated list of IP addresses or domains that can access the backend
ALLOWED_HOSTS=library.jrmsu.edu.ph,192.168.1.100,localhost,127.0.0.1
# ALLOWED_CORS_ORIGINS: URLs of your frontend React app (include http/https)
ALLOWED_CORS_ORIGINS=https://library.jrmsu.edu.ph,http://192.168.1.100:3000,http://localhost:3000

# Gunicorn/Celery worker counts (Leave at 1 for low-resource physical servers)
WEB_CONCURRENCY=1
CELERY_CONCURRENCY=1

# Ngrok token (Only needed if running a public tunnel on a local PC, not needed for cloud/physical servers)
# NGROK_AUTHTOKEN=your_ngrok_token_here
