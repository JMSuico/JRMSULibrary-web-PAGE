@echo off
title JRMSU Library - Hard Refresh and Cache Purge
cls
echo ======================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY -- HARD REFRESH AND CLEAN REBUILD
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" refresh
pause
