@echo off
setlocal EnableExtensions DisableDelayedExpansion

title JRMSU Library - Disable Windows Auto-Logon
cd /d "%~dp0"

:: ====================================================================
:: 1. Verify Administrative Privileges (Elevate via UAC if needed)
:: ====================================================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ====================================================================
    echo   [ELEVATING] Requesting Administrator privileges to disable Winlogon...
    echo ====================================================================
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\" %*' -Verb RunAs"
    exit /b 0
)

cls
echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - DISABLE WINDOWS AUTO-LOGON
echo ====================================================================
echo.
echo PURPOSE:
echo   Reverts Windows to standard manual login security.
echo   Upon system reboot, Windows will halt at the lock screen and require
echo   the user to enter a password or PIN before granting desktop access.
echo ====================================================================
echo.

set "WINLOGON_KEY=HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"

echo [1/3] Disabling AutoAdminLogon...
reg add "%WINLOGON_KEY%" /v AutoAdminLogon /t REG_SZ /d "0" /f >nul
if %errorlevel% equ 0 (
    echo [OK] AutoAdminLogon set to 0 (Auto-Logon Disabled).
) else (
    echo [ERROR] Failed to update AutoAdminLogon in registry!
)

echo [2/3] Disabling ForceAutoLogon...
reg add "%WINLOGON_KEY%" /v ForceAutoLogon /t REG_SZ /d "0" /f >nul
if %errorlevel% equ 0 (
    echo [OK] ForceAutoLogon set to 0.
) else (
    echo [WARN] Could not update ForceAutoLogon.
)

echo [3/3] Purging DefaultPassword from Windows Registry...
reg delete "%WINLOGON_KEY%" /v DefaultPassword /f >nul 2>&1
echo [OK] DefaultPassword has been deleted and scrubbed from registry.

echo.
echo ====================================================================
echo   SUCCESS: WINDOWS AUTO-LOGON HAS BEEN SAFELY DISABLED!
echo ====================================================================
echo.
echo Current Registry Status:
reg query "%WINLOGON_KEY%" /v AutoAdminLogon 2>nul | findstr /i "AutoAdminLogon"
reg query "%WINLOGON_KEY%" /v ForceAutoLogon 2>nul | findstr /i "ForceAutoLogon"
reg query "%WINLOGON_KEY%" /v DefaultPassword >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARN] DefaultPassword still exists in registry!
) else (
    echo [OK] DefaultPassword is NOT present in registry.
)
echo.
echo On next restart, Windows will display the normal Sign-in / Lock Screen.
echo To re-enable Auto-Logon at any time, run: Setup-Windows-AutoLogon.bat
echo ====================================================================
echo.
pause
exit /b 0
