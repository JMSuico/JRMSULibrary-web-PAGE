@echo off
setlocal enabledelayedexpansion

title JRMSU Library - Automatic System Launcher

echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - AUTOMATIC SYSTEM LAUNCHER
echo ====================================================================
echo.

set "LOCK_FILE=%TEMP%\jrmsu_startup.lock"

:: 1. Prevent duplicate rapid clicks (Debounce / Single-Instance Lock)
if exist "!LOCK_FILE!" (
    :: If lockfile exists, check if it is stale (older than 60 seconds)
    for /f "usebackq" %%T in ('powershell -NoProfile -Command "(Get-Date) - (Get-Item '%TEMP%\jrmsu_startup.lock').LastWriteTime | Select-Object -ExpandProperty TotalSeconds"') do (
        set "LOCK_AGE=%%T"
    )
    if defined LOCK_AGE (
        for /f "tokens=1 delims=." %%S in ("!LOCK_AGE!") do set "LOCK_AGE_INT=%%S"
        if !LOCK_AGE_INT! gtr 60 (
            del "!LOCK_FILE!" >nul 2>&1
            goto :proceed_lock
        )
    )
    echo [INFO] A startup process is already running.
    echo Please wait for the current launch to complete...
    timeout /t 4 >nul
    exit /b 0
)

:proceed_lock
echo %date% %time% > "!LOCK_FILE!"

:: 2. Smart Project Location Discovery (Resilient against power cut / delayed drive mount)
set "PROJECT_DIR="
set "SAVED_LOC_FILE=%APPDATA%\JRMSULibrary\ProjectLocation.txt"
set /a DRIVE_SCAN_ATTEMPT=0

:discover_drive_loop
:: Check local script folder first
if exist "%~dp0docker-compose.yml" (
    set "PROJECT_DIR=%~dp0"
    goto :found_project
)

:: Check saved location in AppData
if exist "!SAVED_LOC_FILE!" (
    for /f "usebackq delims=" %%A in ("!SAVED_LOC_FILE!") do (
        if exist "%%A\docker-compose.yml" (
            set "PROJECT_DIR=%%A"
            goto :found_project
        )
    )
)

:: Check saved location in current script folder
if exist "%~dp0ProjectLocation.txt" (
    for /f "usebackq delims=" %%A in ("%~dp0ProjectLocation.txt") do (
        if exist "%%A\docker-compose.yml" (
            set "PROJECT_DIR=%%A"
            goto :found_project
        )
    )
)

:: Check common default paths
for %%P in (
    "G:\JRMSU LIBRARY SYSTEM\JRMSULibrary-web-PAGE"
    "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE"
    "C:\Users\provu\Desktop\JRMSU LIBRARY LANGDING PAGE\JRMSULibrary-web-PAGE"
    "D:\JRMSU LIBRARY SYSTEM\JRMSULibrary-web-PAGE"
    "C:\JRMSU LIBRARY SYSTEM\JRMSULibrary-web-PAGE"
) do (
    if exist "%%~P\docker-compose.yml" (
        set "PROJECT_DIR=%%~P"
        goto :found_project
    )
)

:: Deep search across all active drives if not found
echo [SEARCHING] Locating project folder across all connected drives...
for %%D in (G C D E F) do (
    if exist "%%D:\" (
        echo Scanning drive %%D:\ for JRMSULibrary-web-PAGE...
        for /f "delims=" %%F in ('dir /s /b /ad "%%D:\*JRMSULibrary-web-PAGE*" 2^>nul') do (
            if exist "%%F\docker-compose.yml" (
                set "PROJECT_DIR=%%F"
                goto :found_project
            )
        )
    )
)

if "!PROJECT_DIR!"=="" (
    set /a DRIVE_SCAN_ATTEMPT+=1
    if !DRIVE_SCAN_ATTEMPT! lss 3 (
        echo [WAITING] Drive might still be mounting after power restoration... Retrying in 5s...
        timeout /t 5 /nobreak >nul
        goto :discover_drive_loop
    )
)

:found_project
if "!PROJECT_DIR!"=="" (
    echo [ERROR] Could not find the JRMSULibrary-web-PAGE project folder!
    echo Please make sure the project drive is connected.
    del "!LOCK_FILE!" >nul 2>&1
    pause
    exit /b 1
)

:: Save location permanently for future instant launches
if not exist "%APPDATA%\JRMSULibrary" mkdir "%APPDATA%\JRMSULibrary"
echo !PROJECT_DIR!> "!SAVED_LOC_FILE!"
echo !PROJECT_DIR!> "%~dp0ProjectLocation.txt"
echo [OK] Project directory confirmed: !PROJECT_DIR!

:: 3. Ensure Docker Desktop & WSL2 are Running (Cold Boot & Brownout Recovery)
echo.
echo [CHECK] Verifying Docker Engine status...
docker info >nul 2>&1
if !errorlevel! equ 0 goto :docker_online

echo [STARTING] Docker Desktop is offline. Starting Docker Desktop and WSL2 subsystem...

set "DOCKER_BIN="
if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    set "DOCKER_BIN=C:\Program Files\Docker\Docker\Docker Desktop.exe"
)

if "!DOCKER_BIN!"=="" (
    for /f "delims=" %%I in ('powershell -NoProfile -Command "(Get-ItemProperty -ErrorAction SilentlyContinue 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*' | Where-Object { $_.DisplayName -match 'Docker Desktop' }).InstallLocation"') do (
        if exist "%%I\Docker Desktop.exe" set "DOCKER_BIN=%%I\Docker Desktop.exe"
    )
)

if "!DOCKER_BIN!"=="" set "DOCKER_BIN=C:\Program Files\Docker\Docker\Docker Desktop.exe"

start "" "!DOCKER_BIN!"

echo Waiting for Docker Engine and WSL2 to initialize (this may take up to 90s after reboot)...
set /a DOCKER_RETRY=0

:wait_docker_loop
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if !errorlevel! equ 0 goto :docker_online

set /a DOCKER_RETRY+=1
if !DOCKER_RETRY! lss 45 (
    echo [WAITING] Initializing Docker Engine and WSL... (!DOCKER_RETRY!/45)
    goto :wait_docker_loop
)

echo [WARNING] Docker initialization took longer than expected. Proceeding with launch...

:docker_online
echo [OK] Docker Engine is online and ready!

:: 4. Check if the system is ALREADY online & running
docker ps --filter "name=frontend-webpage" --filter "status=running" | findstr /i "frontend-webpage" >nul 2>&1
if !errorlevel! equ 0 (
    docker ps --filter "name=cloudflared" --filter "status=running" | findstr /i "cloudflared" >nul 2>&1
    if !errorlevel! equ 0 (
        echo.
        echo ====================================================================
        echo   [OK] SYSTEM IS ALREADY UP AND RUNNING!
        echo ====================================================================
        echo - Public Landing Page: https://page.jrmsukc-library.online
        echo - Librarian Admin:     https://admin.jrmsukc-library.online
        echo.
        echo You do not need to click again.
        echo To stop the system, double-click StopAutomaticUp.bat.
        echo ====================================================================
        del "!LOCK_FILE!" >nul 2>&1
        timeout /t 5
        exit /b 0
    )
)

:: 5. Launch Docker Compose Services & Cloudflare Tunnel
echo.
echo [LAUNCHING] Starting JRMSU Library System containers...
cd /d "!PROJECT_DIR!"

docker compose up -d
if !errorlevel! neq 0 (
    echo [RETRY] Trying with docker-compose standalone...
    docker-compose up -d
)

echo.
echo [LAUNCHING] Starting Cloudflare Tunnel connector...
docker start cloudflared >nul 2>&1

:: 6. Register Permanent Windows Startup (Auto-runs on PC Boot / Restart / Brownout)
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_VBS=%STARTUP_FOLDER%\JRMSU_Library_AutoStart.vbs"

echo.
echo [CONFIGURING] Ensuring Windows Auto-Start on PC boot...
echo Set WshShell = CreateObject("WScript.Shell") > "%STARTUP_VBS%"
echo WshShell.Run """!PROJECT_DIR!\AutomaticUp.bat""", 0, False >> "%STARTUP_VBS%"

:: Clean up lock file
del "!LOCK_FILE!" >nul 2>&1

echo.
echo ====================================================================
echo   [SUCCESS] JRMSU LIBRARY SYSTEM IS ONLINE & PERMANENT!
echo ====================================================================
echo.
echo 1. Public Landing Page:  https://page.jrmsukc-library.online
echo 2. Librarian Admin:      https://admin.jrmsukc-library.online
echo 3. Windows Auto-Start:   ENABLED (Will launch automatically on boot)
echo 4. To stop the system:   Double-click StopAutomaticUp.bat anytime.
echo.
echo ====================================================================
timeout /t 8
exit /b 0
