@echo off
setlocal enabledelayedexpansion
title Uninstall Cloudflare Tunnel Service - JRMSU Library System
cd /d "%~dp0"

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ELEVATING] Requesting Administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs } catch { (New-Object -ComObject Shell.Application).ShellExecute('cmd.exe', '/c \"\"%~f0\"\"', '', 'runas', 1) }"
    exit /b 0
)

echo [STOPPING] Stopping Cloudflared agent service and background processes...
net stop Cloudflared >nul 2>&1
sc stop Cloudflared >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
docker stop cloudflared >nul 2>&1

echo [UNINSTALLING] Removing Cloudflared agent service...
if exist "%~dp0cloudflared.exe" (
    "%~dp0cloudflared.exe" service uninstall >nul 2>&1
)
sc delete Cloudflared >nul 2>&1

echo.
echo [OK] Cloudflared service removed and processes stopped.
pause
