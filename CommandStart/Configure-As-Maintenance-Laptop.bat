@echo off
setlocal enabledelayedexpansion

title JRMSU Library - Configure As Maintenance Laptop (Role De-escalation)
cd /d "%~dp0"

:: 1. Verify Administrative Privileges (Elevate if needed)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ELEVATING] Requesting Administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$psi = New-Object System.Diagnostics.ProcessStartInfo; $psi.FileName = 'cmd.exe'; $psi.Arguments = '/c \"\"%~f0\"\"'; $psi.Verb = 'runas'; $psi.UseShellExecute = $true; $psi.ErrorDialog = $true; try { [System.Diagnostics.Process]::Start($psi) | Out-Null } catch { Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs }"
    exit /b 0
)

set "LOGFILE=%~dp0Configure-As-Maintenance-Laptop.log"
> "%LOGFILE%" echo ====================================================================
>> "%LOGFILE%" echo [START] Configure As Maintenance Laptop Cleanup Started at %date% %time%
>> "%LOGFILE%" echo ====================================================================

echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - MAINTENANCE ROLE CONFIGURATION
echo   (De-escalates laptop from 24/7 Production Host to Maintenance Node)
echo ====================================================================
echo.

:: 2. Set Machine Role to MAINTENANCE
echo [ROLE] Marking machine role as MAINTENANCE...
>> "%LOGFILE%" echo [ROLE] Writing MAINTENANCE to MachineRole.txt
> "%~dp0MachineRole.txt" echo MAINTENANCE
if exist "%APPDATA%\JRMSULibrary" (
    > "%APPDATA%\JRMSULibrary\MachineRole.txt" echo MAINTENANCE
)
echo [OK] MachineRole.txt configured with role: MAINTENANCE
>> "%LOGFILE%" echo [ROLE] MachineRole.txt successfully updated.
echo.

:: 3. Stop and Uninstall Cloudflared Windows Service
echo [TUNNEL] Stopping Cloudflared agent Windows Service...
>> "%LOGFILE%" echo [TUNNEL] Stopping Cloudflared service...
net stop Cloudflared >> "%LOGFILE%" 2>&1
sc stop Cloudflared >> "%LOGFILE%" 2>&1

echo [TUNNEL] Uninstalling Cloudflared agent Windows Service...
>> "%LOGFILE%" echo [TUNNEL] Uninstalling Cloudflared service...
if exist "%~dp0cloudflared.exe" (
    "%~dp0cloudflared.exe" service uninstall >> "%LOGFILE%" 2>&1
)
sc delete Cloudflared >> "%LOGFILE%" 2>&1
echo [OK] Cloudflared Windows service stopped and uninstalled.
>> "%LOGFILE%" echo [TUNNEL] Cloudflared service uninstalled.
echo.

:: 4. Terminate Lingering cloudflared.exe Processes
echo [PROCESS] Terminating any lingering cloudflared processes...
>> "%LOGFILE%" echo [PROCESS] Terminating cloudflared processes...
taskkill /f /im cloudflared.exe >> "%LOGFILE%" 2>&1
echo [OK] Lingering cloudflared processes terminated.
>> "%LOGFILE%" echo [PROCESS] cloudflared taskkill completed.
echo.

:: 5. Delete 24/7 Watchdog Scheduled Task and Scripts
echo [WATCHDOG] Removing 24/7 Watchdog scheduled task and scripts...
>> "%LOGFILE%" echo [WATCHDOG] Deleting JRMSU_Library_247_Watchdog scheduled task...
schtasks /delete /tn "JRMSU_Library_247_Watchdog" /f >> "%LOGFILE%" 2>&1
del "%APPDATA%\JRMSULibrary\Watchdog.bat" >> "%LOGFILE%" 2>&1
del "%APPDATA%\JRMSULibrary\Watchdog.vbs" >> "%LOGFILE%" 2>&1
echo [OK] JRMSU_Library_247_Watchdog scheduled task removed.
>> "%LOGFILE%" echo [WATCHDOG] Scheduled task cleanup finished.
echo.

:: 6. Delete Registry Run Key
echo [REGISTRY] Removing user auto-start registry key...
>> "%LOGFILE%" echo [REGISTRY] Removing HKCU Run key...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "JRMSU_Library_System" /f >> "%LOGFILE%" 2>&1
echo [OK] Registry key JRMSU_Library_System removed.
>> "%LOGFILE%" echo [REGISTRY] Registry cleanup finished.
echo.

:: 7. Clean Windows Startup Folder
echo [STARTUP] Removing Startup folder batch and legacy scripts...
>> "%LOGFILE%" echo [STARTUP] Cleaning Startup folder...
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
del "%STARTUP_FOLDER%\JRMSU_Library_AutoStart.bat" >> "%LOGFILE%" 2>&1
del "%STARTUP_FOLDER%\JRMSU_Library_AutoStart.vbs" >> "%LOGFILE%" 2>&1
del "%STARTUP_FOLDER%\SilentStartDockerWSL.vbs" >> "%LOGFILE%" 2>&1
echo [OK] Startup folder batch and scripts removed.
>> "%LOGFILE%" echo [STARTUP] Startup folder cleaned.
echo.

:: 8. Clear Startup Lock
del "%TEMP%\jrmsu_startup.lock" >> "%LOGFILE%" 2>&1

echo ====================================================================
echo   [SUCCESS] MACHINE SUCCESSFULLY CONFIGURED AS MAINTENANCE LAPTOP!
echo ====================================================================
echo.
echo - Role:               MAINTENANCE (%~dp0MachineRole.txt)
echo - Cloudflare Tunnel:  UNINSTALLED and TERMINATED
echo - Watchdog Task:      REMOVED (JRMSU_Library_247_Watchdog)
echo - Windows Auto-Start: DISABLED (Registry + Startup folder cleared)
echo.
echo This maintenance laptop will NEVER hijack production Cloudflare
echo traffic or start automatically upon laptop boot.
echo ====================================================================
echo.

>> "%LOGFILE%" echo [SUCCESS] CLEANUP_SUCCESS
>> "%LOGFILE%" echo [END] Finished at %date% %time%

timeout /t 3 >nul 2>&1
exit /b 0
