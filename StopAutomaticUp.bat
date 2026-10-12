@echo off
setlocal enabledelayedexpansion

title JRMSU Library - Safe System Shutdown

echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - SAFE SYSTEM STOP
echo ====================================================================
echo.

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

:: 3. Stop Cloudflare Tunnel
echo.
echo [STOPPING] Stopping Cloudflare Tunnel connector...
docker stop cloudflared >nul 2>&1

echo.
echo ====================================================================
echo   [SUCCESS] SYSTEM SHUTDOWN COMPLETED SAFELY!
echo ====================================================================
echo.
echo - All website and database containers are stopped.
echo - The Cloudflare tunnel is offline.
echo - Zero database data was modified or deleted.
echo.
echo To turn the system back ON anytime:
echo Double-click AutomaticUp.bat!
echo ====================================================================
echo.
pause
exit /b 0
