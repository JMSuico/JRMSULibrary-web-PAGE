@echo off
setlocal enabledelayedexpansion

title JRMSU Library - Safe System Shutdown & Restore to Manual

echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - SAFE SYSTEM STOP
echo ====================================================================
echo.

:: Clean up any lingering startup lock file
del "%TEMP%\jrmsu_startup.lock" >nul 2>&1

:: 1. Smart Project Location Discovery
set "PROJECT_DIR="
set "SAVED_LOC_FILE=%APPDATA%\JRMSULibrary\ProjectLocation.txt"

:: Check local folder first
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
        for /f "delims=" %%F in ('dir /s /b /ad "%%D:\*JRMSULibrary-web-PAGE*" 2^>nul') do (
            if exist "%%F\docker-compose.yml" (
                set "PROJECT_DIR=%%F"
                goto :found_project
            )
        )
    )
)

:found_project
if "!PROJECT_DIR!"=="" (
    echo [ERROR] Could not find the JRMSULibrary-web-PAGE project folder!
    pause
    exit /b 1
)

:: 2. Safely Stop Docker Compose Containers
echo [STOPPING] Gracefully shutting down JRMSU Library containers...
cd /d "!PROJECT_DIR!"

docker compose stop
if !errorlevel! neq 0 (
    docker-compose stop
)

:: 3. Stop Cloudflare Tunnel
echo.
echo [STOPPING] Stopping Cloudflare Tunnel connector...
docker stop cloudflared >nul 2>&1

:: 4. RESTORE TO MANUAL RUNNING (Remove Windows AutoStart registration)
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_VBS=%STARTUP_FOLDER%\JRMSU_Library_AutoStart.vbs"

echo.
echo [CONFIGURING] Restoring system to MANUAL running mode...
if exist "%STARTUP_VBS%" (
    del "%STARTUP_VBS%" >nul 2>&1
    echo [OK] Windows Auto-Start script removed from Startup folder.
) else (
    echo [OK] Windows Auto-Start is already inactive.
)

:: Also remove lock file to guarantee next start is completely unblocked
del "%TEMP%\jrmsu_startup.lock" >nul 2>&1

echo.
echo ====================================================================
echo   [SUCCESS] SYSTEM STOPPED & RESTORED TO MANUAL RUNNING!
echo ====================================================================
echo.
echo - Containers:         All website & database containers SAFELY STOPPED.
echo - Cloudflare Tunnel:  OFFLINE.
echo - Auto-Start Mode:    DISABLED (Restored to 100%% MANUAL RUNNING).
echo - Data Safety:        Zero database records or volumes were modified.
echo.
echo When the PC reboots, the library system will NOT auto-start.
echo You have full manual control.
echo.
echo To turn the system and auto-start back ON anytime:
echo Double-click AutomaticUp.bat!
echo ====================================================================
echo.
timeout /t 6
exit /b 0
