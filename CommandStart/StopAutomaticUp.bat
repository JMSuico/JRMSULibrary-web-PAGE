@echo off
setlocal enabledelayedexpansion

title JRMSU Library - Safe System Shutdown and Restore to Manual

echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - SAFE SYSTEM STOP
echo ====================================================================
echo.

:: Clean up any lingering startup lock file
del /f /q "%TEMP%\jrmsu_startup.lock" >nul 2>&1

:: 1. Smart Project Location Discovery
set "PROJECT_DIR="
set "SAVED_LOC_FILE=%APPDATA%\JRMSULibrary\ProjectLocation.txt"

:: Check sibling JRMSULibrary-web-PAGE folder (CommandStart layout)
if exist "%~dp0..\JRMSULibrary-web-PAGE\docker-compose.yml" (
    pushd "%~dp0..\JRMSULibrary-web-PAGE"
    set "PROJECT_DIR=!CD!"
    popd
    goto :found_project
)

:: Check parent folder (if CommandStart is inside the project repository)
if exist "%~dp0..\docker-compose.yml" (
    pushd "%~dp0.."
    set "PROJECT_DIR=!CD!"
    popd
    goto :found_project
)

:: Check local folder first
if exist "%~dp0docker-compose.yml" (
    set "PROJECT_DIR=%~dp0"
    goto :found_project
)

:: Check saved location in AppData
if exist "!SAVED_LOC_FILE!" (
    for /f "usebackq delims=" %%A in ("!SAVED_LOC_FILE!") do (
        if exist "%%~A\docker-compose.yml" (
            set "PROJECT_DIR=%%~A"
            goto :found_project
        )
    )
)

:: Check saved location in current script folder
if exist "%~dp0ProjectLocation.txt" (
    for /f "usebackq delims=" %%A in ("%~dp0ProjectLocation.txt") do (
        if exist "%%~A\docker-compose.yml" (
            set "PROJECT_DIR=%%~A"
            goto :found_project
        )
    )
)

:: Check common default paths
for %%P in (
    "G:\JRMSU LIBRARY SYSTEM\JRMSULibrary-web-PAGE"
    "%USERPROFILE%\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE"
    "%USERPROFILE%\Desktop\JRMSU LIBRARY LANGDING PAGE\JRMSULibrary-web-PAGE"
    "C:\Users\%USERNAME%\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE"
    "C:\Users\%USERNAME%\Desktop\JRMSU LIBRARY LANGDING PAGE\JRMSULibrary-web-PAGE"
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
for %%D in (G C D E F H) do (
    if exist "%%D:\" (
        for /f "delims=" %%F in ('dir /s /b /ad "%%D:\*JRMSULibrary-web-PAGE*" 2^>nul') do (
            if exist "%%~F\docker-compose.yml" (
                set "PROJECT_DIR=%%~F"
                goto :found_project
            )
        )
    )
)

:found_project
if not defined PROJECT_DIR (
    echo [ERROR] Could not find the JRMSULibrary-web-PAGE project folder!
    ping 127.0.0.1 -n 5 >nul
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
taskkill /f /im cloudflared.exe >nul 2>&1
net stop Cloudflared >nul 2>&1
docker stop cloudflared >nul 2>&1

:: 4. RESTORE TO MANUAL RUNNING (Remove Windows AutoStart, Registry Run Key & 24/7 Watchdog)
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo.
echo [CONFIGURING] Restoring system to MANUAL running mode...

:: Remove Registry Auto-Start
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "JRMSU_Library_System" /f >nul 2>&1
echo [OK] Windows Registry Run key removed.

:: Remove Startup Folder Launchers
del "%STARTUP_FOLDER%\JRMSU_Library_AutoStart.bat" >nul 2>&1
del "%STARTUP_FOLDER%\JRMSU_Library_AutoStart.vbs" >nul 2>&1
del "%STARTUP_FOLDER%\SilentStartDockerWSL.vbs" >nul 2>&1
echo [OK] Windows Startup folder scripts removed.

:: Deactivate 24/7 Watchdog Task
echo [CONFIGURING] Deactivating 24/7 Watchdog monitor...
schtasks /delete /tn "JRMSU_Library_247_Watchdog" /f >nul 2>&1
del "%APPDATA%\JRMSULibrary\Watchdog.bat" >nul 2>&1
del "%APPDATA%\JRMSULibrary\Watchdog.vbs" >nul 2>&1
echo [OK] 24/7 Watchdog monitor deactivated.

:: Also clean up any lingering old SilentStartDockerWSL.vbs
set "OLD_BROKEN_VBS=%STARTUP_FOLDER%\SilentStartDockerWSL.vbs"
if exist "%OLD_BROKEN_VBS%" (
    del /f /q "%OLD_BROKEN_VBS%" >nul 2>&1
    echo [OK] Cleaned up legacy startup runner: %OLD_BROKEN_VBS%
)

:: Also remove lock file to guarantee next start is completely unblocked
del /f /q "%TEMP%\jrmsu_startup.lock" >nul 2>&1

echo.
echo ====================================================================
echo   [SUCCESS] SYSTEM STOPPED AND RESTORED TO MANUAL RUNNING!
echo ====================================================================
echo.
echo - Containers:         All website and database containers SAFELY STOPPED.
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
ping 127.0.0.1 -n 7 >nul
exit /b 0
