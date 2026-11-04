@echo off
setlocal EnableExtensions DisableDelayedExpansion

title JRMSU Library - Setup Windows Auto-Logon (Unattended Morning Boot)
cd /d "%~dp0"

:: ====================================================================
:: 1. Verify Administrative Privileges (Elevate via UAC if needed)
:: ====================================================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ====================================================================
    echo   [ELEVATING] Requesting Administrator privileges...
    echo ====================================================================
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\" %*' -Verb RunAs"
    exit /b 0
)

cls
echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - WINDOWS AUTO-LOGON CONFIGURATOR
echo   (Automated Morning Boot and Power-Outage Recovery Architecture)
echo ====================================================================
echo.
echo PURPOSE:
echo   Enables the Library Server PC to boot straight into the Windows desktop
echo   without getting stuck at the Windows Sign-in / Lock Screen.
echo.
echo WHY THIS IS REQUIRED:
echo   The JRMSU Library stack (Docker Desktop, WSL2, PostgreSQL, Vite,
echo   ASP.NET Core backend, and AutomaticUp.bat) runs inside the user session.
echo   If power fails or the PC is turned on in the morning, Windows normally
echo   halts at the lock screen until someone types a password.
echo   With Auto-Logon enabled:
echo     1. BIOS powers on PC (e.g. after brownout/power restoration).
echo     2. Windows boots and logs in automatically.
echo     3. Startup programs trigger AutomaticUp.bat automatically.
echo     4. Library system is fully online with 0 manual intervention!
echo ====================================================================
echo.

:: ====================================================================
:: 2. Detect User Account & Domain
:: ====================================================================
set "DETECTED_USER=%USERNAME%"
if "%DETECTED_USER%"=="" (
    for /f "usebackq tokens=*" %%U in (`powershell -NoProfile -Command "((Get-CimInstance Win32_ComputerSystem).UserName -split '\\')[-1]" 2^>nul`) do (
        set "DETECTED_USER=%%U"
    )
)
if "%DETECTED_USER%"=="" set "DETECTED_USER=User"

set "DETECTED_DOMAIN=%USERDOMAIN%"
if "%DETECTED_DOMAIN%"=="" set "DETECTED_DOMAIN=%COMPUTERNAME%"

:: Support command line arguments: Setup-Windows-AutoLogon.bat [username] [password] [domain]
set "TARGET_USER=%~1"
set "TARGET_PASS=%~2"
set "TARGET_DOMAIN=%~3"

:: ====================================================================
:: 3. Prompt for Username (if not supplied via CLI)
:: ====================================================================
if "%TARGET_USER%"=="" (
    echo [STEP 1/2] Windows User Account Configuration
    echo Current active username detected: [%DETECTED_USER%]
    set /p "TARGET_USER=Enter Windows Username to Auto-Logon (Press ENTER for [%DETECTED_USER%]): "
)
if "%TARGET_USER%"=="" set "TARGET_USER=%DETECTED_USER%"

if "%TARGET_DOMAIN%"=="" (
    set "TARGET_DOMAIN=%DETECTED_DOMAIN%"
)

:: ====================================================================
:: 4. Prompt for Password (if not supplied via CLI)
:: ====================================================================
if "%TARGET_PASS%"=="" (
    echo.
    echo [STEP 2/2] Windows Account Password Configuration
    echo Target User: %TARGET_USER%
    echo.
    echo NOTE:
    echo   - If your Windows user account has a password, enter it below.
    echo   - If your account has NO password (blank), simply press ENTER.
    echo   - Auto-Logon will fail if a password exists but is not entered here.
    echo.
    set /p "TARGET_PASS=Enter Windows Password (or press ENTER if none): "
)

echo.
echo ====================================================================
echo [APPLYING] Writing Winlogon configuration to Windows Registry...
echo ====================================================================

:: ====================================================================
:: 5. Configure Winlogon Registry Keys (HKLM)
:: ====================================================================
set "WINLOGON_KEY=HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"

:: 5.1 Enable AutoAdminLogon
reg add "%WINLOGON_KEY%" /v AutoAdminLogon /t REG_SZ /d "1" /f >nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to set AutoAdminLogon in registry!
    goto :failure
)
echo [OK] AutoAdminLogon = 1 (Auto-Logon Enabled)

:: 5.2 Set DefaultUserName
reg add "%WINLOGON_KEY%" /v DefaultUserName /t REG_SZ /d "%TARGET_USER%" /f >nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to set DefaultUserName in registry!
    goto :failure
)
echo [OK] DefaultUserName = %TARGET_USER%

:: 5.3 Set DefaultDomainName
reg add "%WINLOGON_KEY%" /v DefaultDomainName /t REG_SZ /d "%TARGET_DOMAIN%" /f >nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to set DefaultDomainName in registry!
    goto :failure
)
echo [OK] DefaultDomainName = %TARGET_DOMAIN%

:: 5.4 Set ForceAutoLogon
reg add "%WINLOGON_KEY%" /v ForceAutoLogon /t REG_SZ /d "1" /f >nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to set ForceAutoLogon in registry!
    goto :failure
)
echo [OK] ForceAutoLogon = 1 (Forces Auto-Logon on reboot/logoff)

:: 5.5 Set or Clear DefaultPassword
if not "%TARGET_PASS%"=="" (
    reg add "%WINLOGON_KEY%" /v DefaultPassword /t REG_SZ /d "%TARGET_PASS%" /f >nul
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to set DefaultPassword in registry!
        goto :failure
    )
    echo [OK] DefaultPassword = [Configured Successfully]
) else (
    reg delete "%WINLOGON_KEY%" /v DefaultPassword /f >nul 2>&1
    echo [INFO] DefaultPassword = [Cleared - Empty Password Mode]
)

:: 5.6 Windows 10/11 Windows Hello Compatibility Fix
:: If DevicePasswordLessBuildVersion is set to 2, Windows suppresses Winlogon AutoLogon.
:: Setting to 0 restores standard Winlogon credential provider compatibility.
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device" /v DevicePasswordLessBuildVersion /t REG_DWORD /d 0 /f >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] DevicePasswordLessBuildVersion = 0 (Windows Hello lock screen override disabled)
)

echo.
echo ====================================================================
echo   SUCCESS! WINDOWS AUTO-LOGON IS NOW FULLY CONFIGURED!
echo ====================================================================
echo.
echo VERIFICATION SUMMARY:
reg query "%WINLOGON_KEY%" /v AutoAdminLogon 2>nul | findstr /i "AutoAdminLogon"
reg query "%WINLOGON_KEY%" /v DefaultUserName 2>nul | findstr /i "DefaultUserName"
reg query "%WINLOGON_KEY%" /v DefaultDomainName 2>nul | findstr /i "DefaultDomainName"
reg query "%WINLOGON_KEY%" /v ForceAutoLogon 2>nul | findstr /i "ForceAutoLogon"
if not "%TARGET_PASS%"=="" (
    echo     DefaultPassword        REG_SZ        [PROTECTED / CONFIGURED]
) else (
    echo     DefaultPassword        REG_SZ        [EMPTY / NOT SET]
)
echo.
echo --------------------------------------------------------------------
echo HOW TO TEST:
echo   1. Save your open work.
echo   2. Restart the PC (or type: shutdown /r /t 10).
echo   3. Do not touch keyboard or mouse.
echo   4. Confirm Windows boots straight to Desktop and AutomaticUp.bat runs!
echo.
echo HOW TO REVERT / DISABLE:
echo   Run "Disable-Windows-AutoLogon.bat" from this CommandStart folder.
echo.
echo TIP FOR 100%% UNATTENDED POWER OUTAGE RECOVERY:
echo   Enter PC BIOS/UEFI (press DEL/F2 on boot), look for "Power Management"
echo   or "AC Back" and set: "Restore on AC Power Loss" = "Power ON".
echo --------------------------------------------------------------------
echo.
pause
exit /b 0

:failure
echo.
echo [FATAL ERROR] Failed to configure Windows Auto-Logon registry settings.
echo Please ensure you are running as an Administrator and Antivirus is not blocking registry changes.
echo.
pause
exit /b 1
