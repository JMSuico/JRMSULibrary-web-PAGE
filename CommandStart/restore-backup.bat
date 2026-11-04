@echo off
setlocal enabledelayedexpansion
title JRMSU Library - 1-Click Database Restore

echo ====================================================================
echo   JRMSU LIBRARY - 1-CLICK DATABASE RESTORE
echo ====================================================================
echo.

set "SQL_FILE=%~dp0backups\jrmsu_library_master_backup.sql"
if not exist "!SQL_FILE!" set "SQL_FILE=%~dp0..\JRMSULibrary-web-PAGE\backups\jrmsu_library_master_backup.sql"

if not exist "!SQL_FILE!" (
    echo [ERROR] Backup file not found!
    echo Looked in:
    echo   1. %~dp0backups\jrmsu_library_master_backup.sql
    echo   2. %~dp0..\JRMSULibrary-web-PAGE\backups\jrmsu_library_master_backup.sql
    echo.
    echo Please copy the 'backups' folder from your Laptop to:
    echo   %~dp0backups\
    echo.
    pause
    exit /b 1
)

echo [FOUND] Backup file: !SQL_FILE!
echo [RESTORE] Importing all 30 database tables into PostgreSQL...

docker exec -i jrmsulibrary-web-page-db-1 psql -U jrmsu_admin -d jrmsu_library < "!SQL_FILE!"

if !errorlevel! equ 0 (
    echo.
    echo ====================================================================
    echo   [SUCCESS] DATABASE RESTORED 100%% SUCCESSFULLY!
    echo ====================================================================
    echo All books, accounts, reports, and settings are restored.
) else (
    echo.
    echo [ERROR] Import failed. Please verify that 'AutomaticUp.bat' is running.
)

echo.
pause
