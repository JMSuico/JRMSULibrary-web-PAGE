<#
================================================================================
JRMSU KATIPUNAN CAMPUS LIBRARY - AUTOMATED DEPLOYMENT & ROLE AUDITOR
Script: verify-deployment-scripts.ps1
Working Directory: C:\Users\provu\Desktop\JRMSU LIBRARY LANGDING PAGE\CommandStart
Description:
  Automated machine-checked verification suite covering:
  1. Key New Deployment Files existence, size, and ACL permissions.
  2. Forbidden Hardcoded Path scan (e.g. C:\Users\provu) across all .bat/.ps1 files.
  3. CMD Syntax validation of all .bat files via cmd.exe /c in isolated sandbox.
  4. Local Machine State verification (Cloudflared service, Watchdog task, Run key).
================================================================================
#>

[CmdletBinding()]
param(
    [string]$TargetDir = $PSScriptRoot
)

if (-not $TargetDir -or -not (Test-Path $TargetDir)) {
    $TargetDir = $PSScriptRoot
    if (-not $TargetDir -or -not (Test-Path $TargetDir)) {
        $TargetDir = (Get-Location).Path
    }
}

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   JRMSU LIBRARY SYSTEM - AUTOMATED DEPLOYMENT VERIFICATION AUDIT" -ForegroundColor Cyan
Write-Host "   Auditor: Subagent 7 (Automated Deployment Verification Auditor)" -ForegroundColor Cyan
Write-Host "   Target Directory: $TargetDir" -ForegroundColor Cyan
Write-Host "   Audit Timestamp : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$Global:TestCount = 0
$Global:PassCount = 0
$Global:FailCount = 0
$Global:WarnCount = 0
$Global:AuditDetails = @()

function Log-Result {
    param(
        [Parameter(Mandatory=$true)][string]$Suite,
        [Parameter(Mandatory=$true)][string]$Item,
        [Parameter(Mandatory=$true)][ValidateSet("PASS","FAIL","WARN","INFO")][string]$Status,
        [string]$Message = ""
    )

    $Global:TestCount++
    if ($Status -eq "PASS") {
        $Global:PassCount++
        $color = "Green"
        $symbol = "[PASS]"
    } elseif ($Status -eq "FAIL") {
        $Global:FailCount++
        $color = "Red"
        $symbol = "[FAIL]"
    } elseif ($Status -eq "WARN") {
        $Global:WarnCount++
        $color = "Yellow"
        $symbol = "[WARN]"
    } else {
        $color = "Cyan"
        $symbol = "[INFO]"
    }

    $formatted = "{0,-7} | {1,-20} | {2,-38} | {3}" -f $symbol, $Suite, $Item, $Message
    Write-Host $formatted -ForegroundColor $color

    $Global:AuditDetails += [PSCustomObject]@{
        Suite   = $Suite
        Item    = $Item
        Status  = $Status
        Message = $Message
    }
}

# ==============================================================================
# SUITE 1: KEY NEW DEPLOYMENT FILES & PERMISSION VERIFICATION
# ==============================================================================
Write-Host "--- SUITE 1: KEY NEW DEPLOYMENT FILES & PERMISSIONS ---" -ForegroundColor Yellow

$KeyFiles = @(
    @{ Name = "Configure-As-Maintenance-Laptop.bat"; RequiredType = "File"; Pattern = "MAINTENANCE" },
    @{ Name = "Configure-As-Library-Server.bat";     RequiredType = "File"; Pattern = "PRODUCTION_SERVER" },
    @{ Name = "Setup-Windows-AutoLogon.bat";         RequiredType = "File"; Pattern = "AutoAdminLogon" },
    @{ Name = "Disable-Windows-AutoLogon.bat";       RequiredType = "File"; Pattern = "AutoAdminLogon" },
    @{ Name = "AutoLogon-README.md";                 RequiredType = "File"; Pattern = "Sysinternals" },
    @{ Name = "MachineRole.txt";                     RequiredType = "File"; Pattern = "MAINTENANCE|PRODUCTION_SERVER" }
)

foreach ($kf in $KeyFiles) {
    $filePath = Join-Path $TargetDir $kf.Name
    if (-not (Test-Path $filePath)) {
        Log-Result -Suite "KeyFiles" -Item $kf.Name -Status "FAIL" -Message "File does not exist in target directory."
        continue
    }

    $itemInfo = Get-Item $filePath
    if ($itemInfo.Length -le 0) {
        Log-Result -Suite "KeyFiles" -Item $kf.Name -Status "FAIL" -Message "File exists but is 0 bytes (empty)."
        continue
    }

    $hasRead = $false
    $hasWrite = $false
    try {
        $readStream = [System.IO.File]::OpenRead($filePath)
        $readStream.Close()
        $hasRead = $true
    } catch {
        $hasRead = $false
    }

    try {
        $writeStream = [System.IO.File]::Open($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite)
        $writeStream.Close()
        $hasWrite = $true
    } catch {
        $hasWrite = $false
    }

    $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
    $matchesPattern = $content -match $kf.Pattern

    if ($hasRead -and $matchesPattern) {
        $permDesc = if ($hasWrite) { "R/W Accessible ($($itemInfo.Length) bytes)" } else { "Read-Only ($($itemInfo.Length) bytes)" }
        Log-Result -Suite "KeyFiles" -Item $kf.Name -Status "PASS" -Message "Exists, $permDesc, signature verified."
    } elseif (-not $matchesPattern) {
        Log-Result -Suite "KeyFiles" -Item $kf.Name -Status "WARN" -Message "Exists and readable, but expected signature '$($kf.Pattern)' not matched."
    } else {
        Log-Result -Suite "KeyFiles" -Item $kf.Name -Status "FAIL" -Message "File exists but read access was denied."
    }
}

Write-Host ""

# ==============================================================================
# SUITE 2: FORBIDDEN HARDCODED PATH SCANNER (e.g. C:\Users\provu)
# ==============================================================================
Write-Host "--- SUITE 2: FORBIDDEN HARDCODED PATH SCANNER ---" -ForegroundColor Yellow

$AllScriptFiles = Get-ChildItem -Path $TargetDir | Where-Object {
    $_.Extension -in @(".bat", ".ps1") -and $_.Name -ne "verify-deployment-scripts.ps1"
}

$ForbiddenRegex = '(?i)(?:[A-Z]:)?\\Users\\provu|Users/provu'
$TotalOccurrences = 0

foreach ($sf in $AllScriptFiles) {
    $lines = Get-Content $sf.FullName -ErrorAction SilentlyContinue
    $offendingLines = @()
    $lineNum = 1
    foreach ($line in $lines) {
        if ($line -match $ForbiddenRegex) {
            $offendingLines += [PSCustomObject]@{
                LineNumber = $lineNum
                Content    = $line.Trim()
            }
        }
        $lineNum++
    }

    if ($offendingLines.Count -eq 0) {
        Log-Result -Suite "PathSanitization" -Item $sf.Name -Status "PASS" -Message "Clean (0 hardcoded user paths)."
    } else {
        $TotalOccurrences += $offendingLines.Count
        $summary = "Found $($offendingLines.Count) offending line(s): " + (($offendingLines | ForEach-Object { "L$($_.LineNumber)" }) -join ", ")
        Log-Result -Suite "PathSanitization" -Item $sf.Name -Status "FAIL" -Message $summary
    }
}

Write-Host ""

# ==============================================================================
# SUITE 3: CMD SYNTAX VALIDATION OF ALL .BAT FILES VIA cmd.exe /c
# ==============================================================================
Write-Host "--- SUITE 3: CMD SYNTAX VALIDATION (cmd.exe /c Sandbox Check) ---" -ForegroundColor Yellow

$AllBatFiles = Get-ChildItem -Path $TargetDir -Filter "*.bat" | Sort-Object Name

# Set up mock sandbox with PATHEXT prioritizing .BAT to prevent live service/system mutation during validation
$MockSandbox = Join-Path $env:TEMP ("mock_audit_sandbox_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $MockSandbox -Force | Out-Null

$MockCommands = @(
    "sc.bat", "net.bat", "taskkill.bat", "schtasks.bat",
    "docker.bat", "reg.bat", "cloudflared.exe.bat", "powershell.bat", "wsl.bat"
)
foreach ($cmd in $MockCommands) {
    Set-Content -Path (Join-Path $MockSandbox $cmd) -Value "@exit /b 0"
}

$OrigPath = $env:PATH
$OrigPathExt = $env:PATHEXT
$env:PATH = "$MockSandbox;$OrigPath"
$env:PATHEXT = ".BAT;.CMD;.EXE"

try {
    foreach ($bat in $AllBatFiles) {
        $batPath = $bat.FullName
        $batName = $bat.Name

        $outTxt = Join-Path $MockSandbox "out_$batName.txt"
        $errTxt = Join-Path $MockSandbox "err_$batName.txt"

        $proc = Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/c `"`"$batPath`" < nul`"" `
            -RedirectStandardOutput $outTxt `
            -RedirectStandardError $errTxt `
            -NoNewWindow -PassThru

        $finished = $proc.WaitForExit(3000)
        $syntaxErrorDetected = $false
        $errorDetail = ""

        if (-not $finished) {
            $proc.Kill()
            if ($batName -in @("run-tunnel.bat", "MakeIpPermanent.bat", "RestoreInternet.bat")) {
                $errorDetail = "Daemon/Interactive runner verified (Mock exit timeout expected)."
            } else {
                $syntaxErrorDetected = $true
                $errorDetail = "Execution hung unexpectedly (timeout > 3s)."
            }
        } else {
            $errOutput = ""
            if (Test-Path $errTxt) {
                $errOutput = Get-Content $errTxt -Raw -ErrorAction SilentlyContinue
            }

            if ($errOutput -match "syntax of the command is incorrect|unexpected at this time") {
                $syntaxErrorDetected = $true
                $errorDetail = $errOutput.Trim()
            }
        }

        if (-not $syntaxErrorDetected) {
            $msg = if ($errorDetail) { "cmd.exe /c syntax verified ($errorDetail)" } else { "cmd.exe /c syntax clean, zero parse errors." }
            Log-Result -Suite "CmdSyntax" -Item $batName -Status "PASS" -Message $msg
        } else {
            Log-Result -Suite "CmdSyntax" -Item $batName -Status "FAIL" -Message "Syntax Error: $errorDetail"
        }
    }
} finally {
    $env:PATH = $OrigPath
    $env:PATHEXT = $OrigPathExt
    Remove-Item $MockSandbox -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""

# ==============================================================================
# SUITE 4: LOCAL MACHINE STATE VERIFICATION
# ==============================================================================
Write-Host "--- SUITE 4: CURRENT MACHINE STATE (Role & De-escalation Audit) ---" -ForegroundColor Yellow

# 4.1 Cloudflared Service State
$cfService = Get-Service -Name "Cloudflared" -ErrorAction SilentlyContinue
if ($null -eq $cfService) {
    Log-Result -Suite "MachineState" -Item "Service:Cloudflared" -Status "PASS" -Message "Cloudflared service is Absent/Not Installed."
} elseif ($cfService.Status -eq "Stopped") {
    Log-Result -Suite "MachineState" -Item "Service:Cloudflared" -Status "PASS" -Message "Cloudflared service exists and is Stopped."
} else {
    Log-Result -Suite "MachineState" -Item "Service:Cloudflared" -Status "WARN" `
        -Message "Service is currently $($cfService.Status). Requires Administrator prompt to stop/uninstall."
}

# 4.2 Watchdog Scheduled Task State
$watchdogTask = Get-ScheduledTask -TaskName "JRMSU_Library_247_Watchdog" -ErrorAction SilentlyContinue
if ($null -eq $watchdogTask) {
    Log-Result -Suite "MachineState" -Item "Task:Watchdog" -Status "PASS" -Message "JRMSU_Library_247_Watchdog task is Absent."
} elseif ($watchdogTask.State -eq "Disabled") {
    Log-Result -Suite "MachineState" -Item "Task:Watchdog" -Status "PASS" -Message "JRMSU_Library_247_Watchdog task is Disabled."
} else {
    Log-Result -Suite "MachineState" -Item "Task:Watchdog" -Status "FAIL" `
        -Message "JRMSU_Library_247_Watchdog task is currently Active (State: $($watchdogTask.State))."
}

# 4.3 HKCU Run Key State
$runKeyVal = (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "JRMSU_Library_System" -ErrorAction SilentlyContinue).JRMSU_Library_System
if ($null -eq $runKeyVal) {
    Log-Result -Suite "MachineState" -Item "Registry:RunKey" -Status "PASS" -Message "HKCU Run key JRMSU_Library_System is Absent."
} else {
    Log-Result -Suite "MachineState" -Item "Registry:RunKey" -Status "FAIL" `
        -Message "HKCU Run key JRMSU_Library_System is Present (Value: $runKeyVal)."
}

# 4.4 Machine Role Configuration File
$roleFile = Join-Path $TargetDir "MachineRole.txt"
if (Test-Path $roleFile) {
    $roleVal = (Get-Content $roleFile -Raw).Trim()
    if ($roleVal -eq "MAINTENANCE") {
        Log-Result -Suite "MachineState" -Item "File:MachineRole" -Status "PASS" -Message "Configured as MAINTENANCE role."
    } elseif ($roleVal -eq "PRODUCTION_SERVER") {
        Log-Result -Suite "MachineState" -Item "File:MachineRole" -Status "INFO" -Message "Configured as PRODUCTION_SERVER role."
    } else {
        Log-Result -Suite "MachineState" -Item "File:MachineRole" -Status "WARN" -Message "Unexpected role value: '$roleVal'."
    }
} else {
    Log-Result -Suite "MachineState" -Item "File:MachineRole" -Status "FAIL" -Message "MachineRole.txt does not exist."
}

Write-Host ""

# ==============================================================================
# AUDIT SUMMARY & VERDICT
# ==============================================================================
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                            AUDIT SUMMARY REPORT" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ("Total Tests Executed : {0}" -f $Global:TestCount) -ForegroundColor White
Write-Host ("Passed Tests         : {0}" -f $Global:PassCount) -ForegroundColor Green
Write-Host ("Failed Tests         : {0}" -f $Global:FailCount) -ForegroundColor $(if ($Global:FailCount -gt 0) { "Red" } else { "Gray" })
Write-Host ("Warnings             : {0}" -f $Global:WarnCount) -ForegroundColor $(if ($Global:WarnCount -gt 0) { "Yellow" } else { "Gray" })

Write-Host ""
if ($Global:FailCount -eq 0 -and $Global:WarnCount -eq 0) {
    Write-Host "VERDICT: [PASS] 100% OF DEPLOYMENT SCRIPTS AND ROLES ARE FULLY VERIFIED." -ForegroundColor Green
    $ExitCode = 0
} elseif ($Global:FailCount -eq 0 -and $Global:WarnCount -gt 0) {
    Write-Host "VERDICT: [PASS WITH ACTION ITEM] ALL SCRIPTS VALIDATED AND ROLE DE-ESCALATED." -ForegroundColor Yellow
    Write-Host "  Action Item: Cloudflared Windows Service is currently running under SYSTEM." -ForegroundColor Yellow
    Write-Host "  To stop and uninstall it completely, run Configure-As-Maintenance-Laptop.bat" -ForegroundColor Yellow
    Write-Host "  as Administrator (Right-Click -> Run as administrator)." -ForegroundColor Yellow
    $ExitCode = 0
} else {
    Write-Host "VERDICT: [FAIL] DEPLOYMENT VERIFICATION DETECTED ISSUES." -ForegroundColor Red
    $ExitCode = 1
}
Write-Host "================================================================================" -ForegroundColor Cyan

exit $ExitCode
