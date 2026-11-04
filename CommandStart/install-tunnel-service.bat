@echo off
setlocal enabledelayedexpansion
title Install Cloudflare Tunnel Service - JRMSU Library System
cd /d "%~dp0"

echo ====================================================================
echo   JRMSU LIBRARY SYSTEM - INSTALL CLOUDFLARE 24/7 WINDOWS SERVICE
echo ====================================================================
echo.

:: 1. Verify Administrative Privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ELEVATING] Requesting Administrator privileges to register Windows service...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs } catch { (New-Object -ComObject Shell.Application).ShellExecute('cmd.exe', '/c \"\"%~f0\"\"', '', 'runas', 1) }"
    exit /b 0
)

echo [OK] Running with Administrator privileges.
echo.

set "CLOUDFLARED_BIN=%~dp0cloudflared.exe"
if not exist "!CLOUDFLARED_BIN!" (
    echo [DOWNLOADING] cloudflared.exe not found in %~dp0. Downloading official binary...
    curl -Lo "!CLOUDFLARED_BIN!" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
)

if not exist "!CLOUDFLARED_BIN!" (
    echo [ERROR] cloudflared.exe was not found and could not be downloaded.
    pause
    exit /b 1
)

:: 2. Ensure Windows resolves host.docker.internal to localhost
echo [CONFIGURING] Ensuring host.docker.internal resolves to 127.0.0.1...
set "HOSTS_FILE=%WINDIR%\System32\drivers\etc\hosts"
if exist "!HOSTS_FILE!" (
    attrib -r "!HOSTS_FILE!" >nul 2>&1
    findstr /i "host.docker.internal" "!HOSTS_FILE!" >nul 2>&1
    if !errorlevel! neq 0 (
        echo.>> "!HOSTS_FILE!"
        echo 127.0.0.1 host.docker.internal >> "!HOSTS_FILE!"
        echo [OK] Added 127.0.0.1 host.docker.internal to hosts file.
    ) else (
        echo [OK] host.docker.internal already present.
    )
)

:: 3. Install Cloudflare Service
set "CF_TOKEN=eyJhIjoiMzJiM2E1ODQ0YmY1YjhiNjU2NGE0NDc5ZTcyZGY0ZGEiLCJ0IjoiOGRlMjAwOGMtZTQ2MC00ZDg1LTk5YTMtMmQwYjFkNTU5OWFkIiwicyI6Ik1EUTVPVGN4TnpJdE5tTmtOQzAwTUROa0xUZzBOakV0T0RBME9UazRORGMyWkdZMiJ9"

echo [INSTALLING] Registering Cloudflared agent Windows Service...
sc query Cloudflared >nul 2>&1
if !errorlevel! equ 0 (
    net stop Cloudflared >nul 2>&1
    sc stop Cloudflared >nul 2>&1
    "!CLOUDFLARED_BIN!" service uninstall >nul 2>&1
    timeout /t 2 /nobreak >nul 2>&1
)

"!CLOUDFLARED_BIN!" service install !CF_TOKEN!

:: 4. Auto-Recovery Policy
sc config Cloudflared start= auto >nul 2>&1
sc failure Cloudflared reset= 86400 actions= restart/5000/restart/5000/restart/5000 >nul 2>&1

:: 5. Start Service
echo.
echo [STARTING] Starting Cloudflared agent service...
net start Cloudflared

echo.
echo ====================================================================
echo   SUCCESS! Cloudflare Tunnel is now installed as a Windows Service!
echo ====================================================================
echo It will now run 24/7 in the background and auto-start upon PC boot.
echo Auto-recovery is armed (restarts every 5s if interrupted).
echo.
echo You can check status at: https://page.jrmsukc-library.online
echo.
pause
