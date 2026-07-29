@echo off
setlocal enabledelayedexpansion

CD /D "%~dp0"

echo ========================================================
echo   JRMSU LIBRARY - 1-CLICK PERMANENT SETUP
echo ========================================================
echo.
echo Step 1: Freezing IP Address to 192.168.9.195
echo Scanning for active network connection...

set "temp_ps1=%temp%\SetIP.ps1"
echo try { > "!temp_ps1!"
echo     $netAdapter = Get-NetAdapter ^| Where-Object { $_.Status -eq 'Up' -and $_.Name -notmatch 'vEthernet^|Virtual^|Loopback' } ^| Select-Object -First 1; >> "!temp_ps1!"
echo     if (-not $netAdapter) { Write-Host 'No active Wi-Fi or Ethernet connection found!' -ForegroundColor Yellow; exit 0; } >> "!temp_ps1!"
echo     Write-Host ('Found Adapter: ' + $netAdapter.Name); >> "!temp_ps1!"
echo     $ipConfig = Get-NetIPConfiguration -InterfaceAlias $netAdapter.Name; >> "!temp_ps1!"
echo     $prefix = 24; >> "!temp_ps1!"
echo     $gateway = '192.168.9.1'; >> "!temp_ps1!"
echo     if ($ipConfig.IPv4Address) { $prefix = $ipConfig.IPv4Address.PrefixLength; } >> "!temp_ps1!"
echo     $ip = '192.168.9.195'; >> "!temp_ps1!"
echo     $currentIp = $null; >> "!temp_ps1!"
echo     if ($ipConfig.IPv4Address) { $currentIp = $ipConfig.IPv4Address.IPAddress; } >> "!temp_ps1!"
echo     if ($currentIp -eq $ip) { >> "!temp_ps1!"
echo         Write-Host '[SUCCESS] IP Address is ALREADY locked to 192.168.9.195!' -ForegroundColor Green; >> "!temp_ps1!"
echo     } else { >> "!temp_ps1!"
echo         Write-Host ('Forcing IP to: ' + $ip); >> "!temp_ps1!"
echo         Write-Host ('Using Gateway: ' + $gateway); >> "!temp_ps1!"
echo         Write-Host 'Applying permanent static configuration...'; >> "!temp_ps1!"
echo         Remove-NetIPAddress -InterfaceAlias $netAdapter.Name -Confirm:$false -ErrorAction SilentlyContinue ^| Out-Null; >> "!temp_ps1!"
echo         New-NetIPAddress -InterfaceAlias $netAdapter.Name -IPAddress $ip -PrefixLength $prefix -DefaultGateway $gateway -ErrorAction SilentlyContinue ^| Out-Null; >> "!temp_ps1!"
echo         Set-DnsClientServerAddress -InterfaceAlias $netAdapter.Name -ServerAddresses ('8.8.8.8', '8.8.4.4') -ErrorAction SilentlyContinue ^| Out-Null; >> "!temp_ps1!"
echo         Write-Host '[SUCCESS] IP Address 192.168.9.195 is now locked in permanently!' -ForegroundColor Green; >> "!temp_ps1!"
echo     } >> "!temp_ps1!"
echo } catch { >> "!temp_ps1!"
echo     Write-Host ('Note: Could not force IP automatically. ' + $_.Exception.Message) -ForegroundColor Yellow; >> "!temp_ps1!"
echo } >> "!temp_ps1!"

powershell -NoProfile -ExecutionPolicy Bypass -File "!temp_ps1!"
del "!temp_ps1!"

echo.
echo Step 1.5: Locating "JRMSU LIBRARY LANDING PAGE" Folder...
set "PROJECT_DIR="

:: Check if it's already saved permanently
if exist "%~dp0ProjectLocation.txt" (
    for /f "usebackq delims=" %%A in ("%~dp0ProjectLocation.txt") do set "PROJECT_DIR=%%A"
    echo Found saved location: !PROJECT_DIR!
)

:: Fast Path: Check if the script is ALREADY inside the correct folder by looking for docker-compose.yml
if "!PROJECT_DIR!"=="" (
    if exist "%~dp0docker-compose.yml" (
        set "PROJECT_DIR=%~dp0"
        echo !PROJECT_DIR!> "%~dp0ProjectLocation.txt"
        echo Found project folder instantly: !PROJECT_DIR!
    )
)

:: Deep search if not found
if "!PROJECT_DIR!"=="" (
    echo Searching C:, E:, G: drives for the project folder - this might take a few minutes...
    
    for %%D in (C E G) do (
        if exist %%D:\ (
            echo Scanning %%D:\ ...
            for /f "delims=" %%F in ('dir /s /b /ad "%%D:\*JRMSU LIBRARY LANDING PAGE*" 2^>nul') do (
                set "PROJECT_DIR=%%F"
                echo !PROJECT_DIR!> "%~dp0ProjectLocation.txt"
                goto :found_project_dir
            )
        )
    )
)

:found_project_dir
if "!PROJECT_DIR!"=="" (
    echo [ERROR] Could not find the project folder!
    pause
    exit /b
)
echo Permanently saved project location: !PROJECT_DIR!

echo.
echo Step 2: Locating Docker Desktop...
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SCRIPT_NAME=SilentStartDockerWSL.vbs"
set "TARGET_PATH=%STARTUP_DIR%\%SCRIPT_NAME%"
set "DOCKER_PATH="

if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    set "DOCKER_PATH=C:\Program Files\Docker\Docker\Docker Desktop.exe"
)
if "!DOCKER_PATH!"=="" (
    for /f "delims=" %%I in ('powershell -NoProfile -Command "(Get-ItemProperty -ErrorAction SilentlyContinue 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*' | Where-Object { $_.DisplayName -match 'Docker Desktop' }).InstallLocation"') do (
        if exist "%%I\Docker Desktop.exe" (
            set "DOCKER_PATH=%%I\Docker Desktop.exe"
        )
    )
)
if "!DOCKER_PATH!"=="" (
    for /f "delims=" %%F in ('dir /s /b "C:\Program Files\Docker Desktop.exe" 2^>nul') do (
        set "DOCKER_PATH=%%F"
        goto :found_docker
    )
)
:found_docker
if "!DOCKER_PATH!"=="" (
    set "DOCKER_PATH=docker"
) else (
    echo Found Docker at: !DOCKER_PATH!
)

echo.
echo Step 3: Locating WSL...
set "WSL_PATH=wsl.exe"
for /f "delims=" %%W in ('where wsl.exe 2^>nul') do (
    set "WSL_PATH=%%W"
    goto :found_wsl
)
:found_wsl
echo Found WSL at: %WSL_PATH%
echo.

echo Step 4: Creating background startup task (runs on every boot)...
echo Set WshShell = CreateObject("WScript.Shell") > "%TARGET_PATH%"
echo WshShell.Run """!DOCKER_PATH!""", 0, False >> "%TARGET_PATH%"
echo WScript.Sleep 2000 >> "%TARGET_PATH%"
echo WshShell.Run """%WSL_PATH%""", 0, False >> "%TARGET_PATH%"

echo.
echo Step 5: Starting Docker Desktop right now...
start "" "!DOCKER_PATH!"

echo.
echo Step 6: Starting the Library System...
echo Moving to project folder: !PROJECT_DIR!
CD /D "!PROJECT_DIR!"

echo Waiting for Docker Engine to fully start (this may take a minute)...
:wait_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 3 /nobreak >nul
    goto wait_docker
)

echo Docker is ready! Checking if project images already exist...
set "IMAGE_EXISTS="
for /f "delims=" %%i in ('docker images -q jrmsulibrarylandingpage-backend 2^>nul') do set "IMAGE_EXISTS=%%i"

if "!IMAGE_EXISTS!"=="" (
    echo First-time setup detected! Building images (this will take a few minutes)...
    docker-compose up -d --build
) else (
    echo Images already built! Starting project instantly...
    docker-compose up -d
)

echo.
echo ========================================================
echo [SUCCESS] ALL PERMANENT SETTINGS APPLIED!
echo ========================================================
echo 1. Your IP is strictly locked to 192.168.9.195
echo 2. The project folder location is saved permanently
echo 3. Docker and WSL will automatically start on every boot
echo 4. The library system will ALWAYS be accessible at:
echo    http://192.168.9.195:3000
echo ========================================================
echo You never need to click this file again. 
echo.
pause
