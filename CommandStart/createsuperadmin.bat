@echo off
title JRMSU Library - Create SuperAdmin
cls
echo ======================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY -- CREATE SUPERADMIN
echo ======================================================================
echo.
set /p ADMIN_USER="Enter SuperAdmin Username: "
set /p ADMIN_EMAIL="Enter SuperAdmin Email: "
set /p ADMIN_PASS="Enter SuperAdmin Password: "
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" createsuperadmin "%ADMIN_USER%" "%ADMIN_EMAIL%" "%ADMIN_PASS%"
pause
