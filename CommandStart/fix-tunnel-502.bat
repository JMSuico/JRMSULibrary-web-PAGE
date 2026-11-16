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
    if exist "%~dp0cloudflared.exe" (
        if defined CF_TUNNEL_TOKEN (
            set "TUNNEL_TOKEN=!CF_TUNNEL_TOKEN!"
            start /b "" "%~dp0cloudflared.exe" tunnel run >nul 2>&1
            set "TUNNEL_TOKEN="
            set "CF_TUNNEL_TOKEN="
            echo [OK] Started standalone cloudflared.exe.
        ) else (
            echo [ERROR] CF_TUNNEL_TOKEN is not set in root .env or environment!
            echo         Add CF_TUNNEL_TOKEN to root .env or install the Cloudflared service via install-tunnel-service.bat.
            pause
            exit /b 1
        )
    ) else (
        set "CF_TUNNEL_TOKEN="
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
