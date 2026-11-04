@echo off
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
echo Connecting to Cloudflare edge network...
echo (Keep this window open to keep the tunnel online)
echo.

set "CF_TOKEN=eyJhIjoiMzJiM2E1ODQ0YmY1YjhiNjU2NGE0NDc5ZTcyZGY0ZGEiLCJ0IjoiOGRlMjAwOGMtZTQ2MC00ZDg1LTk5YTMtMmQwYjFkNTU5OWFkIiwicyI6Ik1EUTVPVGN4TnpJdE5tTmtOQzAwTUROa0xUZzBOakV0T0RBME9UazRORGMyWkdZMiJ9"

if not exist "%~dp0cloudflared.exe" (
    echo [DOWNLOADING] cloudflared.exe not found. Downloading official binary...
    curl -Lo "%~dp0cloudflared.exe" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
)

if exist "%~dp0cloudflared.exe" (
    "%~dp0cloudflared.exe" tunnel run --token %CF_TOKEN%
) else (
    echo [FALLBACK] Using Docker for Cloudflare Tunnel...
    docker run --rm -it --name cloudflared cloudflare/cloudflared:latest tunnel --no-autoupdate run --token %CF_TOKEN%
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Cloudflare tunnel exited with error code %errorlevel%.
    pause
)
