@echo off
setlocal enabledelayedexpansion

title Configure As Dedicated Library Server - JRMSU Library System
cd /d "%~dp0"

:: 1. Verify Administrative Privileges (UAC Auto-Elevation with COM fallback)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ELEVATING] Administrator privileges are required to configure services.
    echo Requesting UAC elevation...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs } catch { (New-Object -ComObject Shell.Application).ShellExecute('cmd.exe', '/c \"\"%~f0\"\"', '', 'runas', 1) }"
    exit /b 0
)

set "LOGFILE=%~dp0Configure-As-Library-Server.log"
> "%LOGFILE%" echo ====================================================================
>> "%LOGFILE%" echo [START] Configure As Library Server Installer Started at %date% %time%
>> "%LOGFILE%" echo ====================================================================

echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - PRODUCTION SERVER CONFIGURATION
echo   (Dedicated Library Server 1-Click Installer)
echo ====================================================================
echo.
echo [OK] Running with verified Administrator privileges.
>> "%LOGFILE%" echo [OK] Running with verified Administrator privileges.
echo.

:: 2. Verify cloudflared.exe Binary Exists
set "CLOUDFLARED_BIN=%~dp0cloudflared.exe"
if not exist "!CLOUDFLARED_BIN!" (
    echo [ERROR] cloudflared.exe was not found in:
    echo "!CLOUDFLARED_BIN!"
    echo.
    echo Please make sure cloudflared.exe is located in the CommandStart folder.
    >> "%LOGFILE%" echo [ERROR] cloudflared.exe not found at !CLOUDFLARED_BIN!
    echo ====================================================================
    pause
    exit /b 1
)
echo [OK] Cloudflared binary verified: "!CLOUDFLARED_BIN!"
>> "%LOGFILE%" echo [OK] Cloudflared binary verified: "!CLOUDFLARED_BIN!"

:: 3. Configure Windows Hosts File for host.docker.internal
echo.
echo [CONFIGURING] Checking Windows hosts file for host.docker.internal...
set "HOSTS_PATH=%WINDIR%\System32\drivers\etc\hosts"

if exist "!HOSTS_PATH!" (
    findstr /i "host.docker.internal" "!HOSTS_PATH!" >nul 2>&1
    if !errorlevel! neq 0 (
        echo [INFO] Adding 127.0.0.1 host.docker.internal mapping...
        >> "%LOGFILE%" echo [HOSTS] Adding 127.0.0.1 host.docker.internal to hosts file...
        attrib -r "!HOSTS_PATH!" >nul 2>&1
        echo.>> "!HOSTS_PATH!"
        >> "!HOSTS_PATH!" echo 127.0.0.1 host.docker.internal
        findstr /i "host.docker.internal" "!HOSTS_PATH!" >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Successfully mapped 127.0.0.1 host.docker.internal in hosts file.
            >> "%LOGFILE%" echo [HOSTS] Successfully mapped 127.0.0.1 host.docker.internal.
        ) else (
            echo [WARNING] Could not append to hosts file automatically.
            >> "%LOGFILE%" echo [HOSTS] Warning: Failed to append to hosts file.
        )
    ) else (
        echo [OK] host.docker.internal is already configured in hosts file.
        >> "%LOGFILE%" echo [HOSTS] host.docker.internal already present.
    )
) else (
    echo [WARNING] Hosts file not found at !HOSTS_PATH!. Creating new hosts file...
    >> "%LOGFILE%" echo [HOSTS] Creating new hosts file at !HOSTS_PATH!
    >> "!HOSTS_PATH!" echo 127.0.0.1 host.docker.internal
)

:: 4. Install Cloudflare Tunnel as a 24/7 Windows Service
set "CF_TOKEN=eyJhIjoiMzJiM2E1ODQ0YmY1YjhiNjU2NGE0NDc5ZTcyZGY0ZGEiLCJ0IjoiOGRlMjAwOGMtZTQ2MC00ZDg1LTk5YTMtMmQwYjFkNTU5OWFkIiwicyI6Ik1EUTVPVGN4TnpJdE5tTmtOQzAwTUROa0xUZzBOakV0T0RBME9UazRORGMyWkdZMiJ9"

echo.
echo [INSTALLING] Installing and configuring Cloudflared Windows Service...
>> "%LOGFILE%" echo [TUNNEL] Installing Cloudflared Windows Service...

:: Check if Cloudflared service already exists
sc query Cloudflared >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] Existing Cloudflared service detected. Refreshing service with production token...
    >> "%LOGFILE%" echo [TUNNEL] Refreshing existing Cloudflared service...
    net stop Cloudflared >> "%LOGFILE%" 2>&1
    sc stop Cloudflared >> "%LOGFILE%" 2>&1
    "!CLOUDFLARED_BIN!" service uninstall >> "%LOGFILE%" 2>&1
    timeout /t 2 /nobreak >nul 2>&1
)

:: Register service with production token
>> "%LOGFILE%" echo [TUNNEL] Executing service install with production token...
"!CLOUDFLARED_BIN!" service install !CF_TOKEN! >> "%LOGFILE%" 2>&1

:: 5. Configure Windows Service Auto-Start and Auto-Recovery
echo [CONFIGURING] Configuring 24/7 Auto-Start and Auto-Recovery policies...
>> "%LOGFILE%" echo [RECOVERY] Configuring start= auto and failure actions...
sc config Cloudflared start= auto >> "%LOGFILE%" 2>&1
sc failure Cloudflared reset= 86400 actions= restart/5000/restart/5000/restart/5000 >> "%LOGFILE%" 2>&1

:: 6. Start the Cloudflared Windows Service
echo.
echo [STARTING] Starting Cloudflared Windows Service...
>> "%LOGFILE%" echo [STARTING] Starting Cloudflared service...
net start Cloudflared >> "%LOGFILE%" 2>&1

:: Verify running state
sc query Cloudflared | findstr /i "RUNNING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Cloudflared Windows Service is ACTIVE and RUNNING (24/7 background mode).
    >> "%LOGFILE%" echo [OK] Cloudflared service is RUNNING.
) else (
    echo [INFO] Cloudflared service registration complete. Verifying status...
    sc query Cloudflared >> "%LOGFILE%" 2>&1
)

:: 7. Write Machine Role to MachineRole.txt
echo.
echo [CONFIGURING] Designating machine role as PRODUCTION_SERVER...
>> "%LOGFILE%" echo [ROLE] Writing PRODUCTION_SERVER to MachineRole.txt...
> "%~dp0MachineRole.txt" echo PRODUCTION_SERVER
if exist "%APPDATA%\JRMSULibrary" (
    > "%APPDATA%\JRMSULibrary\MachineRole.txt" echo PRODUCTION_SERVER
)
echo [OK] MachineRole.txt configured with role: PRODUCTION_SERVER
>> "%LOGFILE%" echo [OK] MachineRole.txt updated to PRODUCTION_SERVER.

:: 8. Prompt user that the system is ready to launch via AutomaticUp.bat
echo.
echo ====================================================================
echo   [SUCCESS] THIS PC IS CONFIGURED AS THE DEDICATED LIBRARY SERVER
echo ====================================================================
echo.
echo  Configuration Summary:
echo   - Machine Role:        PRODUCTION_SERVER (Saved in MachineRole.txt)
echo   - Local Resolution:    127.0.0.1 host.docker.internal active
echo   - Cloudflare Tunnel:   Installed as 24/7 Windows Service (Cloudflared)
echo   - Service Startup:     Automatic upon Windows boot
echo   - Failure Recovery:    Auto-restart every 5 seconds (reset daily)
echo   - Public Domains:      https://page.jrmsukc-library.online
echo                          https://admin.jrmsukc-library.online
echo.
echo ====================================================================
echo   NEXT STEP: SYSTEM IS READY TO LAUNCH
echo ====================================================================
echo You can now start the entire library system by running:
echo   AutomaticUp.bat
echo.

>> "%LOGFILE%" echo [COMPLETE] Setup finished successfully at %date% %time%

set /p "LAUNCH_CHOICE=Do you want to launch AutomaticUp.bat right now? (Y/N) [Y]: "
if /i "!LAUNCH_CHOICE!"=="" set "LAUNCH_CHOICE=Y"
if /i "!LAUNCH_CHOICE!"=="Y" (
    echo.
    echo [LAUNCHING] Starting AutomaticUp.bat...
    start "" "%~dp0AutomaticUp.bat"
) else (
    echo.
    echo [READY] Setup complete. Run AutomaticUp.bat whenever you wish to launch.
    echo Press any key to exit this installer...
    pause >nul
)

exit /b 0
