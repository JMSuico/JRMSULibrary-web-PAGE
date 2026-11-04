@echo off
setlocal enabledelayedexpansion
title Fix Cloudflare Tunnel 502 Bad Gateway - JRMSU Library System
cd /d "%~dp0"

echo ====================================================================
echo   JRMSU LIBRARY SYSTEM - FIX 502 BAD GATEWAY FOR CLOUDFLARE TUNNEL
echo ====================================================================
echo.

:: 1. Check for Admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ELEVATING] Requesting Administrator privileges to update Windows hosts...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs } catch { (New-Object -ComObject Shell.Application).ShellExecute('cmd.exe', '/c \"\"%~f0\"\"', '', 'runas', 1) }"
    exit /b 0
)

echo [1/3] Mapping host.docker.internal to 127.0.0.1 in Windows hosts file...
set "HOSTS_FILE=%WINDIR%\System32\drivers\etc\hosts"
if exist "!HOSTS_FILE!" (
    attrib -r "!HOSTS_FILE!" >nul 2>&1
    findstr /i "host.docker.internal" "!HOSTS_FILE!" >nul 2>&1
    if !errorlevel! neq 0 (
        echo.>> "!HOSTS_FILE!"
        echo 127.0.0.1 host.docker.internal>> "!HOSTS_FILE!"
        echo [OK] Successfully mapped: 127.0.0.1 host.docker.internal
    ) else (
        echo [OK] host.docker.internal is already present in hosts file.
    )
) else (
    echo 127.0.0.1 host.docker.internal > "!HOSTS_FILE!"
    echo [OK] Created hosts file with 127.0.0.1 host.docker.internal.
)

echo.
echo [2/3] Checking Docker Frontend Container Status...
docker ps --filter "name=frontend-webpage" --filter "status=running" | findstr /i "frontend-webpage" >nul 2>&1
if !errorlevel! neq 0 (
    echo [WARNING] frontend-webpage container is not running on port 3000!
    echo Attempting to restart containers via AutomaticUp.bat...
    if exist "%~dp0AutomaticUp.bat" (
        call "%~dp0AutomaticUp.bat"
    )
) else (
    echo [OK] Frontend webpage container is active and listening on port 3000.
)

echo.
echo [3/3] Restarting Cloudflare Tunnel Connector...
sc query Cloudflared >nul 2>&1
if !errorlevel! equ 0 (
    echo [RESTARTING] Restarting Cloudflared agent Windows Service...
    net stop Cloudflared >nul 2>&1
    timeout /t 1 /nobreak >nul 2>&1
    net start Cloudflared
    echo [OK] Cloudflared Windows Service restarted.
) else (
    echo [RESTARTING] Restarting standalone cloudflared process...
    taskkill /f /im cloudflared.exe >nul 2>&1
    set "CF_TOKEN=eyJhIjoiMzJiM2E1ODQ0YmY1YjhiNjU2NGE0NDc5ZTcyZGY0ZGEiLCJ0IjoiOGRlMjAwOGMtZTQ2MC00ZDg1LTk5YTMtMmQwYjFkNTU5OWFkIiwicyI6Ik1EUTVPVGN4TnpJdE5tTmtOQzAwTUROa0xUZzBOakV0T0RBME9UazRORGMyWkdZMiJ9"
    if exist "%~dp0cloudflared.exe" (
        start /b "" "%~dp0cloudflared.exe" tunnel run --token !CF_TOKEN! >nul 2>&1
        echo [OK] Started standalone cloudflared.exe.
    ) else (
        docker restart cloudflared >nul 2>&1
        echo [OK] Restarted Cloudflare container.
    )
)

echo.
echo ====================================================================
echo   SUCCESS! The 502 Bad Gateway check and restart completed.
echo ====================================================================
echo You can now open: https://page.jrmsukc-library.online
echo.
pause
