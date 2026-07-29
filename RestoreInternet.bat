@echo off
setlocal enabledelayedexpansion

:: 1. Request Administrator Privileges (Required for changing IP)
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

echo ========================================================
echo   JRMSU LIBRARY - RESTORE INTERNET CONNECTION
echo ========================================================
echo Resetting your Wi-Fi adapter back to Automatic (DHCP)...
echo This will fix your internet connection.
echo.

set "temp_ps1=%temp%\RestoreIP.ps1"
echo try { > "!temp_ps1!"
echo     $netAdapter = Get-NetAdapter ^| Where-Object { $_.Status -eq 'Up' -and $_.Name -notmatch 'vEthernet^|Virtual^|Loopback' } ^| Select-Object -First 1; >> "!temp_ps1!"
echo     if (-not $netAdapter) { Write-Host 'No active network adapter found!' -ForegroundColor Yellow; exit 0; } >> "!temp_ps1!"
echo     Write-Host ('Fixing Adapter: ' + $netAdapter.Name); >> "!temp_ps1!"
echo     Remove-NetIPAddress -InterfaceAlias $netAdapter.Name -Confirm:$false -ErrorAction SilentlyContinue ^| Out-Null; >> "!temp_ps1!"
echo     Set-NetIPInterface -InterfaceAlias $netAdapter.Name -Dhcp Enabled -ErrorAction SilentlyContinue ^| Out-Null; >> "!temp_ps1!"
echo     Set-DnsClientServerAddress -InterfaceAlias $netAdapter.Name -ResetServerAddresses -ErrorAction SilentlyContinue ^| Out-Null; >> "!temp_ps1!"
echo     Write-Host '[SUCCESS] Wi-Fi is restored to Automatic (DHCP).' -ForegroundColor Green; >> "!temp_ps1!"
echo     Write-Host 'You can now connect to any Wi-Fi network and access the internet.' -ForegroundColor Green; >> "!temp_ps1!"
echo } catch { >> "!temp_ps1!"
echo     Write-Host ('Note: Could not reset IP automatically. ' + $_.Exception.Message) -ForegroundColor Yellow; >> "!temp_ps1!"
echo } >> "!temp_ps1!"

powershell -NoProfile -ExecutionPolicy Bypass -File "!temp_ps1!"
del "!temp_ps1!"

echo.
pause
