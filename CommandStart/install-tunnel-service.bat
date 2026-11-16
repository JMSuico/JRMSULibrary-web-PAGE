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

:: 3. Load CF_TUNNEL_TOKEN from environment or root .env (never hardcode tokens)
if not defined CF_TUNNEL_TOKEN if defined TUNNEL_TOKEN set "CF_TUNNEL_TOKEN=%TUNNEL_TOKEN%"
if not defined CF_TUNNEL_TOKEN (
    for %%E in ("%~dp0..\.env" "%~dp0..\JRMSULibrary-web-PAGE\.env" "%~dp0.env") do (
        if not defined CF_TUNNEL_TOKEN if exist "%%~E" (
            for /f "usebackq tokens=1,* delims==" %%A in ("%%~E") do (
                if /i "%%~A"=="CF_TUNNEL_TOKEN" (
                    set "_CF_RAW=%%~B"
                    set "_CF_RAW=!_CF_RAW:"=!"
                    set "_CF_RAW=!_CF_RAW:'=!"
                    for /f "tokens=1 delims=# " %%V in ("!_CF_RAW!") do set "CF_TUNNEL_TOKEN=%%V"
                    set "_CF_RAW="
                ) else if /i "%%~A"=="TUNNEL_TOKEN" (
                    if not defined CF_TUNNEL_TOKEN (
                        set "_CF_RAW=%%~B"
                        set "_CF_RAW=!_CF_RAW:"=!"
                        set "_CF_RAW=!_CF_RAW:'=!"
                        for /f "tokens=1 delims=# " %%V in ("!_CF_RAW!") do set "CF_TUNNEL_TOKEN=%%V"
                        set "_CF_RAW="
                    )
                )
            )
        )
    )
)
if defined CF_TUNNEL_TOKEN (
    echo !CF_TUNNEL_TOKEN! | findstr /b /i "change_me_ your_" >nul 2>&1 && set "CF_TUNNEL_TOKEN="
)

if not defined CF_TUNNEL_TOKEN (
    echo [ERROR] CF_TUNNEL_TOKEN is not set in root .env or environment!
    echo.
    echo Add CF_TUNNEL_TOKEN=^<your_cloudflare_tunnel_token^> to your root .env file,
    echo or set CF_TUNNEL_TOKEN in the environment, then re-run this installer.
    echo.
    pause
    exit /b 1
)

:: 4. Install Cloudflare Service
echo [INSTALLING] Registering Cloudflared agent Windows Service...
sc query Cloudflared >nul 2>&1
if !errorlevel! equ 0 (
    net stop Cloudflared >nul 2>&1
    sc stop Cloudflared >nul 2>&1
    "!CLOUDFLARED_BIN!" service uninstall >nul 2>&1
    timeout /t 2 /nobreak >nul 2>&1
)

"!CLOUDFLARED_BIN!" service install !CF_TUNNEL_TOKEN!
set "CF_INSTALL_RC=!errorlevel!"
set "CF_TUNNEL_TOKEN="
if !CF_INSTALL_RC! neq 0 (
    echo [ERROR] Failed to install Cloudflared Windows Service ^(exit code !CF_INSTALL_RC!^).
    pause
    exit /b !CF_INSTALL_RC!
)

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
