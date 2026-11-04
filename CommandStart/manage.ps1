# ==============================================================================
# JRMSU Library Landing Page & Management System -- Master Dev & Ops Controller
# Jose Rizal Memorial State University - Katipunan Campus Library
# Tailored for Local Development (SSMS 19 / SQL Server 1433 + Django :8000 + Vite :3000)
#
# Usage:
#   .\manage.ps1                          (Interactive ASCII Management Menu)
#   .\manage.ps1 start                    (Launches Django Backend :8000 & Vite Frontend :3000)
#   .\manage.ps1 stop                     (Terminates processes bound to ports 8000 & 3000)
#   .\manage.ps1 status                   (Probes ports 8000, 3000, 1433, HTTP health & MSSQL connectivity)
#   .\manage.ps1 migrate                  (Executes Django database migrations)
#   .\manage.ps1 test                     (Runs backend REST API tests, DB verification & frontend listener check)
#   .\manage.ps1 refresh                  (Purges Vite and build caches, then restarts services cleanly)
#   .\manage.ps1 createsuperadmin <user> <email> [password]  (Creates protected administrative account)
#   .\manage.ps1 adduser <user> <email> <role>               (Registers user: Admin, Staff, Student/Patron)
#   .\manage.ps1 listusers                (Renders registered database accounts in formatted ASCII table)
# ==============================================================================

param (
    [Parameter(Position=0)]
    [string]$Action = "",

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$CmdArgs = @()
)

$ErrorActionPreference = "Stop"

# Resolve Directory Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ParentDir = Split-Path -Parent $ScriptDir
$AppDir = Join-Path $ParentDir "JRMSULibrary-web-PAGE"

if (-not (Test-Path $AppDir)) {
    # Fallback to current folder if executed within JRMSULibrary-web-PAGE
    if (Test-Path (Join-Path $ScriptDir "backend")) {
        $AppDir = $ScriptDir
    } else {
        $AppDir = Join-Path $env:USERPROFILE "Desktop\JRMSU LIBRARY LANGDING PAGE\JRMSULibrary-web-PAGE"
    }
}

$BackendDir  = Join-Path $AppDir "backend"
$FrontendDir = Join-Path $AppDir "frontend"

$AllArgs = if ($CmdArgs -and $CmdArgs.Count -gt 0) { $CmdArgs } else { $args }

# SQL Server Configuration (SSMS 19 / Windows Authentication)
$DbServer = "localhost"
$DbPort   = 1433
$DbName   = "JRMSUKatipunanCampusLibrary"
$DbConnectionString = "Server=$DbServer;Database=$DbName;Integrated Security=True;TrustServerCertificate=True;"

# ─── Console Styling Helpers ──────────────────────────────────────────────────
function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "==============================================================================" -ForegroundColor Cyan
    Write-Host "  JRMSU LIBRARY SYSTEM -- $Title" -ForegroundColor Yellow
    Write-Host "  Jose Rizal Memorial State University - Katipunan Campus" -ForegroundColor DarkCyan
    Write-Host "==============================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Msg)
    Write-Host "  [OK] $Msg" -ForegroundColor Green
}

function Write-Info {
    param([string]$Msg)
    Write-Host "  [*] $Msg" -ForegroundColor Cyan
}

function Write-Warn {
    param([string]$Msg)
    Write-Host "  [!] $Msg" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Msg)
    Write-Host "  [ERROR] $Msg" -ForegroundColor Red
}

# ─── Password Hashing (Django PBKDF2 SHA256 standard) ─────────────────────────
function Get-DjangoPBKDF2Hash([string]$plainPassword) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $saltBytes = New-Object byte[] 16
    $rng.GetBytes($saltBytes)
    $salt = ""
    for ($i = 0; $i -lt 16; $i++) {
        $salt += $chars[$saltBytes[$i] % $chars.Length]
    }
    
    $saltUtf8 = [System.Text.Encoding]::UTF8.GetBytes($salt)
    $passUtf8 = [System.Text.Encoding]::UTF8.GetBytes($plainPassword)
    $iterations = 600000
    $kdf = [System.Security.Cryptography.Rfc2898DeriveBytes]::new($passUtf8, $saltUtf8, $iterations, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
    $hash = [Convert]::ToBase64String($kdf.GetBytes(32))
    return "pbkdf2_sha256`$$iterations`$$salt`$$hash"
}

# ─── SQL Server ADO.NET Helper ────────────────────────────────────────────────
function Test-SqlServerConnection {
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "SELECT DB_NAME()"
        $currentDb = $cmd.ExecuteScalar()
        $conn.Close()
        return @{ Success = $true; Database = $currentDb }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# ─── Prerequisites Verification ───────────────────────────────────────────────
function Check-Prerequisites {
    Write-Info "Verifying development environment prerequisites..."
    $allOk = $true

    # 1. Python Check
    try {
        $pyVer = & python --version 2>&1
        if ($LASTEXITCODE -eq 0 -or $pyVer -like "*Python*") {
            Write-Success "Python runtime: $pyVer"
        } else {
            throw "Python returned non-zero"
        }
    } catch {
        try {
            $pyVer = & py -V 2>&1
            Write-Success "Python runtime (py launcher): $pyVer"
        } catch {
            Write-Warn "Python runtime not detected in PATH. Backend commands may require Python 3.11+."
        }
    }

    # 2. Node.js Check
    try {
        $nodeVer = & node --version 2>$null
        Write-Success "Node.js runtime: $nodeVer"
    } catch {
        Write-Err "Node.js is not installed or not in PATH! Download from https://nodejs.org/"
        $allOk = $false
    }

    # 3. npm Check
    try {
        $npmVer = & npm --version 2>$null
        Write-Success "npm package manager: v$npmVer"
    } catch {
        Write-Err "npm is not installed!"
        $allOk = $false
    }

    # 4. .NET SDK Check
    try {
        $dotnetVer = & dotnet --version 2>$null
        Write-Success ".NET SDK: v$dotnetVer"
    } catch {
        Write-Info ".NET SDK not installed (optional, used for extended toolkits)."
    }

    # 5. SQL Server Check
    $dbTest = Test-SqlServerConnection
    if ($dbTest.Success) {
        Write-Success "Microsoft SQL Server: Connected to '$($dbTest.Database)' on localhost:1433"
    } else {
        Write-Warn "Microsoft SQL Server: Cannot connect to '$DbName' ($($dbTest.Error))"
        Write-Warn "Ensure SQL Server (MSSQLSERVER) is running in SSMS 19 or Windows Services."
    }

    # 6. Frontend node_modules Check
    $nmPath = Join-Path $FrontendDir "node_modules"
    if (-not (Test-Path $nmPath)) {
        Write-Warn "Frontend node_modules not detected. Installing dependencies via npm..."
        Push-Location $FrontendDir
        & npm install
        Pop-Location
        Write-Success "Frontend dependencies installed successfully."
    }

    return $allOk
}

# ─── Stop All Services ────────────────────────────────────────────────────────
function Stop-AllServices {
    Write-Header "STOPPING ALL RUNNING SERVICES (PORTS 8000 & 3000)"
    
    $ports = @(8000, 3000)
    $killedCount = 0

    foreach ($port in $ports) {
        try {
            $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($conns) {
                foreach ($conn in $conns) {
                    $pidToKill = $conn.OwningProcess
                    if ($pidToKill -gt 0 -and $pidToKill -ne $PID) {
                        try {
                            $proc = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
                            if ($proc) {
                                Write-Warn "Terminating process '$($proc.ProcessName)' (PID: $pidToKill) on port $port..."
                                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                                $killedCount++
                            }
                        } catch {}
                    }
                }
            }
        } catch {}
    }

    # Netstat fallback for stale listeners
    if ($killedCount -eq 0) {
        foreach ($port in $ports) {
            $lines = netstat -ano | Select-String ":$port\s+.*LISTENING\s+(\d+)"
            foreach ($line in $lines) {
                if ($line.Matches.Groups[1].Value) {
                    $pidToKill = [int]$line.Matches.Groups[1].Value
                    if ($pidToKill -gt 0 -and $pidToKill -ne $PID) {
                        Write-Warn "Terminating listener PID $pidToKill on port $port..."
                        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                        $killedCount++
                    }
                }
            }
        }
    }

    if ($killedCount -gt 0) {
        Write-Success "Successfully stopped $killedCount service process(es). Ports 8000 and 3000 are now clear."
    } else {
        Write-Info "No active services detected on ports 8000 or 3000."
    }
}

# ─── Live Status Matrix ───────────────────────────────────────────────────────
function Show-Status {
    Write-Header "SYSTEM LIVE STATUS & PORT MATRIX"

    $services = @(
        @{ Port = 8000;  Name = "Django Backend API"; Target = "http://localhost:8000/api/"; Role = "REST API Controllers, Auth & Core Features" },
        @{ Port = 3000;  Name = "Vite React Frontend"; Target = "http://localhost:3000/";     Role = "Patron Portal & Admin Dashboard" },
        @{ Port = 1433;  Name = "MS SQL Server 19";    Target = "";                           Role = "JRMSUKatipunanCampusLibrary (MSSQLSERVER)" },
        @{ Port = 11434; Name = "Ollama AI Assistant"; Target = "http://localhost:11434/";   Role = "Dr. Rizal AI Local Inference Engine" },
        @{ Port = 6379;  Name = "Redis Cache & Queue"; Target = "";                           Role = "Sub-10ms FAQ Cache & Celery Tasks" }
    )

    $format = "{0,-6} | {1,-22} | {2,-8} | {3,-12} | {4,-14} | {5}"
    Write-Host ($format -f "PORT", "SERVICE NAME", "PID", "TCP STATUS", "HTTP HEALTH", "DESCRIPTION") -ForegroundColor Yellow
    Write-Host ("-" * 102) -ForegroundColor DarkGray

    foreach ($svc in $services) {
        $p = $svc.Port
        $procId = "-"
        $tcpStatus = "OFFLINE"
        $httpStatus = "UNKNOWN"

        # Check TCP Listener
        try {
            $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($conn) {
                $procId = $conn.OwningProcess
                $tcpStatus = "LISTENING"
            }
        } catch {}

        if ($tcpStatus -eq "OFFLINE") {
            $match = netstat -ano | Select-String ":$p\s+.*LISTENING\s+(\d+)" | Select-Object -First 1
            if ($match -and $match.Matches.Groups[1].Value) {
                $procId = [int]$match.Matches.Groups[1].Value
                $tcpStatus = "LISTENING"
            }
        }

        # Check HTTP Endpoint
        if ($svc.Target -and $tcpStatus -eq "LISTENING") {
            try {
                $resp = Invoke-WebRequest -Uri $svc.Target -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
                $httpStatus = "$($resp.StatusCode) OK"
            } catch {
                $httpStatus = "NO RESPONSE"
            }
        } elseif ($p -eq 1433) {
            $dbCheck = Test-SqlServerConnection
            if ($dbCheck.Success) {
                $httpStatus = "CONNECTED (SQL)"
            } else {
                $httpStatus = "DISCONNECTED"
            }
        } else {
            $httpStatus = if ($tcpStatus -eq "LISTENING") { "ACTIVE" } else { "DOWN" }
        }

        $color = if ($tcpStatus -eq "LISTENING" -and $httpStatus -like "*OK*") {
            "Green"
        } elseif ($tcpStatus -eq "LISTENING" -or $httpStatus -like "*CONN*") {
            "Cyan"
        } else {
            "DarkGray"
        }

        Write-Host ($format -f $p, $svc.Name, $procId, $tcpStatus, $httpStatus, $svc.Role) -ForegroundColor $color
    }

    Write-Host ("-" * 102) -ForegroundColor DarkGray
    Write-Host ""

    # Database Summary Telemetry
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "SELECT COUNT(*) FROM Features_account"
        $userCount = $cmd.ExecuteScalar()
        $cmd.CommandText = "SELECT COUNT(*) FROM Features_account WHERE is_superuser = 1"
        $adminCount = $cmd.ExecuteScalar()
        $cmd.CommandText = "SELECT COUNT(*) FROM Features_account WHERE is_terminal_created = 1"
        $termCount = $cmd.ExecuteScalar()
        $conn.Close()

        Write-Host "  Database Telemetry ($DbName):" -ForegroundColor Yellow
        Write-Host "    - Registered Accounts: $userCount total ($adminCount SuperAdmins, $termCount Protected CLI Admins)" -ForegroundColor White
        Write-Host "    - Authentication Mode: Windows Authentication (Integrated Security)" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Warn "Could not fetch SQL Server telemetry: $($_.Exception.Message)"
    }
}

# ─── Start All Services ───────────────────────────────────────────────────────
function Start-AllServices {
    Write-Header "STARTING JRMSU LIBRARY SERVICES (BACKEND :8000 | FRONTEND :3000)"
    
    if (-not (Check-Prerequisites)) {
        Write-Warn "Prerequisite verification reported warnings. Continuing startup attempt..."
    }

    # 1. Stop conflicting listeners on ports 8000 & 3000
    Stop-AllServices

    # 2. Start Django Backend on Port 8000
    Write-Info "Launching Django REST API Backend on http://localhost:8000..."
    $backendCmd = "Set-Location '$BackendDir'; python manage.py runserver 8000"
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "& { Write-Host 'JRMSU Library Backend (Django REST API :8000)' -ForegroundColor Cyan; $backendCmd }"

    # Wait for backend to begin listening
    Write-Info "Waiting for Django backend to initialize..."
    $retry = 0
    $backendReady = $false
    while ($retry -lt 8 -and -not $backendReady) {
        Start-Sleep -Seconds 1
        try {
            $testReq = Invoke-WebRequest -Uri "http://localhost:8000/api/" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($testReq.StatusCode -eq 200 -or $testReq.StatusCode -eq 404 -or $testReq.StatusCode -eq 301 -or $testReq.StatusCode -eq 302) {
                $backendReady = $true
            }
        } catch {
            $retry++
        }
    }

    if ($backendReady) {
        Write-Success "Backend API initialized and responsive on http://localhost:8000/api/"
    } else {
        Write-Info "Backend process spawned in separate terminal window. Proceeding to launch UI..."
    }

    # 3. Start Vite React Frontend on Port 3000
    Write-Info "Launching Vite React Frontend on http://localhost:3000..."
    $frontendCmd = "Set-Location '$FrontendDir'; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "& { Write-Host 'JRMSU Library Frontend (Vite React :3000)' -ForegroundColor Green; $frontendCmd }"

    Start-Sleep -Seconds 2

    # 4. Print Access Endpoints
    Write-Host ""
    Write-Host "==============================================================================" -ForegroundColor Green
    Write-Host "  JRMSU LIBRARY SERVICES SUCCESSFULLY LAUNCHED!" -ForegroundColor Green
    Write-Host "==============================================================================" -ForegroundColor Green
    Write-Host "  * Public Web Landing Page:  http://localhost:3000" -ForegroundColor White
    Write-Host "  * Librarian Admin Portal:   http://localhost:3000/admin" -ForegroundColor White
    Write-Host "  * Django Backend REST API:  http://localhost:8000/api/" -ForegroundColor White
    Write-Host "  * Django Admin Panel:       http://localhost:8000/admin/" -ForegroundColor White
    Write-Host "==============================================================================" -ForegroundColor Green
    Write-Host ""

    # 5. Launch Browser Preview
    Write-Info "Opening browser preview to http://localhost:3000..."
    try {
        Start-Process "http://localhost:3000"
    } catch {}
}

# ─── Hard Refresh & Clean Rebuild ─────────────────────────────────────────────
function Hard-Refresh {
    Write-Header "HARD REFRESH & CACHE PURGE (PORTS 8000 & 3000)"
    
    # 1. Stop existing services
    Stop-AllServices

    # 2. Clean Vite caches and build artifacts
    Write-Info "Purging Vite caches and build artifacts..."
    $viteCache = Join-Path $FrontendDir "node_modules\.vite"
    if (Test-Path $viteCache) {
        Remove-Item -Recurse -Force $viteCache -ErrorAction SilentlyContinue
        Write-Success "Removed $viteCache"
    }
    $distFolder = Join-Path $FrontendDir "dist"
    if (Test-Path $distFolder) {
        Remove-Item -Recurse -Force $distFolder -ErrorAction SilentlyContinue
        Write-Success "Removed $distFolder"
    }
    $rootVite = Join-Path $AppDir ".vite"
    if (Test-Path $rootVite) {
        Remove-Item -Recurse -Force $rootVite -ErrorAction SilentlyContinue
        Write-Success "Removed $rootVite"
    }

    # 3. Clean Python bytecode caches
    Write-Info "Purging Python __pycache__ bytecodes..."
    Get-ChildItem -Path $BackendDir -Filter "__pycache__" -Directory -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue
    }
    Write-Success "Python bytecode caches cleared."

    # 4. Restart Services Fresh
    Start-AllServices
}

# ─── Database Migrations ──────────────────────────────────────────────────────
function Run-DatabaseMigrations {
    Write-Header "DJANGO DATABASE MIGRATIONS"

    Write-Info "Running: python manage.py migrate inside $BackendDir..."
    try {
        Push-Location $BackendDir
        & python manage.py migrate
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database migrations applied successfully."
        } else {
            Write-Warn "Python migrate command completed with exit code $LASTEXITCODE."
        }
        Pop-Location
    } catch {
        Write-Err "Failed to run migrations: $($_.Exception.Message)"
        Pop-Location
    }
}

# ─── Health & API Integration Tests ───────────────────────────────────────────
function Run-HealthTests {
    Write-Header "HEALTH & REST API INTEGRATION TESTS"

    # Test 1: Port 8000 Listener
    Write-Info "[1/4] Checking Django Backend port 8000..."
    $beConn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
    if ($beConn) {
        Write-Success "Backend TCP listener is active on port 8000 (PID: $($beConn.OwningProcess))."
    } else {
        Write-Warn "Backend is not currently listening on port 8000. Start services with Option [1]."
    }

    # Test 2: Port 3000 Listener
    Write-Info "[2/4] Checking Vite React Frontend port 3000..."
    $feConn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($feConn) {
        Write-Success "Frontend TCP listener is active on port 3000 (PID: $($feConn.OwningProcess))."
    } else {
        Write-Warn "Frontend is not currently listening on port 3000."
    }

    # Test 3: SQL Server Database Connectivity
    Write-Info "[3/4] Testing Microsoft SQL Server ($DbName)..."
    $dbTest = Test-SqlServerConnection
    if ($dbTest.Success) {
        Write-Success "SQL Server connection verified: Database '$($dbTest.Database)' accessible."
    } else {
        Write-Err "SQL Server connection failed: $($dbTest.Error)"
    }

    # Test 4: Live HTTP REST endpoint test
    Write-Info "[4/4] Testing Backend HTTP response..."
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8000/api/" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Success "GET http://localhost:8000/api/ responded with Status $($resp.StatusCode) OK."
    } catch {
        Write-Warn "HTTP endpoint probe failed or service is offline ($($_.Exception.Message))."
    }
}

# ─── User Management Routines ─────────────────────────────────────────────────
function Show-RegisteredUsers {
    Write-Header "REGISTERED DATABASE USERS (Features_account)"

    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "SELECT id, username, email, is_superuser, is_staff, is_librarian, is_guest, is_terminal_created, is_active, last_login, date_joined FROM Features_account ORDER BY id ASC"
        $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
        $dataset = New-Object System.Data.DataSet
        $adapter.Fill($dataset) | Out-Null
        $conn.Close()

        $table = $dataset.Tables[0]
        if ($table.Rows.Count -eq 0) {
            Write-Warn "No user accounts found in database."
            return
        }

        Write-Host "  Total Accounts Registered: $($table.Rows.Count)" -ForegroundColor Green
        Write-Host ""

        $fmt = "{0,-4} | {1,-26} | {2,-28} | {3,-15} | {4,-12} | {5,-10}"
        Write-Host ($fmt -f "ID", "USERNAME", "EMAIL", "ROLE", "PROTECTED", "ACTIVE") -ForegroundColor Yellow
        Write-Host ("-" * 102) -ForegroundColor DarkGray

        foreach ($row in $table.Rows) {
            $isSuper = [bool]$row["is_superuser"]
            $isStaff = [bool]$row["is_staff"]
            $isLibrarian = [bool]$row["is_librarian"]
            $isProtected = [bool]$row["is_terminal_created"]
            $isActive    = [bool]$row["is_active"]

            $role = "Student/Patron"
            if ($isSuper) {
                $role = "SuperAdmin"
            } elseif ($isLibrarian) {
                $role = "Librarian/Staff"
            } elseif ($isStaff) {
                $role = "Staff"
            }

            $protStr = if ($isProtected) { "YES (CLI)" } else { "No" }
            $actStr  = if ($isActive) { "Active" } else { "Inactive" }

            $color = if ($isSuper) { "Green" } elseif ($isLibrarian -or $isStaff) { "Yellow" } else { "White" }
            Write-Host ($fmt -f $row["id"], $row["username"], $row["email"], $role, $protStr, $actStr) -ForegroundColor $color
        }

        Write-Host ("-" * 102) -ForegroundColor DarkGray
        Write-Host ""
    } catch {
        Write-Err "Could not query users from SQL Server: $($_.Exception.Message)"
    }
}

function New-SuperAdmin {
    param(
        [string]$Username,
        [string]$Email,
        [string]$Password
    )

    Write-Header "CREATE SUPERADMINISTRATIVE ACCOUNT"

    if ([string]::IsNullOrWhiteSpace($Username)) {
        $Username = Read-Host "Enter SuperAdmin Username"
    }
    if ([string]::IsNullOrWhiteSpace($Email)) {
        $Email = Read-Host "Enter SuperAdmin Email"
    }
    if ([string]::IsNullOrWhiteSpace($Password)) {
        $Password = Read-Host "Enter Password (leave empty for default 'Admin@123456!')"
        if ([string]::IsNullOrWhiteSpace($Password)) {
            $Password = "Admin@123456!"
        }
    }

    if ([string]::IsNullOrWhiteSpace($Username) -or [string]::IsNullOrWhiteSpace($Email)) {
        Write-Err "Username and Email are required!"
        return
    }

    Write-Info "Generating secure PBKDF2 SHA256 password hash for '$Username'..."
    $hashedPassword = Get-DjangoPBKDF2Hash $Password

    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()
        
        # Check if user already exists
        $checkCmd = $conn.CreateCommand()
        $checkCmd.CommandText = "SELECT COUNT(*) FROM Features_account WHERE username = @user"
        $checkCmd.Parameters.AddWithValue("@user", $Username) | Out-Null
        $exists = [int]$checkCmd.ExecuteScalar()

        if ($exists -gt 0) {
            Write-Warn "User '$Username' already exists. Promoting to SuperAdmin & updating password..."
            $updCmd = $conn.CreateCommand()
            $updCmd.CommandText = @"
                UPDATE Features_account 
                SET password = @pass, 
                    email = @email, 
                    is_superuser = 1, 
                    is_staff = 1, 
                    is_librarian = 1, 
                    is_guest = 0, 
                    is_terminal_created = 1, 
                    is_active = 1 
                WHERE username = @user
"@
            $updCmd.Parameters.AddWithValue("@pass", $hashedPassword) | Out-Null
            $updCmd.Parameters.AddWithValue("@email", $Email) | Out-Null
            $updCmd.Parameters.AddWithValue("@user", $Username) | Out-Null
            $updCmd.ExecuteNonQuery() | Out-Null
            Write-Success "Account '$Username' successfully updated to Protected SuperAdmin."
        } else {
            Write-Info "Creating new Protected SuperAdmin account '$Username'..."
            $insCmd = $conn.CreateCommand()
            $insCmd.CommandText = @"
                INSERT INTO Features_account 
                (username, email, password, first_name, last_name, is_superuser, is_staff, is_librarian, is_guest, is_terminal_created, is_active, date_joined)
                VALUES 
                (@user, @email, @pass, 'Super', 'Admin', 1, 1, 1, 0, 1, 1, SYSDATETIMEOFFSET())
"@
            $insCmd.Parameters.AddWithValue("@user", $Username) | Out-Null
            $insCmd.Parameters.AddWithValue("@email", $Email) | Out-Null
            $insCmd.Parameters.AddWithValue("@pass", $hashedPassword) | Out-Null
            $insCmd.ExecuteNonQuery() | Out-Null
            Write-Success "SuperAdmin '$Username' created successfully with CLI Terminal Protection!"
        }
        $conn.Close()

        Write-Host ""
        Write-Host "  Credentials Summary:" -ForegroundColor Yellow
        Write-Host "    Username: $Username" -ForegroundColor White
        Write-Host "    Email:    $Email" -ForegroundColor White
        Write-Host "    Password: $Password" -ForegroundColor White
        Write-Host "    Role:     SuperAdmin / Librarian (is_terminal_created=True)" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Err "Failed to create SuperAdmin in database: $($_.Exception.Message)"
    }
}

function New-UserAccount {
    param(
        [string]$Username,
        [string]$Email,
        [string]$Role,
        [string]$Password
    )

    Write-Header "REGISTER NEW USER ACCOUNT"

    if ([string]::IsNullOrWhiteSpace($Username)) {
        $Username = Read-Host "Enter Username"
    }
    if ([string]::IsNullOrWhiteSpace($Email)) {
        $Email = Read-Host "Enter Email"
    }
    if ([string]::IsNullOrWhiteSpace($Role)) {
        $Role = Read-Host "Enter Role [Admin / Staff / Student] (Default: Student)"
        if ([string]::IsNullOrWhiteSpace($Role)) { $Role = "Student" }
    }
    if ([string]::IsNullOrWhiteSpace($Password)) {
        $Password = Read-Host "Enter Password (leave empty for default 'User@123456!')"
        if ([string]::IsNullOrWhiteSpace($Password)) { $Password = "User@123456!" }
    }

    $isSuper = if ($Role -match "Admin") { 1 } else { 0 }
    $isStaff = if ($Role -match "Admin|Staff") { 1 } else { 0 }
    $isLibrarian = if ($Role -match "Staff") { 1 } else { 0 }
    $isGuest = if ($isStaff -eq 0 -and $isSuper -eq 0) { 1 } else { 0 }

    $hashedPassword = Get-DjangoPBKDF2Hash $Password

    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()
        
        $insCmd = $conn.CreateCommand()
        $insCmd.CommandText = @"
            INSERT INTO Features_account 
            (username, email, password, first_name, last_name, is_superuser, is_staff, is_librarian, is_guest, is_terminal_created, is_active, date_joined)
            VALUES 
            (@user, @email, @pass, 'New', 'User', @super, @staff, @lib, @guest, 1, 1, SYSDATETIMEOFFSET())
"@
        $insCmd.Parameters.AddWithValue("@user", $Username) | Out-Null
        $insCmd.Parameters.AddWithValue("@email", $Email) | Out-Null
        $insCmd.Parameters.AddWithValue("@pass", $hashedPassword) | Out-Null
        $insCmd.Parameters.AddWithValue("@super", $isSuper) | Out-Null
        $insCmd.Parameters.AddWithValue("@staff", $isStaff) | Out-Null
        $insCmd.Parameters.AddWithValue("@lib", $isLibrarian) | Out-Null
        $insCmd.Parameters.AddWithValue("@guest", $isGuest) | Out-Null
        $insCmd.ExecuteNonQuery() | Out-Null
        $conn.Close()

        Write-Success "User '$Username' ($Role) successfully registered in database!"
    } catch {
        Write-Err "Failed to register user: $($_.Exception.Message)"
    }
}

# ─── Command Line Parameter Dispatcher ────────────────────────────────────────
switch ($Action.ToLower()) {
    "start" {
        Start-AllServices
        exit 0
    }
    "stop" {
        Stop-AllServices
        exit 0
    }
    "status" {
        Show-Status
        exit 0
    }
    "migrate" {
        Run-DatabaseMigrations
        exit 0
    }
    "test" {
        Run-HealthTests
        exit 0
    }
    "refresh" {
        Hard-Refresh
        exit 0
    }
    "createsuperadmin" {
        $u = if ($AllArgs.Count -ge 1) { $AllArgs[0] } else { "" }
        $e = if ($AllArgs.Count -ge 2) { $AllArgs[1] } else { "" }
        $p = if ($AllArgs.Count -ge 3) { $AllArgs[2] } else { "" }
        New-SuperAdmin -Username $u -Email $e -Password $p
        exit 0
    }
    "adduser" {
        $u = if ($AllArgs.Count -ge 1) { $AllArgs[0] } else { "" }
        $e = if ($AllArgs.Count -ge 2) { $AllArgs[1] } else { "" }
        $r = if ($AllArgs.Count -ge 3) { $AllArgs[2] } else { "" }
        New-UserAccount -Username $u -Email $e -Role $r
        exit 0
    }
    "listusers" {
        Show-RegisteredUsers
        exit 0
    }
}

# ─── Interactive ASCII Menu ───────────────────────────────────────────────────
do {
    Clear-Host
    Write-Host "==============================================================================" -ForegroundColor Cyan
    Write-Host "   JRMSU KATIPUNAN CAMPUS LIBRARY -- MASTER DEV & OPS CONTROLLER              " -ForegroundColor Yellow
    Write-Host "   Local Full-Stack Runtime Orchestrator (Backend :8000 | Frontend :3000)     " -ForegroundColor DarkCyan
    Write-Host "==============================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1]  Start All Services (Django Backend :8000 & Vite Frontend :3000)" -ForegroundColor Green
    Write-Host "  [2]  Stop All Services (Terminate Ports 8000 & 3000)" -ForegroundColor Yellow
    Write-Host "  [3]  System Status & Port Matrix Probe" -ForegroundColor Cyan
    Write-Host "  [4]  Hard Refresh & Clean Rebuild (Purge Caches & Restart)" -ForegroundColor Magenta
    Write-Host "  [5]  Run Database Migrations (python manage.py migrate)" -ForegroundColor White
    Write-Host "  [6]  Run Health & API Integration Tests" -ForegroundColor White
    Write-Host "  [7]  Create Protected SuperAdmin Account" -ForegroundColor Green
    Write-Host "  [8]  Register New User Account (Admin / Staff / Student)" -ForegroundColor White
    Write-Host "  [9]  List All Registered Database Accounts (ASCII Table)" -ForegroundColor Yellow
    Write-Host "  [10] Launch Governance CLI Console (cli.ps1)" -ForegroundColor DarkCyan
    Write-Host "  [0]  Exit" -ForegroundColor Red
    Write-Host ""
    Write-Host "==============================================================================" -ForegroundColor Cyan
    $choice = Read-Host "Select an option [0-10]"

    switch ($choice) {
        "1"  { Start-AllServices; Read-Host "Press Enter to return to menu..." }
        "2"  { Stop-AllServices; Read-Host "Press Enter to return to menu..." }
        "3"  { Show-Status; Read-Host "Press Enter to return to menu..." }
        "4"  { Hard-Refresh; Read-Host "Press Enter to return to menu..." }
        "5"  { Run-DatabaseMigrations; Read-Host "Press Enter to return to menu..." }
        "6"  { Run-HealthTests; Read-Host "Press Enter to return to menu..." }
        "7"  { New-SuperAdmin; Read-Host "Press Enter to return to menu..." }
        "8"  { New-UserAccount; Read-Host "Press Enter to return to menu..." }
        "9"  { Show-RegisteredUsers; Read-Host "Press Enter to return to menu..." }
        "10" {
            $cliScript = Join-Path $ScriptDir "cli.ps1"
            if (Test-Path $cliScript) {
                & powershell -NoProfile -ExecutionPolicy Bypass -File $cliScript
            } else {
                Write-Warn "cli.ps1 not found in $ScriptDir"
                Read-Host "Press Enter to return to menu..."
            }
        }
        "0"  { exit 0 }
    }
} while ($true)
