# JRMSU Library System — Master Production Deployment & Operations Guide

> **Jose Rizal Memorial State University (JRMSU) — Katipunan Campus Library**  
> *Official Dual-Machine Architecture, Headless Auto-Start Engine & Disaster Recovery Runbook*

---

## 1. Executive Summary & Dual-Machine Architecture

The JRMSU Library Landing Page & Management System operates on a strict **Dual-Machine Architecture** designed to guarantee 99.9% uptime for the public portal (`https://page.jrmsukc-library.online`) while allowing continuous offline and local development on the maintainer's laptop.

```
+-----------------------------------------------------------------------------------------+
|                                    CAMPUS TOPOLOGY                                      |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   +---------------------------------------+     +-----------------------------------+   |
|   |         LIBRARY SERVER PC             |     |        MAINTENANCE LAPTOP         |   |
|   |   (Official 24/7 Production Host)     |     |   (Developer / Portable Client)   |   |
|   |   Role: PRODUCTION_SERVER             |     |   Role: MAINTENANCE               |   |
|   +---------------------------------------+     +-----------------------------------+   |
|   | - Physical PC stationed in Library    |     | - Admin / Dev portable laptop     |   |
|   | - Windows Auto-Logon enabled          |     | - Cloudflare Services PURGED      |   |
|   | - Docker Desktop Auto-Starts          |     | - Auto-Start tasks REMOVED        |   |
|   | - Cloudflare Tunnel Service Active    |     | - Uses start-dev.bat locally      |   |
|   | - 24/7 Watchdog Self-Healing Probe    |     | - Bound to localhost ONLY         |   |
|   | - Host: host.docker.internal mapped   |     | - Closing lid NEVER affects prod  |   |
|   +-------------------+-------------------+     +-----------------+-----------------+   |
|                       |                                           |                     |
|          Outbound TLS | (Tunnel Token)               Local Dev    | (Port 3000/8000)    |
|          Tunnel Only  |                              Isolated     |                     |
|                       v                                           v                     |
|           +-----------------------+                    +---------------------+          |
|           |  Cloudflare Edge WAN  |                    |  Developer Browser  |          |
|           +-----------+-----------+                    +---------------------+          |
|                       |                                                                 |
|                       v                                                                 |
|       https://page.jrmsukc-library.online                                               |
|       (Students, Faculty, Public Kiosks)                                                |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### The Architectural Problem Resolved
Previously, an inverted deployment occurred: the developer's maintenance laptop was running the production Cloudflare Tunnel Windows Service. Whenever the laptop was closed, put to sleep, or taken outside campus Wi-Fi, the public library domain returned **502 Bad Gateway** or **530 Origin DNS Dropped**. Simultaneously, the physical Library PC failed to host the site unattended because standard Windows user logons lacked administrative privileges (`Error 5: Access is denied`) to start Windows background services.

### The Role Segregation Solution
1. **Maintenance Laptop**: Purged of all persistent background services, scheduled tasks, and auto-start keys. Runs strictly on-demand in development mode (`start-dev.bat`).
2. **Library Server PC**: Designated as the permanent 24/7 host. Configured with Windows AutoLogon, auto-recovering Cloudflare Windows Service, dual-path non-admin fallback, and self-healing watchdog.

---

## 2. Quick Setup Checklist

| Phase | Target Machine | Script to Run | Required Privileges | Frequency |
| :--- | :--- | :--- | :--- | :--- |
| **Step 1: De-escalate Laptop** | Maintenance Laptop | `Configure-As-Maintenance-Laptop.bat` | Run as Admin | Once (One-Time Setup) |
| **Step 2: Install Server** | Library Server PC | `Configure-As-Library-Server.bat` | Run as Admin | Once (Initial Provisioning) |
| **Step 3: Unattended AutoLogon** | Library Server PC | `Setup-Windows-AutoLogon.bat` | Run as Admin | Once (Initial Provisioning) |
| **Daily Operations** | Library Server PC | *Fully Automatic (No clicks needed)* | System / Windows | Every morning at power-on |
| **Local Development** | Maintenance Laptop | `start-dev.bat` | Standard User | As needed during coding |

---

## 3. Step-by-Step Deployment Runbook

### Step 1: Laptop De-escalation (On the Maintenance Laptop)

This step ensures the laptop completely relinquishes control of production Cloudflare routing and scheduled watchdogs.

1. Navigate to the project folder on your laptop:
   ```cmd
   cd "C:\Users\<YourUser>\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart"
   ```
2. Right-click **`Configure-As-Maintenance-Laptop.bat`** and select **Run as Administrator** (or double-click to allow automatic UAC elevation).
3. The script will execute the following operations automatically:
   - **Stops and uninstalls** any `Cloudflared` Windows service (`sc delete Cloudflared`).
   - **Terminates** any lingering background `cloudflared.exe` processes.
   - **Deletes** the scheduled watchdog task `JRMSU_Library_247_Watchdog`.
   - **Cleans up** `%APPDATA%\JRMSULibrary\Watchdog.bat` and `Watchdog.vbs`.
   - **Removes** the Windows Startup registry run key `JRMSU_Library_System`.
   - **Removes** any old batch/vbs shortcuts from `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`.
   - **Writes** `MAINTENANCE` into `CommandStart\MachineRole.txt`.

> [!NOTE]
> Once finished, you can safely close your laptop lid, disconnect from Wi-Fi, or shut down your laptop without any impact on the live library website.

---

### Step 2: Production Server Installation (On the Library PC)

This step equips the physical Library Server PC with high-priority background infrastructure, local DNS mappings, and container orchestration.

1. Ensure the repository folder is copied or cloned to the Library PC (e.g., on Desktop or `C:\JRMSU LIBRARY LANGDING PAGE`).
2. Right-click **`Configure-As-Library-Server.bat`** in `CommandStart` and select **Run as Administrator**.
3. The script will execute the following automated sequence:
   - **Verifies Administrator elevation**.
   - **Maps internal loopback DNS**: Automatically inserts `127.0.0.1 host.docker.internal` into `%WINDIR%\System32\drivers\etc\hosts` so Cloudflare Tunnel can reverse-proxy directly to Docker services.
   - **Installs Cloudflared Windows Service**: Registers `cloudflared.exe` with the production token, sets its startup type to `auto`, and configures crash recovery:
     ```cmd
     sc failure Cloudflared reset= 86400 actions= restart/5000/restart/5000/restart/5000
     ```
   - **Starts the Cloudflare Service**: Connects immediately to Cloudflare Edge.
   - **Tags the Machine Role**: Writes `PRODUCTION_SERVER` into `CommandStart\MachineRole.txt`.
   - **Triggers Universal Auto-Start**: Calls `AutomaticUp.bat` to wire Windows startup keys, register the 24/7 watchdog, boot Docker Desktop, and launch all backend, database, and frontend containers.

> [!TIP]
> Verify the installation by opening `https://page.jrmsukc-library.online` on your smartphone or any external device connected to mobile data.

---

---

### Step 2-B: Server RAM & 3-5s AI Latency Optimization (On the Library PC)

If the Library PC has 12 GB RAM and memory consumption reaches 90%-96%, Docker WSL2 memory paging will slow AI generation down. To drop RAM usage to 55%-65% and guarantee 3-5 second AI replies:

1. Right-click **`Optimize-Server-RAM.bat`** in `CommandStart` and select **Run as Administrator**.
2. The script applies the following automated tuning:
   - **WSL2 Memory Guardrail**: Writes `%USERPROFILE%\.wslconfig` capping WSL2 virtual memory to **6 GB** and swap to **2 GB**, guaranteeing 6 GB of physical RAM for Windows OS, AweSun remote control, and system processes.
   - **Backend Container Scaling**: Runs 1 high-speed Daphne ASGI instance instead of 3 redundant containers, saving ~800 MB RAM immediately.
   - **Ollama Parallelism**: Sets `OLLAMA_NUM_PARALLEL=1`, cutting KV cache memory overhead in half.
   - **Cache Pruning**: Prunes dead Docker builder caches and unneeded image layers.
   - **Real-Time Token Streaming**: Words stream to the browser in under 1.5 seconds with sentence completion guards preventing any cut-off sentences.

### Step 3: Unattended Morning Reboot Setup (On the Library PC)

To ensure the Library PC starts completely unattended when library staff flip the master power switch or press the PC power button each morning, configure Windows AutoLogon.

1. On the Library PC, right-click **`Setup-Windows-AutoLogon.bat`** and select **Run as Administrator**.
2. When prompted:
   - Enter the Windows username (press **Enter** to accept current `%USERNAME%`).
   - Enter the Windows account password (or leave blank if the local user has no password).
3. The script configures the Windows Registry keys:
   - `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\AutoAdminLogon = 1`
   - `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\DefaultUserName = <username>`
   - `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\DefaultPassword = <password>`

#### Hardware Recommendation: BIOS AC Power Recovery
For 100% hands-free operations:
1. Enter the Library PC BIOS/UEFI during boot (press `DEL` or `F2`).
2. Navigate to **Power Management** or **APM Configuration**.
3. Set **Restore on AC Power Loss** (or *State After G3*) to **`Power On`**.
4. Save and exit (`F10`).
Now, whenever the main library breaker or power strip is turned on in the morning, the computer powers on automatically without touching the power button.

---

## 4. Headless Morning Wakeup Architecture

The diagram below details the autonomous boot-to-live pipeline executed every morning:

```
[07:00 AM] Physical Power Applied (Staff turns on power strip / presses Power button)
      │
      ▼
[07:01 AM] BIOS POST & AC Power Recovery
      │
      ▼
[07:02 AM] Windows Bootloader -> Winlogon checks AutoAdminLogon=1
      │  (No password prompt needed; logs straight into desktop)
      ▼
[07:03 AM] Desktop Shell Loads -> Executes Windows Run Key:
      │  HKCU\Software\Microsoft\Windows\CurrentVersion\Run\JRMSU_Library_System
      │  (Silent launcher executes AutomaticUp.bat in background)
      ▼
[07:04 AM] Docker Desktop Daemon Wakeup:
      │  - Multi-Drive Scanner locates Docker executable across C:, D:, G:
      │  - Launches Docker Desktop if not running; waits for WSL2 daemon
      ▼
[07:05 AM] Container Stack Bootstrap:
      │  - Locates docker-compose.yml dynamically
      │  - Spawns postgres-db (PostgreSQL 16 on port 5432)
      │  - Spawns backend-api (Django ASGI Daphne on port 8000)
      │  - Spawns frontend-webpage (React Vite on port 5173 / 3000)
      ▼
[07:06 AM] Dual-Path Cloudflare Tunnel Verification:
      │  - Query: Is Windows Service 'Cloudflared' RUNNING?
      │  - If YES: Tunnel confirmed.
      │  - If NO (e.g. Non-Admin logon): Instantly launches standalone cloudflared.exe
      │    or Docker container fallback.
      ▼
[07:07 AM] 24/7 Watchdog Armed:
      │  - Scheduled task triggers every 3 minutes
      │  - Pings frontend-webpage and Cloudflare connector
      │  - Automatically heals any crashed component
      ▼
[07:08 AM] SYSTEM 100% OPERATIONAL & LIVE:
         - Public Web: https://page.jrmsukc-library.online
         - Local Kiosk: http://localhost:5173
```

---

## 5. Maintenance & Developer Workflows

### Scenario A: Developing Features on the Maintenance Laptop
When coding new UI features, fixing bugs, or testing components on your laptop:

1. Open a terminal in `CommandStart`:
   ```cmd
   start-dev.bat
   ```
   Or via PowerShell:
   ```powershell
   .\manage.ps1 start -Environment Development
   ```
2. The system will start Django on `http://localhost:8000` and Vite on `http://localhost:5173`.
3. Your browser will automatically open to `http://localhost:5173`.
4. Because `MachineRole.txt` contains `MAINTENANCE`:
   - No Cloudflare tunnel will be connected.
   - The production website will not be affected.
5. When finished, stop local processes:
   ```cmd
   stop-all.bat
   ```
   Or:
   ```cmd
   StopAutomaticUp.bat
   ```

### Scenario B: Database Migrations & Backup
- **Apply migrations**: Double-click `db-migrate.bat` or run:
  ```powershell
  .\manage.ps1 migrate
  ```
- **Backup database**: Run PowerShell script:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\backup-db.ps1
  ```
  Backups are saved to `.\backups\` with timestamps.
- **Restore database**: Run:
  ```cmd
  restore-backup.bat
  ```

### Scenario C: Pushing Updates to the Production Library PC
1. On the Maintenance Laptop, commit and push your verified changes:
   ```bash
   git add .
   git commit -m "feat(module): description of verified change"
   git push origin main
   ```
2. On the Library Server PC:
   - Open a terminal in `JRMSULibrary-web-PAGE`:
     ```cmd
     git pull origin main
     ```
   - Re-run `AutomaticUp.bat` or run:
     ```powershell
     .\manage.ps1 refresh
     ```
   - Docker containers will rebuild and restart cleanly without dropping database records.

---

## 6. Comprehensive Troubleshooting Guide

### 1. Error 502 Bad Gateway / Cloudflare Error 530
- **Symptom**: Visiting `https://page.jrmsukc-library.online` displays `Error 502 Bad Gateway` or `Cloudflare 530`.
- **Root Causes**:
  1. The frontend container (`frontend-webpage`) or Daphne backend is down.
  2. The hosts file is missing `127.0.0.1 host.docker.internal`.
  3. Cloudflare tunnel service stopped.
- **Quick Fix**:
  1. On the Library PC, run **`fix-tunnel-502.bat`** as Administrator. This script restarts containers, updates host mappings, and refreshes the tunnel.
  2. Check container status:
     ```cmd
     docker ps
     ```
     Ensure `frontend-webpage`, `backend-api`, and `postgres-db` show `Up`.
  3. If containers are exited, run:
     ```cmd
     docker-compose -f ..\JRMSULibrary-web-PAGE\docker-compose.yml up -d
     ```

### 2. Network IP & Dynamic DHCP Handling
- **Question**: "What if the campus router assigns a new local IP to the Library PC?"
- **Answer**: Cloudflare Tunnels use **outbound TLS connections** to Cloudflare edge nodes on port 7844/443. The tunnel does **not** rely on static port forwarding or static public IPs. When the Library PC receives a new DHCP IP, the tunnel client reconnects automatically within 10 seconds.
- **For Local Campus Kiosks**: If client tablets inside the library connect directly via LAN IP (e.g. `http://192.168.1.50:5173`), run `MakeIpPermanent.bat` as Admin on the Library PC to bind a static IPv4 address if desired.

### 3. Verifying Machine Role & State
Check the contents of `CommandStart\MachineRole.txt`:
- **`PRODUCTION_SERVER`**: The PC is actively hosting the live site. Cloudflare and watchdog are armed.
- **`MAINTENANCE`**: The PC is in client/development mode. Background services and watchdogs are suppressed.
If the role is incorrect:
- To make a machine the server: Run `Configure-As-Library-Server.bat`.
- To make a machine a maintenance laptop: Run `Configure-As-Maintenance-Laptop.bat`.

### 4. Cloudflare Windows Service vs Non-Admin Fallback
To verify how Cloudflare is currently connected on the Library PC:
- Check Windows Service:
  ```cmd
  sc query Cloudflared
  ```
- Check Standalone Process:
  ```cmd
  tasklist /fi "imagename eq cloudflared.exe"
  ```
- Check Docker Container:
  ```cmd
  docker ps --filter "name=cloudflared"
  ```
If the Windows Service reports `STOPPED` because the machine logged in without Admin rights, `AutomaticUp.bat` automatically launches the standalone fallback process, maintaining uninterrupted tunnel uptime.

### 5. Docker Desktop Fails to Start or Hangs
- If Docker Desktop fails to respond after boot:
  1. Run `RepairDockerDaemon.ps1`:
     ```powershell
     powershell -ExecutionPolicy Bypass -File .\RepairDockerDaemon.ps1
     ```
  2. If WSL2 is unresponsive:
     ```cmd
     wsl --shutdown
     ```
  3. Relaunch via `AutomaticUp.bat`.

### 6. Automated Script Verification Tool
To run a complete syntax, path integrity, and role compliance audit across all batch scripts:
```powershell
powershell -ExecutionPolicy Bypass -File .\verify-deployment-scripts.ps1
```
This utility validates that all scripts compile without syntax errors, verifies that no hardcoded paths remain, and tests role segregation rules.

---

## 7. Emergency Contacts & Quick Command Reference

| Action | Command / Location |
| :--- | :--- |
| **Start Everything (Production)** | Double-click `CommandStart\AutomaticUp.bat` |
| **Stop Everything Cleanly** | Double-click `CommandStart\StopAutomaticUp.bat` |
| **Fix 502 Bad Gateway** | Right-click `CommandStart\fix-tunnel-502.bat` (Run as Admin) |
| **Check Live Status** | Open `https://page.jrmsukc-library.online` |
| **Local Kiosk Access** | Open `http://localhost:5173` |
| **Admin Portal Access** | Open `http://localhost:5173/admin` or via public URL |
| **Obsidian ADR Reference** | `Obsidian Memory Engine/Architecture Decisions/ADR-004-Production-Server-Role-Segregation.md` |
