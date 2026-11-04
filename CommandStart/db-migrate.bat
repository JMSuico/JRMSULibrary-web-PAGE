@echo off
title JRMSU Library - Database Migration (Django)
cls
echo ======================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY -- RUNNING MIGRATIONS
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" migrate
pause
