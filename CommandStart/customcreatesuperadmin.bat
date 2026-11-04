@echo off
title JRMSU Library - Create Custom SuperAdmin
cls
echo ======================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY -- CREATE CUSTOM SUPERADMIN
echo ======================================================================
echo.
set /p ADMIN_USER="Enter Custom SuperAdmin Username: "
set /p ADMIN_EMAIL="Enter Custom SuperAdmin Email: "
set /p ADMIN_PASS="Enter Custom SuperAdmin Password: "
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" createsuperadmin "%ADMIN_USER%" "%ADMIN_EMAIL%" "%ADMIN_PASS%"
pause
