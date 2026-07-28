@echo off
setlocal enabledelayedexpansion
echo ========================================================
echo   PERMANENT AUTO-START SETUP FOR DOCKER AND WSL
echo ========================================================
echo.
echo This setup only needs to be run ONCE. 
echo It will ensure Docker and WSL open automatically FOREVER,
echo even after you shutdown or restart your PC.
echo.

set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SCRIPT_NAME=SilentStartDockerWSL.vbs"
set "TARGET_PATH=%STARTUP_DIR%\%SCRIPT_NAME%"

echo Locating Docker Desktop...
set "DOCKER_PATH="

:: 1. Check standard path
if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    set "DOCKER_PATH=C:\Program Files\Docker\Docker\Docker Desktop.exe"
)

:: 2. Registry search
if "!DOCKER_PATH!"=="" (
    for /f "delims=" %%I in ('powershell -NoProfile -Command "(Get-ItemProperty -ErrorAction SilentlyContinue 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*' | Where-Object { $_.DisplayName -match 'Docker Desktop' }).InstallLocation"') do (
        if exist "%%I\Docker Desktop.exe" (
            set "DOCKER_PATH=%%I\Docker Desktop.exe"
        )
    )
)

:: 3. Fallback search
if "!DOCKER_PATH!"=="" (
    echo Searching C:\Program Files (this may take a moment)...
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
echo Locating WSL...
set "WSL_PATH=wsl.exe"
for /f "delims=" %%W in ('where wsl.exe 2^>nul') do (
    set "WSL_PATH=%%W"
    goto :found_wsl
)
:found_wsl
echo Found WSL at: %WSL_PATH%
echo.

:: Create a SILENT VBScript in the Windows Startup folder
echo Creating permanent background startup task...

echo Set WshShell = CreateObject("WScript.Shell") > "%TARGET_PATH%"
echo WshShell.Run """!DOCKER_PATH!""", 0, False >> "%TARGET_PATH%"
echo WScript.Sleep 2000 >> "%TARGET_PATH%"
echo WshShell.Run """%WSL_PATH%""", 0, False >> "%TARGET_PATH%"

echo.
echo ========================================================
echo [SUCCESS] PERMANENT AUTO-START IS NOW ACTIVE!
echo ========================================================
echo Location: %TARGET_PATH%
echo.
echo You never need to click this file again. 
echo Every time you turn on, restart, or shutdown your PC, 
echo Windows will now automatically run Docker and WSL quietly 
echo in the background forever.
echo.
pause
