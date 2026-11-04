@echo off
setlocal enabledelayedexpansion

title JRMSU Library - Test AutoStart and Launch System

echo ========================================================
echo   JRMSU LIBRARY - 1-CLICK PERMANENT AUTOSTART TEST
echo ========================================================
echo.
echo Delegating to unified launcher (AutomaticUp.bat)...
echo.

call "%~dp0AutomaticUp.bat"
exit /b %errorlevel%
