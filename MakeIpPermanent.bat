@echo off
:: Request Administrator Privileges
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
echo   FREEZING IP ADDRESS PERMANENTLY (STATIC IP)
echo ========================================================
echo.
echo Scanning for your active network connection and current IP...

powershell -NoProfile -ExecutionPolicy Bypass -Command "^
    $ErrorActionPreference = 'Stop'; ^
    try { ^
        $netAdapter = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.Name -notmatch 'vEthernet|Virtual|Loopback' } | Select-Object -First 1; ^
        if (-not $netAdapter) { Write-Host 'No active Wi-Fi or Ethernet connection found!'; exit 1; } ^
        ^
        Write-Host ('Found Adapter: ' + $netAdapter.Name); ^
        $ipConfig = Get-NetIPConfiguration -InterfaceAlias $netAdapter.Name; ^
        if (-not $ipConfig.IPv4Address) { Write-Host 'Could not detect an IPv4 Address!'; exit 1; } ^
        ^
        $ip = $ipConfig.IPv4Address.IPAddress; ^
        $prefix = $ipConfig.IPv4Address.PrefixLength; ^
        $gateway = $ipConfig.IPv4DefaultGateway.NextHop; ^
        if (-not $gateway) { $gateway = $ip.Substring(0, $ip.LastIndexOf('.')) + '.1'; Write-Host ('Guessing gateway: ' + $gateway); } ^
        ^
        Write-Host ('Freezing IP: ' + $ip); ^
        Write-Host ('Gateway: ' + $gateway); ^
        ^
        Write-Host 'Applying static configuration...'; ^
        New-NetIPAddress -InterfaceAlias $netAdapter.Name -IPAddress $ip -PrefixLength $prefix -DefaultGateway $gateway -ErrorAction SilentlyContinue | Out-Null; ^
        Set-DnsClientServerAddress -InterfaceAlias $netAdapter.Name -ServerAddresses ('8.8.8.8', '8.8.4.4') | Out-Null; ^
        ^
        Write-Host ' '; ^
        Write-Host '========================================================' -ForegroundColor Green; ^
        Write-Host '[SUCCESS] YOUR IP ADDRESS IS NOW PERMANENTLY FROZEN!' -ForegroundColor Green; ^
        Write-Host '========================================================' -ForegroundColor Green; ^
        Write-Host 'Your router will never change this IP again.'; ^
        Write-Host 'WARNING: If you move this laptop to a different location (like a coffee shop), you may need to reset it to Automatic (DHCP) to get internet.'; ^
    } catch { ^
        Write-Host ('Error: ' + $_.Exception.Message) -ForegroundColor Red; ^
    } ^
"

echo.
pause
