@echo off
setlocal enabledelayedexpansion
title Cloudflare Tunnel - JRMSU Library System
cd /d "%~dp0"

echo ====================================================================
echo   JRMSU LIBRARY SYSTEM - CLOUDFLARE TUNNEL RUNNER
echo ====================================================================
echo.
echo Tunneling:
echo   - Landing Page / OPAC : http://localhost:3000
echo   - Admin Portal        : http://localhost:3001
echo.

:: Load CF_TUNNEL_TOKEN from environment or root .env (never hardcode tokens in source)
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
    echo [ERROR] CF_TUNNEL_TOKEN is not set!
    echo.
    echo Please set CF_TUNNEL_TOKEN in your root .env file or system environment:
    echo   CF_TUNNEL_TOKEN=^<your_cloudflare_tunnel_token^>
    echo.
    echo Security Notice: Never commit tunnel tokens to git. Rotate any previously
    echo exposed token in the Cloudflare Zero Trust Dashboard.
    echo.
    pause
    exit /b 1
)

echo Connecting to Cloudflare edge network...
echo (Keep this window open to keep the tunnel online)
echo.

if not exist "%~dp0cloudflared.exe" (
    echo [DOWNLOADING] cloudflared.exe not found. Downloading official binary...
    curl -Lo "%~dp0cloudflared.exe" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
)

set "TUNNEL_TOKEN=!CF_TUNNEL_TOKEN!"
set "CF_TUNNEL_TOKEN="

if exist "%~dp0cloudflared.exe" (
    "%~dp0cloudflared.exe" tunnel run
) else (
    echo [FALLBACK] Using Docker for Cloudflare Tunnel...
    docker run --rm -it --name cloudflared -e TUNNEL_TOKEN cloudflare/cloudflared:latest tunnel --no-autoupdate run
)

set "TUNNEL_EXIT=%errorlevel%"
set "TUNNEL_TOKEN="

if %TUNNEL_EXIT% neq 0 (
    echo.
    echo [ERROR] Cloudflare tunnel exited with error code %TUNNEL_EXIT%.
    pause
    exit /b %TUNNEL_EXIT%
)
