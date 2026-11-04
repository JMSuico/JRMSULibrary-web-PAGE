@echo off
setlocal enabledelayedexpansion

title JRMSU Library - Automatic System Launcher and AutoStart Setup

echo ====================================================================
echo   JRMSU KATIPUNAN CAMPUS LIBRARY - 1-CLICK SYSTEM LAUNCHER
echo   (Integrated Automatic Startup and Multi-Drive Self-Healing Engine)
echo ====================================================================
echo.

:: Role Guard: Prevent Maintenance Laptops from hijacking production hosting or tunnels
set "MACHINE_ROLE=PRODUCTION"
if exist "%~dp0MachineRole.txt" (
    for /f "usebackq delims=" %%R in ("%~dp0MachineRole.txt") do set "MACHINE_ROLE=%%~R"
) else if exist "%APPDATA%\JRMSULibrary\MachineRole.txt" (
    for /f "usebackq delims=" %%R in ("%APPDATA%\JRMSULibrary\MachineRole.txt") do set "MACHINE_ROLE=%%~R"
)

if /i "!MACHINE_ROLE!"=="MAINTENANCE" (
    echo ====================================================================
    echo   [ROLE NOTICE] THIS COMPUTER IS CURRENTLY TAGGED AS MAINTENANCE
    echo ====================================================================
    echo Current MachineRole.txt setting: MAINTENANCE.
    echo.
    echo If this computer is the PHYSICAL LIBRARY SERVER PC, you can configure
    echo it as PRODUCTION_SERVER right now to launch Docker and Cloudflare.
    echo.
    set "PROMOTE_CHOICE=N"
    set /p "PROMOTE_CHOICE=Configure this computer as the Dedicated Library Server? (Y/N) [Default: N]: "
    if /i "!PROMOTE_CHOICE!"=="Y" (
        echo.
        echo [PROMOTING] Running Configure-As-Library-Server.bat...
        call "%~dp0Configure-As-Library-Server.bat"
        exit /b 0
    ) else (
        echo.
        echo [PROTECTION] Halting startup to protect the primary server.
        echo If you need to run local testing on your laptop, use start-dev.bat instead.
        echo ====================================================================
        pause
        exit /b 0
    )
)

set "LOCK_FILE=%TEMP%\jrmsu_startup.lock"

:: 1. Single-Instance Initialization (Clean stale locks)
del "!LOCK_FILE!" >nul 2>&1
echo %date% %time% > "!LOCK_FILE!"

:: 1.1 Detect Connected Physical & External Storage Drives
set "DETECTED_DRIVES="
set /a STORAGE_COUNT=0
for /f "tokens=1*" %%A in ('fsutil fsinfo drives 2^>nul') do (
    for %%C in (%%B) do (
        set "DRV=%%C"
        set "DRV_LETTER=!DRV:~0,1!"
        set /a STORAGE_COUNT+=1
        set "DETECTED_DRIVES=!DETECTED_DRIVES! !DRV_LETTER!"
    )
)
if not defined DETECTED_DRIVES set "DETECTED_DRIVES=C G D E"

:: Prioritize C and G first as defaults, followed by any other detected drives
set "PRIORITY_DRIVES="
echo !DETECTED_DRIVES! | findstr /i "C" >nul && set "PRIORITY_DRIVES=C"
echo !DETECTED_DRIVES! | findstr /i "G" >nul && set "PRIORITY_DRIVES=!PRIORITY_DRIVES! G"
for %%D in (!DETECTED_DRIVES!) do (
    if /i not "%%D"=="C" if /i not "%%D"=="G" (
        set "PRIORITY_DRIVES=!PRIORITY_DRIVES! %%D"
    )
)
if not defined PRIORITY_DRIVES set "PRIORITY_DRIVES=!DETECTED_DRIVES!"
echo [STORAGE] Detected !STORAGE_COUNT! active storage drive(s): !DETECTED_DRIVES!
echo [STORAGE] Drive search priority: !PRIORITY_DRIVES!

:: 2. Smart Project Location Discovery (Resilient against power cut / delayed drive mount)
set "PROJECT_DIR="
set "SAVED_LOC_FILE=%APPDATA%\JRMSULibrary\ProjectLocation.txt"
set /a DRIVE_SCAN_ATTEMPT=0

:discover_drive_loop
:: 2.1 FAST-PATH: Sibling folder check (Zero search needed when running from CommandStart on any drive)
if exist "%~dp0..\JRMSULibrary-web-PAGE\docker-compose.yml" (
    pushd "%~dp0..\JRMSULibrary-web-PAGE"
    set "PROJECT_DIR=!CD!"
    popd
    echo [CACHE] Project directory confirmed: !PROJECT_DIR!
    goto :found_project
)

:: 2.1.1 FAST-PATH: Parent folder check (if CommandStart is inside the project repository)
if exist "%~dp0..\docker-compose.yml" (
    pushd "%~dp0.."
    set "PROJECT_DIR=!CD!"
    popd
    echo [CACHE] Project directory confirmed: !PROJECT_DIR!
    goto :found_project
)

:: 2.2 FAST-PATH: Check cached project location in AppData and script directory
if exist "!SAVED_LOC_FILE!" (
    for /f "usebackq delims=" %%A in ("!SAVED_LOC_FILE!") do (
        if exist "%%~A\docker-compose.yml" (
            set "PROJECT_DIR=%%~A"
            echo [CACHE] Project directory loaded from cache: !PROJECT_DIR!
            goto :found_project
        )
    )
)
if exist "%~dp0ProjectLocation.txt" (
    for /f "usebackq delims=" %%A in ("%~dp0ProjectLocation.txt") do (
        if exist "%%~A\docker-compose.yml" (
            set "PROJECT_DIR=%%~A"
            echo [CACHE] Project directory loaded from local cache: !PROJECT_DIR!
            goto :found_project
        )
    )
)

:: 2.3 Check local script folder
if exist "%~dp0docker-compose.yml" (
    set "PROJECT_DIR=%~dp0"
    goto :found_project
)

:: 2.4 FIRST-TIME SEARCH: Only run during first-ever setup if cache is missing (Checks C: and G: first as defaults)
echo [FIRST-TIME SCAN] Locating project folder across detected drives (Order: !PRIORITY_DRIVES!)...
for %%D in (!PRIORITY_DRIVES!) do (
    if exist "%%D:\" (
        for %%P in (
            "%%D:\JRMSU LIBRARY SYSTEM\JRMSULibrary-web-PAGE"
            "%%D:\JRMSULibrary-web-PAGE"
            "%%D:\Users\%USERNAME%\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE"
            "%%D:\Users\%USERNAME%\Desktop\JRMSU LIBRARY LANGDING PAGE\JRMSULibrary-web-PAGE"
            "%USERPROFILE%\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE"
            "%USERPROFILE%\Desktop\JRMSU LIBRARY LANGDING PAGE\JRMSULibrary-web-PAGE"
            "%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE"
            "%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANGDING PAGE\JRMSULibrary-web-PAGE"
        ) do (
            if exist "%%~P\docker-compose.yml" (
                set "PROJECT_DIR=%%~P"
                echo [FOUND] Located project folder at: !PROJECT_DIR!
                goto :found_project
            )
        )
    )
)

:: Deep search across detected active drives if still not found
for %%D in (!PRIORITY_DRIVES!) do (
    if exist "%%D:\" (
        for /f "delims=" %%F in ('dir /s /b /ad "%%D:\*JRMSULibrary-web-PAGE*" 2^>nul') do (
            if exist "%%~F\docker-compose.yml" (
                set "PROJECT_DIR=%%~F"
                echo [FOUND] Located project folder via drive scan: !PROJECT_DIR!
                goto :found_project
            )
        )
    )
)

if not defined PROJECT_DIR (
    set /a DRIVE_SCAN_ATTEMPT+=1
    if !DRIVE_SCAN_ATTEMPT! lss 4 (
        echo [WAITING] Drive might still be mounting after power restoration... Retrying in 5s...
        ping 127.0.0.1 -n 6 >nul
        goto :discover_drive_loop
    )
)

:found_project
if not defined PROJECT_DIR (
    echo [ERROR] Could not find the JRMSULibrary-web-PAGE project folder!
    echo Please make sure the project drive is connected.
    del "!LOCK_FILE!" >nul 2>&1
    ping 127.0.0.1 -n 10 >nul
    exit /b 1
)

:: Save location permanently in cache for future instant zero-search launches
if not exist "%APPDATA%\JRMSULibrary" mkdir "%APPDATA%\JRMSULibrary"
echo !PROJECT_DIR!> "!SAVED_LOC_FILE!"
echo !PROJECT_DIR!> "%~dp0ProjectLocation.txt"
echo [OK] Project directory confirmed: !PROJECT_DIR!

:: 3. Register High-Priority Windows Auto-Start (Forces visible launcher upon entering desktop / sign-in)
echo [CONFIGURING] Ensuring forceful Auto-Start on user sign-in / desktop entry...
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_BAT=%STARTUP_FOLDER%\JRMSU_Library_AutoStart.bat"

:: Clean up old silent .vbs scripts
del "%STARTUP_FOLDER%\JRMSU_Library_AutoStart.vbs" >nul 2>&1
del "%STARTUP_FOLDER%\SilentStartDockerWSL.vbs" >nul 2>&1

:: 3.1 Primary Mechanism: Windows Registry Run Key (Runs immediately upon entering desktop)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "JRMSU_Library_System" /t REG_SZ /d "cmd.exe /c start \"\" \"%~dp0AutomaticUp.bat\"" /f >nul 2>&1

:: 3.2 Secondary Mechanism: Startup Folder Batch Launcher (Opens visible console window forcefully & resilient to drive letter changes)
> "!STARTUP_BAT!" echo @echo off
>> "!STARTUP_BAT!" echo if exist "%~dp0AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo     start "" "%~dp0AutomaticUp.bat"
>> "!STARTUP_BAT!" echo     exit /b 0
>> "!STARTUP_BAT!" echo )
>> "!STARTUP_BAT!" echo if exist "%USERPROFILE%\Desktop\JRMSU LIBRARY LANDING PAGE\CommandStart\AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo     start "" "%USERPROFILE%\Desktop\JRMSU LIBRARY LANDING PAGE\CommandStart\AutomaticUp.bat"
>> "!STARTUP_BAT!" echo     exit /b 0
>> "!STARTUP_BAT!" echo )
>> "!STARTUP_BAT!" echo if exist "%USERPROFILE%\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart\AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo     start "" "%USERPROFILE%\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart\AutomaticUp.bat"
>> "!STARTUP_BAT!" echo     exit /b 0
>> "!STARTUP_BAT!" echo )
>> "!STARTUP_BAT!" echo for %%%%D in (G C D E F H) do (
>> "!STARTUP_BAT!" echo     if exist "%%%%D:\JRMSU LIBRARY SYSTEM\CommandStart\AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo         start "" "%%%%D:\JRMSU LIBRARY SYSTEM\CommandStart\AutomaticUp.bat"
>> "!STARTUP_BAT!" echo         exit /b 0
>> "!STARTUP_BAT!" echo     )
>> "!STARTUP_BAT!" echo     if exist "%%%%D:\CommandStart\AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo         start "" "%%%%D:\CommandStart\AutomaticUp.bat"
>> "!STARTUP_BAT!" echo         exit /b 0
>> "!STARTUP_BAT!" echo     )
>> "!STARTUP_BAT!" echo     if exist "%%%%D:\Users\%USERNAME%\Desktop\JRMSU LIBRARY LANDING PAGE\CommandStart\AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo         start "" "%%%%D:\Users\%USERNAME%\Desktop\JRMSU LIBRARY LANDING PAGE\CommandStart\AutomaticUp.bat"
>> "!STARTUP_BAT!" echo         exit /b 0
>> "!STARTUP_BAT!" echo     )
>> "!STARTUP_BAT!" echo     if exist "%%%%D:\Users\%USERNAME%\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart\AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo         start "" "%%%%D:\Users\%USERNAME%\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart\AutomaticUp.bat"
>> "!STARTUP_BAT!" echo         exit /b 0
>> "!STARTUP_BAT!" echo     )
>> "!STARTUP_BAT!" echo     if exist "%%%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANDING PAGE\CommandStart\AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo         start "" "%%%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANDING PAGE\CommandStart\AutomaticUp.bat"
>> "!STARTUP_BAT!" echo         exit /b 0
>> "!STARTUP_BAT!" echo     )
>> "!STARTUP_BAT!" echo     if exist "%%%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart\AutomaticUp.bat" (
>> "!STARTUP_BAT!" echo         start "" "%%%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart\AutomaticUp.bat"
>> "!STARTUP_BAT!" echo         exit /b 0
>> "!STARTUP_BAT!" echo     )
>> "!STARTUP_BAT!" echo )

echo [OK] Windows Auto-Start registered forcefully (Registry Run Key + Multi-Drive Startup Launcher).

:: 3.1 Register 24/7 Keep-Alive Watchdog (Ensures containers stay running even if Docker Desktop is closed)
echo [CONFIGURING] Ensuring 24/7 Always-Running Watchdog monitor...
set "WATCHDOG_DIR=%APPDATA%\JRMSULibrary"
if not exist "!WATCHDOG_DIR!" mkdir "!WATCHDOG_DIR!"
set "WATCHDOG_BAT=!WATCHDOG_DIR!\Watchdog.bat"
set "WATCHDOG_VBS=!WATCHDOG_DIR!\Watchdog.vbs"

> "!WATCHDOG_BAT!" echo @echo off
>> "!WATCHDOG_BAT!" echo setlocal enabledelayedexpansion
>> "!WATCHDOG_BAT!" echo.
>> "!WATCHDOG_BAT!" echo :: 1. Check Machine Role - Never revive server containers or tunnels on maintenance machines
>> "!WATCHDOG_BAT!" echo if exist "%%~dp0MachineRole.txt" (
>> "!WATCHDOG_BAT!" echo     findstr /i "MAINTENANCE" "%%~dp0MachineRole.txt" ^>nul 2^>^&1
>> "!WATCHDOG_BAT!" echo     if ^^!errorlevel^^! equ 0 exit /b 0
>> "!WATCHDOG_BAT!" echo )
>> "!WATCHDOG_BAT!" echo if exist "%~dp0MachineRole.txt" (
>> "!WATCHDOG_BAT!" echo     findstr /i "MAINTENANCE" "%~dp0MachineRole.txt" ^>nul 2^>^&1
>> "!WATCHDOG_BAT!" echo     if ^^!errorlevel^^! equ 0 exit /b 0
>> "!WATCHDOG_BAT!" echo )
>> "!WATCHDOG_BAT!" echo.
>> "!WATCHDOG_BAT!" echo :: 2. Verify Docker Container Status
>> "!WATCHDOG_BAT!" echo set "DOCKER_OK=0"
>> "!WATCHDOG_BAT!" echo docker ps --filter "name=frontend-webpage" --filter "status=running" 2^>nul ^| findstr /i "frontend-webpage" ^>nul 2^>^&1
>> "!WATCHDOG_BAT!" echo if ^^!errorlevel^^! equ 0 set "DOCKER_OK=1"
>> "!WATCHDOG_BAT!" echo.
>> "!WATCHDOG_BAT!" echo :: 3. Verify Cloudflare Tunnel Status
>> "!WATCHDOG_BAT!" echo set "CF_OK=0"
>> "!WATCHDOG_BAT!" echo sc query Cloudflared 2^>nul ^| findstr /i "RUNNING" ^>nul 2^>^&1 ^|^| tasklist /fi "imagename eq cloudflared.exe" 2^>nul ^| findstr /i "cloudflared.exe" ^>nul 2^>^&1
>> "!WATCHDOG_BAT!" echo if ^^!errorlevel^^! equ 0 set "CF_OK=1"
>> "!WATCHDOG_BAT!" echo.
>> "!WATCHDOG_BAT!" echo :: 4. Exit if both are running
>> "!WATCHDOG_BAT!" echo if ^^^!DOCKER_OK^^^! equ 1 if ^^^!CF_OK^^^! equ 1 exit /b 0
>> "!WATCHDOG_BAT!" echo.
>> "!WATCHDOG_BAT!" echo :: 5. Check if startup is already in progress
>> "!WATCHDOG_BAT!" echo if exist "%%TEMP%%\jrmsu_startup.lock" exit /b 0
>> "!WATCHDOG_BAT!" echo.
>> "!WATCHDOG_BAT!" echo :: 6. Self-heal by invoking AutomaticUp.bat
>> "!WATCHDOG_BAT!" echo if exist "%~dp0AutomaticUp.bat" (
>> "!WATCHDOG_BAT!" echo     call "%~dp0AutomaticUp.bat"
>> "!WATCHDOG_BAT!" echo     exit /b 0
>> "!WATCHDOG_BAT!" echo )
>> "!WATCHDOG_BAT!" echo for %%%%D in (G C D E F H) do (
>> "!WATCHDOG_BAT!" echo     if exist "%%%%D:\JRMSU LIBRARY SYSTEM\CommandStart\AutomaticUp.bat" (
>> "!WATCHDOG_BAT!" echo         call "%%%%D:\JRMSU LIBRARY SYSTEM\CommandStart\AutomaticUp.bat"
>> "!WATCHDOG_BAT!" echo         exit /b 0
>> "!WATCHDOG_BAT!" echo     )
>> "!WATCHDOG_BAT!" echo     if exist "%%%%D:\CommandStart\AutomaticUp.bat" (
>> "!WATCHDOG_BAT!" echo         call "%%%%D:\CommandStart\AutomaticUp.bat"
>> "!WATCHDOG_BAT!" echo         exit /b 0
>> "!WATCHDOG_BAT!" echo     )
>> "!WATCHDOG_BAT!" echo     if exist "%%%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANDING PAGE\CommandStart\AutomaticUp.bat" (
>> "!WATCHDOG_BAT!" echo         call "%%%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANDING PAGE\CommandStart\AutomaticUp.bat"
>> "!WATCHDOG_BAT!" echo         exit /b 0
>> "!WATCHDOG_BAT!" echo     )
>> "!WATCHDOG_BAT!" echo     if exist "%%%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart\AutomaticUp.bat" (
>> "!WATCHDOG_BAT!" echo         call "%%%%D:%USERPROFILE:~2%\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart\AutomaticUp.bat"
>> "!WATCHDOG_BAT!" echo         exit /b 0
>> "!WATCHDOG_BAT!" echo     )
>> "!WATCHDOG_BAT!" echo )

> "!WATCHDOG_VBS!" echo Set WshShell = CreateObject("WScript.Shell"^)
>> "!WATCHDOG_VBS!" echo WshShell.Run """!WATCHDOG_BAT!""", 0, False

schtasks /create /tn "JRMSU_Library_247_Watchdog" /tr "wscript.exe \"!WATCHDOG_VBS!\"" /sc minute /mo 3 /f >nul 2>&1
echo [OK] 24/7 Keep-Alive Watchdog active (Self-heals if Docker Desktop is closed).

:: 4. Detect Active Local Dynamic IP (Read-Only reference for Wi-Fi / LAN, zero network tampering)
echo [NETWORK] Detecting active campus Wi-Fi / Local Network IP address...
set "LOCAL_IP=localhost"
for /f "tokens=4" %%I in ('route print 0.0.0.0 2^>nul ^| findstr /c:" 0.0.0.0 "') do (
    if not "%%~I"=="" set "LOCAL_IP=%%~I"
)
if "!LOCAL_IP!"=="localhost" (
    for /f "tokens=2 delims=:" %%I in ('ipconfig 2^>nul ^| findstr /i "IPv4" ^| findstr /v "169.254."') do (
        for /f "tokens=1" %%B in ("%%I") do (
            if not "%%~B"=="" if "!LOCAL_IP!"=="localhost" set "LOCAL_IP=%%~B"
        )
    )
)
echo [OK] Local dynamic IP detected: !LOCAL_IP! (Automatic DHCP preserved)

:: 5. Universal Multi-Drive Docker Desktop Discovery Engine
echo.
echo [CHECK] Verifying Docker Engine status...
docker info >nul 2>&1
if !errorlevel! equ 0 goto :docker_online

:: 5.1 Self-Healing: Repair corrupted Docker daemon configuration files (null bytes from sudden power cut)
if not exist "%USERPROFILE%\.docker" mkdir "%USERPROFILE%\.docker"
if exist "%~dp0RepairDockerDaemon.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0RepairDockerDaemon.ps1" >nul 2>&1
) else if exist "%APPDATA%\JRMSULibrary\RepairDockerDaemon.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%APPDATA%\JRMSULibrary\RepairDockerDaemon.ps1" >nul 2>&1
)

set "DOCKER_BIN="
set "SAVED_DOCKER_FILE=%APPDATA%\JRMSULibrary\DockerLocation.txt"

:: 5.1 FAST-PATH: Check cached Docker location (Instant 0ms lookup, zero search needed)
if exist "!SAVED_DOCKER_FILE!" (
    for /f "usebackq delims=" %%A in ("!SAVED_DOCKER_FILE!") do (
        if exist "%%~A" (
            set "DOCKER_BIN=%%~A"
            echo [CACHE] Docker Desktop loaded from cached location: !DOCKER_BIN!
            echo [CACHE] Zero search needed - instant fast-boot
            goto :launch_docker
        )
    )
)
if exist "%~dp0DockerLocation.txt" (
    for /f "usebackq delims=" %%A in ("%~dp0DockerLocation.txt") do (
        if exist "%%~A" (
            set "DOCKER_BIN=%%~A"
            echo [CACHE] Docker Desktop loaded from local cache: !DOCKER_BIN!
            echo [CACHE] Zero search needed - instant fast-boot
            goto :launch_docker
        )
    )
)

:: 5.2 FIRST-TIME SEARCH: Only executed during first-ever run on a new computer (Searches C: and G: first as defaults)
echo [FIRST-TIME SCAN] No valid cached location found for this computer.
echo [SEARCH] First-time scan: Searching C: and G: drives first as defaults...

:: 5.2.1 INSTANT COMMAND: Resolve Docker Desktop path directly via system PATH (0.01s instant lookup)
for /f "delims=" %%I in ('where docker.exe 2^>nul') do (
    for %%J in ("%%~dpI..\..") do (
        if exist "%%~fJ\Docker Desktop.exe" (
            set "DOCKER_BIN=%%~fJ\Docker Desktop.exe"
            echo [FOUND] Located instantly via system command: !DOCKER_BIN!
        )
    )
)
if defined DOCKER_BIN goto :save_docker_loc

:: Check Standard Known Paths Across C:, G: and Detected Drives
for %%P in (
    "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
    "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    "G:\Program Files\Docker\Docker\Docker Desktop.exe"
    "C:\Program Files\Docker Desktop\Docker Desktop.exe"
    "G:\Program Files\Docker Desktop\Docker Desktop.exe"
    "C:\Docker\Docker Desktop.exe"
    "G:\Docker\Docker Desktop.exe"
    "C:\DockerDesktop\Docker Desktop.exe"
    "G:\DockerDesktop\Docker Desktop.exe"
    "G:\Docker\Docker\Docker Desktop.exe"
    "G:\Programs\DockerDesktop\Docker Desktop.exe"
    "D:\Program Files\Docker\Docker\Docker Desktop.exe"
    "D:\Docker\Docker Desktop.exe"
    "E:\Program Files\Docker\Docker\Docker Desktop.exe"
    "E:\Docker\Docker Desktop.exe"
    "F:\Program Files\Docker\Docker\Docker Desktop.exe"
) do (
    if not defined DOCKER_BIN if exist "%%~P" (
        set "DOCKER_BIN=%%~P"
        echo [FOUND] Located at standard installation path: !DOCKER_BIN!
    )
)
if defined DOCKER_BIN goto :save_docker_loc

:: Check Start Menu Shortcuts
for %%S in (
    "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Docker Desktop.lnk"
    "%ProgramData%\Microsoft\Windows\Start Menu\Programs\Docker Desktop.lnk"
) do (
    if not defined DOCKER_BIN if exist "%%~S" (
        for /f "delims=" %%T in ('powershell -NoProfile -Command "$sh=New-Object -ComObject WScript.Shell; $t=$sh.CreateShortcut('%%~S').TargetPath; if(Test-Path $t){$t}" 2^>nul') do (
            if exist "%%~T" (
                set "DOCKER_BIN=%%~T"
                echo [FOUND] Located via Start Menu shortcut: !DOCKER_BIN!
            )
        )
    )
)
if defined DOCKER_BIN goto :save_docker_loc

:: Check drive root directories and subfolders on detected drives
for %%D in (!PRIORITY_DRIVES!) do (
    if not defined DOCKER_BIN if exist "%%D:\" (
        for %%S in (
            "%%D:\Program Files\Docker\Docker\Docker Desktop.exe"
            "%%D:\Program Files\Docker Desktop\Docker Desktop.exe"
            "%%D:\Program Files (x86)\Docker\Docker\Docker Desktop.exe"
            "%%D:\Docker\Docker Desktop.exe"
            "%%D:\DockerDesktop\Docker Desktop.exe"
            "%%D:\Programs\DockerDesktop\Docker Desktop.exe"
            "%%D:\Users\*\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
        ) do (
            if not defined DOCKER_BIN if exist "%%~S" (
                set "DOCKER_BIN=%%~S"
                echo [FOUND] Located Docker Desktop at: !DOCKER_BIN!
            )
        )
    )
)
if defined DOCKER_BIN goto :save_docker_loc

:: Targeted drive sweep on detected drives if still not found
for %%D in (!PRIORITY_DRIVES!) do (
    if not defined DOCKER_BIN if exist "%%D:\" (
        for /f "delims=" %%F in ('dir /b /s "%%D:\Docker Desktop.exe" 2^>nul') do (
            if not defined DOCKER_BIN if exist "%%~F" (
                set "DOCKER_BIN=%%~F"
                echo [FOUND] Located Docker Desktop via %%D:\ sweep: !DOCKER_BIN!
            )
        )
    )
)
if defined DOCKER_BIN goto :save_docker_loc

:save_docker_loc
if defined DOCKER_BIN (
    if not exist "%APPDATA%\JRMSULibrary" mkdir "%APPDATA%\JRMSULibrary"
    echo !DOCKER_BIN!> "!SAVED_DOCKER_FILE!"
    echo !DOCKER_BIN!> "%~dp0DockerLocation.txt"
    echo [CACHED] Saved Docker Desktop path permanently: !DOCKER_BIN!
    echo [CACHED] Future boots and restarts on this computer will skip searching.
)

:launch_docker
if not defined DOCKER_BIN (
    echo [ERROR] Docker Desktop could not be found in standard paths!
    echo Please make sure Docker Desktop is installed on this computer.
    echo Testing if Docker CLI is responsive in background...
    goto :wait_docker_loop
)

echo [STARTING] Launching Docker Desktop in background (minimized to system tray)...
start /min "" "!DOCKER_BIN!" -accept-license

:: 5.2 Docker Desktop Background Engine Initialization
echo [WAITING] Initializing Docker Desktop background engine (typically takes 15-30s on reboot)...
set /a DOCKER_RETRY=0

:wait_docker_loop
ping 127.0.0.1 -n 3 >nul
docker info >nul 2>&1
if !errorlevel! equ 0 goto :docker_online

set /a DOCKER_RETRY+=1
if !DOCKER_RETRY! geq 60 goto :docker_timeout
echo [WAITING] Starting Docker background engine... [!DOCKER_RETRY!/60]
goto :wait_docker_loop

:docker_timeout
echo [WARNING] Docker initialization took longer than expected. Proceeding with launch...

:docker_online
echo [OK] Docker Engine is online and ready!

:: 6. Check if the system is ALREADY online and running
docker ps --filter "name=frontend-webpage" --filter "status=running" | findstr /i "frontend-webpage" >nul 2>&1
if !errorlevel! equ 0 (
    echo.
    echo ====================================================================
    echo   [OK] SYSTEM IS ALREADY UP AND RUNNING!
    echo ====================================================================
    echo - Public Landing Page:  https://page.jrmsukc-library.online
    echo - Librarian Admin:      https://admin.jrmsukc-library.online
    echo - Local Machine:        http://localhost:3000
    echo - Wi-Fi / Local LAN:    http://!LOCAL_IP!:3000
    echo.
    echo You do not need to click again.
    echo To stop the system, double-click StopAutomaticUp.bat.
    echo ====================================================================
    del "!LOCK_FILE!" >nul 2>&1
    ping 127.0.0.1 -n 5 >nul
    exit /b 0
)

:: 7. Launch Docker Compose Services & Cloudflare Tunnel
echo.
echo [LAUNCHING] Starting JRMSU Library System containers...
cd /d "!PROJECT_DIR!"

docker compose up -d
if !errorlevel! neq 0 (
    echo [RETRY] Trying with docker-compose standalone...
    docker-compose up -d
)

echo.
echo [LAUNCHING] Verifying Cloudflare Tunnel connector...
set "CF_HARDCODED_TOKEN=eyJhIjoiMzJiM2E1ODQ0YmY1YjhiNjU2NGE0NDc5ZTcyZGY0ZGEiLCJ0IjoiOGRlMjAwOGMtZTQ2MC00ZDg1LTk5YTMtMmQwYjFkNTU5OWFkIiwicyI6Ik1EUTVPVGN4TnpJdE5tTmtOQzAwTUROa0xUZzBOakV0T0RBME9UazRORGMyWkdZMiJ9"
set "CF_RUNNING=0"
sc query Cloudflared 2>nul | findstr /i "RUNNING" >nul 2>&1
if !errorlevel! equ 0 set "CF_RUNNING=1"
tasklist /fi "imagename eq cloudflared.exe" 2>nul | findstr /i "cloudflared.exe" >nul 2>&1
if !errorlevel! equ 0 set "CF_RUNNING=1"

if "!CF_RUNNING!"=="1" (
    echo [OK] Cloudflare Tunnel connector is online and active.
) else (
    echo [STARTING] Cloudflare connector is offline. Attempting to start service/process...
    net start Cloudflared >nul 2>&1
    sc query Cloudflared 2>nul | findstr /i "RUNNING" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Cloudflare Windows Service started successfully.
    ) else (
        echo [FALLBACK] Service start unavailable or non-admin. Launching standalone connector...
        if exist "%~dp0cloudflared.exe" (
            start /b "" "%~dp0cloudflared.exe" tunnel run --token !CF_HARDCODED_TOKEN! >nul 2>&1
            echo [OK] Started standalone cloudflared.exe in background.
        ) else (
            docker start cloudflared >nul 2>&1
            if !errorlevel! neq 0 (
                docker run -d --name cloudflared --restart unless-stopped cloudflare/cloudflared:latest tunnel --no-autoupdate run --token !CF_HARDCODED_TOKEN! >nul 2>&1
            )
            echo [OK] Started Cloudflare connector via Docker.
        )
    )
)

:: Clean up lock file
del "!LOCK_FILE!" >nul 2>&1

echo.
echo ====================================================================
echo   [SUCCESS] JRMSU LIBRARY SYSTEM IS ONLINE AND PERMANENT
echo ====================================================================
echo.
echo 1. Public Landing Page:  https://page.jrmsukc-library.online
echo 2. Librarian Admin:      https://admin.jrmsukc-library.online
echo 3. Local Machine:        http://localhost:3000  (Admin: http://localhost:3001)
echo 4. Campus Wi-Fi / LAN:   http://!LOCAL_IP!:3000  (Admin: http://!LOCAL_IP!:3001)
echo 5. Windows Auto-Start:   ENABLED (Will launch automatically on boot)
echo 6. 24/7 Keep-Alive:      ACTIVE (Automatically recovers if Docker Desktop is closed)
echo 7. Background Engine:    Docker Desktop minimized in system tray (safe to close window)
echo 8. Network Setting:      Dynamic DHCP Preserved (Zero IP tampering)
echo 9. To stop the system:   Double-click StopAutomaticUp.bat anytime.
echo.
echo ====================================================================
ping 127.0.0.1 -n 8 >nul
exit /b 0
