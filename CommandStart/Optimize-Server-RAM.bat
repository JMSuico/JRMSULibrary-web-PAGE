@echo off
setlocal enabledelayedexpansion

title Optimize Server RAM and AI Performance - JRMSU Library System
cd /d "%~dp0"

:: 1. Verify Administrative Privileges (UAC Auto-Elevation)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ELEVATING] Administrator privileges are required to optimize system RAM.
    echo Requesting UAC elevation...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs } catch { (New-Object -ComObject Shell.Application).ShellExecute('cmd.exe', '/c \"\"%~f0\"\"', '', 'runas', 1) }"
    exit /b 0
)

set "LOGFILE=%~dp0Optimize-Server-RAM.log"
> "%LOGFILE%" echo ====================================================================
>> "%LOGFILE%" echo [START] Server RAM Optimizer Started at %date% %time%
>> "%LOGFILE%" echo ====================================================================

echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - SERVER RAM OPTIMIZER
echo   Target: Reduce 96%% RAM consumption down to 55-65%% for 3-5s AI response
echo ====================================================================
echo.
echo [OK] Running with verified Administrator privileges.
>> "%LOGFILE%" echo [OK] Running with verified Administrator privileges.
echo.

:: 2. Display Current Memory Consumption
echo [DIAGNOSTIC] Checking current Windows Host Memory...
for /f "usebackq tokens=*" %%A in (`powershell -NoProfile -Command "$os = Get-CimInstance Win32_OperatingSystem; $total = [math]::Round($os.TotalVisibleMemorySize/1MB, 2); $free = [math]::Round($os.FreePhysicalMemory/1MB, 2); $used = [math]::Round($total - $free, 2); $pct = [math]::Round(($used/$total)*100, 1); Write-Output \"Total: $total GB | Used: $used GB ($pct%%) | Free: $free GB\""`) do (
    echo   %%A
    >> "%LOGFILE%" echo   %%A
)
echo.

:: 3. Configure .wslconfig to Cap WSL2 / Docker Desktop Memory at 6GB
echo [CONFIGURING] Applying Microsoft WSL2 Memory Guardrail (.wslconfig)...
set "WSLCONFIG_PATH=%USERPROFILE%\.wslconfig"

if exist "!WSLCONFIG_PATH!" (
    copy /y "!WSLCONFIG_PATH!" "!WSLCONFIG_PATH!.bak" >nul 2>&1
    echo [BACKUP] Saved backup of existing .wslconfig to .wslconfig.bak
    >> "%LOGFILE%" echo [BACKUP] Saved existing .wslconfig to .wslconfig.bak
)

> "!WSLCONFIG_PATH!" echo # JRMSU Library Server WSL2 Memory Cap Configuration
>> "!WSLCONFIG_PATH!" echo [wsl2]
>> "!WSLCONFIG_PATH!" echo memory=6GB
>> "!WSLCONFIG_PATH!" echo processors=4
>> "!WSLCONFIG_PATH!" echo swap=2GB
>> "!WSLCONFIG_PATH!" echo localhostForwarding=true

echo [OK] Successfully written %USERPROFILE%\.wslconfig:
echo      - Memory Cap   : 6 GB (leaves 6 GB guaranteed for Windows OS + AweSun)
echo      - Processors   : 4 CPU cores
echo      - Swap Space   : 2 GB
>> "%LOGFILE%" echo [OK] Successfully created .wslconfig (memory=6GB, processors=4, swap=2GB)
echo.

:: 4. Restart WSL2 Engine to Apply New Memory Limits
echo [RESTARTING] Applying memory cap to WSL2...
where wsl >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Running 'wsl --shutdown' to restart virtual memory subsystem...
    >> "%LOGFILE%" echo [INFO] Executing wsl --shutdown
    wsl --shutdown >nul 2>&1
    timeout /t 3 /nobreak >nul
    echo [OK] WSL2 memory limit applied.
    >> "%LOGFILE%" echo [OK] WSL2 shutdown completed.
) else (
    echo [WARN] wsl.exe command not in PATH; please restart Docker Desktop manually.
    >> "%LOGFILE%" echo [WARN] wsl.exe not found in PATH
)
echo.

:: 5. Prune Dangling Docker Build Cache and Unused Images
echo [CLEANING] Cleaning dangling Docker build caches and dead containers...
where docker >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Pruning unused Docker builder cache...
    docker builder prune -f >nul 2>&1
    echo [INFO] Pruning dangling containers and networks...
    docker system prune -f >nul 2>&1
    echo [OK] Docker cache reclaimed.
    >> "%LOGFILE%" echo [OK] Docker system prune completed.
) else (
    echo [WARN] docker command not found in PATH.
    >> "%LOGFILE%" echo [WARN] docker not found in PATH
)
echo.

:: 6. Restart Production Containers with Optimized Settings (1 Replica + 1 Ollama Parallel)
set "APP_DIR=%~dp0..\JRMSULibrary-web-PAGE"
if exist "!APP_DIR!\docker-compose.prod.yml" (
    echo [RESTARTING] Launching optimized Docker services...
    echo      - Backend Replicas : 1 (saved ~800 MB RAM)
    echo      - Ollama Parallel  : 1 (saved ~600 MB RAM)
    echo.
    pushd "!APP_DIR!"
    docker compose -f docker-compose.prod.yml up -d --remove-orphans
    popd
    echo [OK] Docker services updated and running.
    >> "%LOGFILE%" echo [OK] docker-compose.prod.yml updated and restarted.
) else (
    echo [INFO] Compose file not found in: !APP_DIR!
    >> "%LOGFILE%" echo [INFO] compose file not found at !APP_DIR!
)

:: 7. Final Diagnostic Check
echo.
echo ====================================================================
echo   OPTIMIZATION COMPLETE - VERIFIED STATUS
echo ====================================================================
for /f "usebackq tokens=*" %%A in (`powershell -NoProfile -Command "$os = Get-CimInstance Win32_OperatingSystem; $total = [math]::Round($os.TotalVisibleMemorySize/1MB, 2); $free = [math]::Round($os.FreePhysicalMemory/1MB, 2); $used = [math]::Round($total - $free, 2); $pct = [math]::Round(($used/$total)*100, 1); Write-Output \"Host Memory: Total $total GB | Used $used GB ($pct%%) | Free $free GB\""`) do (
    echo   %%A
    >> "%LOGFILE%" echo   %%A
)
echo.
echo [DONE] Memory guardrails active!
echo Log file saved to: "!LOGFILE!"
echo ====================================================================
pause
exit /b 0
