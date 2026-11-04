@echo off
title JRMSU Library - Stopping Services [Ports 8000, 3000]
cls
echo ======================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY -- STOPPING DEV SERVICES
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" stop
pause
