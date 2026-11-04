<#
.SYNOPSIS
    JRMSU Library Landing Page & Management System - Administrative Terminal Governance CLI
.DESCRIPTION
    Root administrative CLI console for Jose Rizal Memorial State University (JRMSU)
    Katipunan Campus Library. Provides high-security user governance, role visualization,
    tamper-evident terminal account protection, and database administration directly
    interfacing with Microsoft SQL Server (SSMS 19) and Django Auth frameworks.
.EXAMPLE
    .\cli.ps1 listusers
    .\cli.ps1 createsuperadmin sysadmin librarian@jrmsu.edu.ph SecurePass123!
    .\cli.ps1 adduser staff1 staff@jrmsu.edu.ph Staff StaffPass123!
    .\cli.ps1 resetpassword admin1 NewSecurePass2026!
    .\cli.ps1 diagnostics
#>

param(
    [Parameter(Position=0)]
    [string]$Command = "",

    [Parameter(Position=1)]
    [string]$Arg1 = "",

    [Parameter(Position=2)]
    [string]$Arg2 = "",

    [Parameter(Position=3)]
    [string]$Arg3 = "",

    [Parameter(Position=4)]
    [string]$Arg4 = ""
)

$ErrorActionPreference = "Stop"

# Database Configuration (SSMS 19 / Windows Authentication)
$DbServer = "localhost"
$DbName   = "JRMSUKatipunanCampusLibrary"
$DbConnectionString = "Server=$DbServer;Database=$DbName;Integrated Security=True;TrustServerCertificate=True;"

function Show-Header {
    Write-Host ""
    Write-Host "==========================================================================================" -ForegroundColor Cyan
    Write-Host "          JRMSU KATIPUNAN CAMPUS LIBRARY -- ROOT TERMINAL GOVERNANCE CLI                  " -ForegroundColor Yellow
    Write-Host "          Administrative User Management, Role Auditing & Terminal Security Controls      " -ForegroundColor DarkCyan
    Write-Host "==========================================================================================" -ForegroundColor Cyan
    Write-Host ""
}

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

function Invoke-ListUsers {
    Show-Header
    Write-Host "[*] Fetching registered accounts from $DbName..." -ForegroundColor Gray

    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = @"
            SELECT id, username, email, is_superuser, is_staff, is_librarian, is_guest, 
                   is_terminal_created, is_active, last_login, date_joined 
            FROM Features_account 
            ORDER BY is_superuser DESC, is_librarian DESC, id ASC
"@
        $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
        $dataset = New-Object System.Data.DataSet
        $adapter.Fill($dataset) | Out-Null
        $conn.Close()

        $table = $dataset.Tables[0]
        if ($table.Rows.Count -eq 0) {
            Write-Host "  No registered accounts found in database." -ForegroundColor Yellow
            return
        }

        Write-Host "  Registered Accounts: $($table.Rows.Count)" -ForegroundColor Green
        Write-Host ""

        # Formatted ASCII Table Header
        $fmt = "{0,-4} | {1,-26} | {2,-28} | {3,-16} | {4,-14} | {5,-10}"
        Write-Host ($fmt -f "ID", "USERNAME", "EMAIL", "ROLE / PRIVILEGE", "CLI-PROTECTED", "STATUS") -ForegroundColor Yellow
        Write-Host ("=" * 106) -ForegroundColor DarkCyan

        foreach ($row in $table.Rows) {
            $isSuper = [bool]$row["is_superuser"]
            $isStaff = [bool]$row["is_staff"]
            $isLibrarian = [bool]$row["is_librarian"]
            $isProtected = [bool]$row["is_terminal_created"]
            $isActive    = [bool]$row["is_active"]

            $role = "Student / Patron"
            if ($isSuper) {
                $role = "[SuperAdmin]"
            } elseif ($isLibrarian) {
                $role = "[Chief Librarian]"
            } elseif ($isStaff) {
                $role = "[Library Staff]"
            }

            $protBadge = if ($isProtected) { "IMMUTABLE (CLI)" } else { "Web Managed" }
            $statusBadge = if ($isActive) { "ACTIVE" } else { "DISABLED" }

            $rowColor = if ($isSuper) {
                "Green"
            } elseif ($isLibrarian -or $isStaff) {
                "Yellow"
            } else {
                "White"
            }

            Write-Host ($fmt -f $row["id"], $row["username"], $row["email"], $role, $protBadge, $statusBadge) -ForegroundColor $rowColor
        }

        Write-Host ("=" * 106) -ForegroundColor DarkCyan
        Write-Host ""
    } catch {
        Write-Host "  [ERROR] Database error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Invoke-CreateSuperAdmin($username, $email, $password) {
    Show-Header
    if ([string]::IsNullOrWhiteSpace($username)) {
        $username = Read-Host "Enter SuperAdmin Username"
    }
    if ([string]::IsNullOrWhiteSpace($email)) {
        $email = Read-Host "Enter SuperAdmin Email"
    }
    if ([string]::IsNullOrWhiteSpace($password)) {
        $password = Read-Host "Enter Password (Default: Admin@123456!)"
        if ([string]::IsNullOrWhiteSpace($password)) { $password = "Admin@123456!" }
    }

    if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($email)) {
        Write-Host "  [ERROR] Username and Email are required!" -ForegroundColor Red
        return
    }

    $hash = Get-DjangoPBKDF2Hash $password

    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()

        $checkCmd = $conn.CreateCommand()
        $checkCmd.CommandText = "SELECT COUNT(*) FROM Features_account WHERE username = @user"
        $checkCmd.Parameters.AddWithValue("@user", $username) | Out-Null
        $exists = [int]$checkCmd.ExecuteScalar()

        if ($exists -gt 0) {
            Write-Host "  [*] Account '$username' exists. Upgrading to Protected SuperAdmin..." -ForegroundColor Cyan
            $upd = $conn.CreateCommand()
            $upd.CommandText = @"
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
            $upd.Parameters.AddWithValue("@pass", $hash) | Out-Null
            $upd.Parameters.AddWithValue("@email", $email) | Out-Null
            $upd.Parameters.AddWithValue("@user", $username) | Out-Null
            $upd.ExecuteNonQuery() | Out-Null
            Write-Host "  [OK] Successfully upgraded '$username' to Protected SuperAdmin." -ForegroundColor Green
        } else {
            Write-Host "  [*] Creating new Protected SuperAdmin account '$username'..." -ForegroundColor Cyan
            $ins = $conn.CreateCommand()
            $ins.CommandText = @"
                INSERT INTO Features_account 
                (username, email, password, first_name, last_name, is_superuser, is_staff, is_librarian, is_guest, is_terminal_created, is_active, date_joined)
                VALUES 
                (@user, @email, @pass, 'Super', 'Admin', 1, 1, 1, 0, 1, 1, SYSDATETIMEOFFSET())
"@
            $ins.Parameters.AddWithValue("@user", $username) | Out-Null
            $ins.Parameters.AddWithValue("@email", $email) | Out-Null
            $ins.Parameters.AddWithValue("@pass", $hash) | Out-Null
            $ins.ExecuteNonQuery() | Out-Null
            Write-Host "  [OK] Protected SuperAdmin '$username' created successfully!" -ForegroundColor Green
        }
        $conn.Close()

        Write-Host ""
        Write-Host "  Account Credentials:" -ForegroundColor Yellow
        Write-Host "    Username: $username" -ForegroundColor White
        Write-Host "    Email:    $email" -ForegroundColor White
        Write-Host "    Password: $password" -ForegroundColor White
        Write-Host "    Protected: True (Terminal Protection Active)" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "  [ERROR] Database error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Invoke-AddUser($username, $email, $role, $password) {
    Show-Header
    if ([string]::IsNullOrWhiteSpace($username)) {
        $username = Read-Host "Enter Username"
    }
    if ([string]::IsNullOrWhiteSpace($email)) {
        $email = Read-Host "Enter Email"
    }
    if ([string]::IsNullOrWhiteSpace($role)) {
        $role = Read-Host "Enter Role [Admin / Staff / Student] (Default: Student)"
        if ([string]::IsNullOrWhiteSpace($role)) { $role = "Student" }
    }
    if ([string]::IsNullOrWhiteSpace($password)) {
        $password = Read-Host "Enter Password (Default: User@123456!)"
        if ([string]::IsNullOrWhiteSpace($password)) { $password = "User@123456!" }
    }

    $isSuper = if ($role -match "Admin") { 1 } else { 0 }
    $isStaff = if ($role -match "Admin|Staff") { 1 } else { 0 }
    $isLibrarian = if ($role -match "Staff") { 1 } else { 0 }
    $isGuest = if ($isStaff -eq 0 -and $isSuper -eq 0) { 1 } else { 0 }

    $hash = Get-DjangoPBKDF2Hash $password

    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()
        
        $ins = $conn.CreateCommand()
        $ins.CommandText = @"
            INSERT INTO Features_account 
            (username, email, password, first_name, last_name, is_superuser, is_staff, is_librarian, is_guest, is_terminal_created, is_active, date_joined)
            VALUES 
            (@user, @email, @pass, 'New', 'User', @super, @staff, @lib, @guest, 1, 1, SYSDATETIMEOFFSET())
"@
        $ins.Parameters.AddWithValue("@user", $username) | Out-Null
        $ins.Parameters.AddWithValue("@email", $email) | Out-Null
        $ins.Parameters.AddWithValue("@pass", $hash) | Out-Null
        $ins.Parameters.AddWithValue("@super", $isSuper) | Out-Null
        $ins.Parameters.AddWithValue("@staff", $isStaff) | Out-Null
        $ins.Parameters.AddWithValue("@lib", $isLibrarian) | Out-Null
        $ins.Parameters.AddWithValue("@guest", $isGuest) | Out-Null
        $ins.ExecuteNonQuery() | Out-Null
        $conn.Close()

        Write-Host "  [OK] User '$username' ($role) registered successfully." -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Database error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Invoke-ResetPassword($username, $newPassword) {
    Show-Header
    if ([string]::IsNullOrWhiteSpace($username)) {
        $username = Read-Host "Enter Username or Email to reset"
    }
    if ([string]::IsNullOrWhiteSpace($newPassword)) {
        $newPassword = Read-Host "Enter New Password"
    }

    if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($newPassword)) {
        Write-Host "  [ERROR] Username and New Password are required!" -ForegroundColor Red
        return
    }

    $hash = Get-DjangoPBKDF2Hash $newPassword

    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()

        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "UPDATE Features_account SET password = @pass WHERE username = @user OR email = @user"
        $cmd.Parameters.AddWithValue("@pass", $hash) | Out-Null
        $cmd.Parameters.AddWithValue("@user", $username) | Out-Null
        $affected = $cmd.ExecuteNonQuery()
        $conn.Close()

        if ($affected -gt 0) {
            Write-Host "  [OK] Password for '$username' successfully updated (PBKDF2 SHA256)." -ForegroundColor Green
        } else {
            Write-Host "  [!] User '$username' not found in database." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERROR] Database error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Invoke-Diagnostics {
    Show-Header
    Write-Host "[*] Running System & Security Governance Diagnostics..." -ForegroundColor Gray
    Write-Host ""

    # 1. Database Connectivity
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($DbConnectionString)
        $conn.Open()
        Write-Host "  [OK] SQL Server Connectivity: Online (Server: $DbServer, DB: $DbName)" -ForegroundColor Green

        # Table Row Counts
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "SELECT COUNT(*) FROM Features_account"
        $totalUsers = $cmd.ExecuteScalar()

        $cmd.CommandText = "SELECT COUNT(*) FROM Features_account WHERE is_superuser = 1"
        $totalAdmins = $cmd.ExecuteScalar()

        $cmd.CommandText = "SELECT COUNT(*) FROM Features_account WHERE is_terminal_created = 1"
        $protectedUsers = $cmd.ExecuteScalar()

        $cmd.CommandText = "SELECT COUNT(*) FROM Features_newlyacquiredbook"
        $booksCount = $cmd.ExecuteScalar()

        $cmd.CommandText = "SELECT COUNT(*) FROM Features_eresourcefile"
        $resourcesCount = $cmd.ExecuteScalar()

        $conn.Close()

        Write-Host "  [OK] Core Catalog Telemetry:" -ForegroundColor Cyan
        Write-Host "       - Registered Users:      $totalUsers" -ForegroundColor White
        Write-Host "       - Super Administrators:  $totalAdmins" -ForegroundColor White
        Write-Host "       - CLI Protected Accounts:$protectedUsers" -ForegroundColor White
        Write-Host "       - Catalog Books Listed:  $booksCount" -ForegroundColor White
        Write-Host "       - Digital E-Resources:   $resourcesCount" -ForegroundColor White
    } catch {
        Write-Host "  [ERROR] SQL Server Diagnostics Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    # 2. Port Listeners
    $ports = @(
        @{ Port = 8000; Name = "Django REST Backend" },
        @{ Port = 3000; Name = "Vite React Frontend" },
        @{ Port = 1433; Name = "Microsoft SQL Server" }
    )

    foreach ($p in $ports) {
        $conn = Get-NetTCPConnection -LocalPort $p.Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($conn) {
            Write-Host "  [OK] $($p.Name) (: $($p.Port)) is LISTENING (PID: $($conn.OwningProcess))" -ForegroundColor Green
        } else {
            Write-Host "  [i] $($p.Name) (: $($p.Port)) is OFFLINE" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
}

# ─── Command Dispatcher ───────────────────────────────────────────────────────
switch ($Command.ToLower()) {
    "listusers" {
        Invoke-ListUsers
        exit 0
    }
    "createsuperadmin" {
        Invoke-CreateSuperAdmin -username $Arg1 -email $Arg2 -password $Arg3
        exit 0
    }
    "adduser" {
        Invoke-AddUser -username $Arg1 -email $Arg2 -role $Arg3 -password $Arg4
        exit 0
    }
    "resetpassword" {
        Invoke-ResetPassword -username $Arg1 -newPassword $Arg2
        exit 0
    }
    "diagnostics" {
        Invoke-Diagnostics
        exit 0
    }
    "status" {
        Invoke-Diagnostics
        exit 0
    }
}

# ─── Interactive Terminal Menu ────────────────────────────────────────────────
do {
    Clear-Host
    Show-Header
    Write-Host "  [1] List All Registered Users (ASCII Table with Role Highlights)" -ForegroundColor Yellow
    Write-Host "  [2] Create Protected SuperAdmin Account" -ForegroundColor Green
    Write-Host "  [3] Register New User (Admin / Staff / Student)" -ForegroundColor White
    Write-Host "  [4] Reset User Password" -ForegroundColor Cyan
    Write-Host "  [5] Run Administrative & Security Diagnostics" -ForegroundColor Magenta
    Write-Host "  [0] Exit CLI Governance Console" -ForegroundColor Red
    Write-Host ""
    $opt = Read-Host "Select an option [0-5]"

    switch ($opt) {
        "1" { Invoke-ListUsers; Read-Host "Press Enter to return..." }
        "2" { Invoke-CreateSuperAdmin; Read-Host "Press Enter to return..." }
        "3" { Invoke-AddUser; Read-Host "Press Enter to return..." }
        "4" { Invoke-ResetPassword; Read-Host "Press Enter to return..." }
        "5" { Invoke-Diagnostics; Read-Host "Press Enter to return..." }
        "0" { exit 0 }
    }
} while ($true)
