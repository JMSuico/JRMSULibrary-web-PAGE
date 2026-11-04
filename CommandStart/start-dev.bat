@echo off
title JRMSU Library - Starting Services [Backend :8000 | Frontend :3000]
cls
echo ======================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY -- STARTING DEV ENVIRONMENT
echo   Backend (:8000) ^| Frontend (:3000) ^| SQL Server (:1433)
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" start
pause
