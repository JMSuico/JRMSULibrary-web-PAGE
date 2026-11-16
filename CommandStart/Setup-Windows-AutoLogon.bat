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
    REM Never forward password CLI args across UAC relaunch; re-prompt securely after elevation
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
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
echo ====================================================================
echo   [SECURITY WARNING - READ BEFORE CONTINUING]
echo ====================================================================
echo   1. Physical Security: Auto-Logon signs directly into the desktop at boot.
echo      Keep the Library Server PC in a physically locked room/cabinet.
echo   2. Least Privilege: Prefer a dedicated standard ^(non-Administrator^)
echo      account for Auto-Logon whenever possible.
echo   3. Plaintext vs LSA Encryption: Windows native Winlogon\DefaultPassword
echo      is stored unencrypted in HKLM ^(this script restricts Winlogon ACLs
echo      to Administrators/SYSTEM, but Microsoft Sysinternals Autologon.exe
echo      is STRONGLY RECOMMENDED because it encrypts credentials as an LSA
echo      secret instead of storing DefaultPassword in the registry^).
echo   4. Never pass passwords as command-line arguments in automated scripts.
echo ====================================================================
echo.

:: ====================================================================
:: 2. Detect Microsoft Sysinternals Autologon.exe (Recommended LSA Mode)
:: ====================================================================
set "SYSINTERNALS_AUTOLOGON="
for %%B in ("%~dp0Autologon64.exe" "%~dp0Autologon.exe") do (
    if not defined SYSINTERNALS_AUTOLOGON if exist "%%~B" set "SYSINTERNALS_AUTOLOGON=%%~B"
)
if not defined SYSINTERNALS_AUTOLOGON (
    for %%B in (Autologon64.exe Autologon.exe) do (
        if not defined SYSINTERNALS_AUTOLOGON (
            for /f "delims=" %%P in ('where %%B 2^>nul') do (
                if not defined SYSINTERNALS_AUTOLOGON if exist "%%~P" set "SYSINTERNALS_AUTOLOGON=%%~P"
            )
        )
    )
)

if defined SYSINTERNALS_AUTOLOGON (
    echo [RECOMMENDED] Microsoft Sysinternals Autologon detected:
    echo   "%SYSINTERNALS_AUTOLOGON%"
    echo   Using Sysinternals Autologon stores the password as an encrypted LSA
    echo   secret rather than plaintext DefaultPassword in the registry.
    echo.
    set "USE_SYSINTERNALS=Y"
    set /p "USE_SYSINTERNALS=Launch Sysinternals Autologon instead of native registry setup? (Y/N) [Default: Y]: "
    if /i "%USE_SYSINTERNALS%"=="Y" (
        echo [LAUNCHING] Starting "%SYSINTERNALS_AUTOLOGON%"...
        start "" "%SYSINTERNALS_AUTOLOGON%"
        echo.
        echo Tip: Also run "reg add HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device /v DevicePasswordLessBuildVersion /t REG_DWORD /d 0 /f"
        echo if Windows 10/11 Windows Hello blocks Auto-Logon.
        pause
        exit /b 0
    )
    echo.
) else (
    echo [RECOMMENDATION] Sysinternals Autologon.exe was not found next to this script
    echo   or in PATH. For strongest security ^(LSA-encrypted secret^), download it from:
    echo   https://learn.microsoft.com/sysinternals/downloads/autologon
    echo   and place Autologon.exe in "%~dp0" before re-running.
    echo.
)

:: ====================================================================
:: 3. Detect User Account & Domain
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

:: Support optional CLI args for username/domain (avoid passing password via CLI)
set "TARGET_USER=%~1"
set "TARGET_PASS=%~2"
set "TARGET_DOMAIN=%~3"

if not "%TARGET_PASS%"=="" (
    echo [WARNING] Password was supplied via CLI argument. Clear terminal history
    echo           and prefer interactive masked prompt in the future.
    echo.
)

:: ====================================================================
:: 4. Prompt for Username (if not supplied via CLI)
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
:: 5. Configure Winlogon Registry Keys (HKLM) Without Echoing/Logging Passwords
:: ====================================================================
set "WINLOGON_KEY=HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"

echo.
echo ====================================================================
echo [STEP 2/2] Windows Account Password & Registry Configuration
echo   Target User   : %TARGET_USER%
echo   Target Domain : %TARGET_DOMAIN%
echo ====================================================================
echo.

:: Prompt securely via PowerShell Read-Host -AsSecureString if password not supplied,
:: and write DefaultPassword directly via .NET Registry API (never echoed, never in CLI args).
if "%TARGET_PASS%"=="" (
    echo Enter Windows Password below ^(input is masked; press ENTER if account has no password^):
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "$sec = Read-Host -Prompt 'Windows Password' -AsSecureString; " ^
        "$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec); " ^
        "try { " ^
        "  $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr); " ^
        "  $key = [Microsoft.Win32.Registry]::LocalMachine.OpenSubKey('SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon', $true); " ^
        "  if (-not $key) { throw 'Cannot open Winlogon registry key.' }; " ^
        "  if ([string]::IsNullOrEmpty($plain)) { " ^
        "    if ($key.GetValueNames() -contains 'DefaultPassword') { $key.DeleteValue('DefaultPassword') }; " ^
        "    Write-Output '[INFO] DefaultPassword = [Cleared - Empty Password Mode]'; " ^
        "  } else { " ^
        "    $key.SetValue('DefaultPassword', $plain, [Microsoft.Win32.RegistryValueKind]::String); " ^
        "    Write-Output '[OK] DefaultPassword = [Configured Securely - Not Echoed]'; " ^
        "  }; " ^
        "  $key.Close(); " ^
        "} finally { " ^
        "  if ($bstr -ne [IntPtr]::Zero) { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }; " ^
        "  $plain = $null; " ^
        "}"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to configure DefaultPassword in registry!
        goto :failure
    )
) else (
    set "_AUTOLOGON_PASS=%TARGET_PASS%"
    set "TARGET_PASS="
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "$plain = $env:_AUTOLOGON_PASS; " ^
        "$key = [Microsoft.Win32.Registry]::LocalMachine.OpenSubKey('SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon', $true); " ^
        "if (-not $key) { throw 'Cannot open Winlogon registry key.' }; " ^
        "$key.SetValue('DefaultPassword', $plain, [Microsoft.Win32.RegistryValueKind]::String); " ^
        "$key.Close(); " ^
        "Write-Output '[OK] DefaultPassword = [Configured Securely - Not Echoed]'"
    set "_AUTOLOGON_PASS="
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to configure DefaultPassword in registry!
        goto :failure
    )
)
set "TARGET_PASS="

echo.
echo [APPLYING] Writing remaining Winlogon configuration...

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

:: 5.5 Windows 10/11 Windows Hello Compatibility Fix
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device" /v DevicePasswordLessBuildVersion /t REG_DWORD /d 0 /f >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] DevicePasswordLessBuildVersion = 0 (Windows Hello lock screen override disabled)
)

:: 5.6 Restrict Winlogon Registry Permissions (Block non-admin local users from reading DefaultPassword)
echo [HARDENING] Restricting Winlogon registry ACLs to Administrators and SYSTEM...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { " ^
    "  $path = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'; " ^
    "  $acl = Get-Acl -Path $path; " ^
    "  $acl.SetAccessRuleProtection($true, $true); " ^
    "  $blocked = @('BUILTIN\Users', 'NT AUTHORITY\Authenticated Users', 'Everyone', 'APPLICATION PACKAGE AUTHORITY\ALL APPLICATION PACKAGES'); " ^
    "  foreach ($rule in @($acl.Access)) { " ^
    "    if ($blocked -contains $rule.IdentityReference.Value) { [void]$acl.RemoveAccessRule($rule) } " ^
    "  }; " ^
    "  $adminRule = New-Object System.Security.AccessControl.RegistryAccessRule('BUILTIN\Administrators', 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow'); " ^
    "  $sysRule = New-Object System.Security.AccessControl.RegistryAccessRule('NT AUTHORITY\SYSTEM', 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow'); " ^
    "  $acl.SetAccessRule($adminRule); " ^
    "  $acl.SetAccessRule($sysRule); " ^
    "  Set-Acl -Path $path -AclObject $acl; " ^
    "  Write-Output '[OK] Winlogon registry ACL hardened (standard Users read access removed).'; " ^
    "} catch { " ^
    "  Write-Output ('[WARNING] Could not tighten Winlogon ACLs automatically: ' + $_.Exception.Message); " ^
    "  Write-Output '          Recommend switching to Microsoft Sysinternals Autologon.exe (LSA secret).'; " ^
    "}"

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
reg query "%WINLOGON_KEY%" /v DefaultPassword >nul 2>&1
if %errorlevel% equ 0 (
    echo     DefaultPassword        REG_SZ        [PROTECTED / CONFIGURED - NEVER ECHOED]
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
set "TARGET_PASS="
set "_AUTOLOGON_PASS="
echo.
echo [FATAL ERROR] Failed to configure Windows Auto-Logon registry settings.
echo Please ensure you are running as an Administrator and Antivirus is not blocking registry changes.
echo.
pause
exit /b 1
