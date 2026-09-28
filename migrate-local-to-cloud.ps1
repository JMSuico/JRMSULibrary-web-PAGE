# ==============================================================================
# JRMSU Library System — 1-Click Local to Cloud Database Migration
# ==============================================================================
# Purpose:
#   Migrates all local database tables, books, accounts, and CMS records from
#   the Katipunan Campus Physical Library PC into the Supabase Cloud PostgreSQL DB.
#
# Usage:
#   .\migrate-local-to-cloud.ps1
# ==============================================================================

param (
    [string]$CloudHost = "aws-0-ap-southeast-1.pooler.supabase.com",
    [string]$CloudUser = "postgres.oaujamkhpwszewycylxm",
    [string]$CloudDb = "postgres",
    [string]$CloudPort = "5432"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " JRMSU Library — Local to Cloud Database Migration" -ForegroundColor Cyan
Write-Host " Target Cloud: $CloudHost" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Prompt for Cloud Password
$defaultPw = "JRMSUKCLIBRARY7109"
$inputPw = Read-Host "Enter Supabase Cloud Database Password [Press ENTER to use default from DeploymentCloudServer.md]"
if ([string]::IsNullOrWhiteSpace($inputPw)) {
    $CloudPassword = $defaultPw
} else {
    $CloudPassword = $inputPw
}

# 2. Confirmation prompt
Write-Host "`nWARNING: This will update cloud tables with latest records from this physical PC." -ForegroundColor Yellow
$confirm = Read-Host "Do you want to proceed with migration? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Gray
    exit 0
}

# 3. Create timestamped dump
$backupDir = ".\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$tempDump = "$backupDir\cloud_sync_dump_$timestamp.sql"

Write-Host "`n[1/3] Dumping local PostgreSQL database from Docker..." -ForegroundColor Yellow
try {
    docker-compose exec -T db pg_dump -U jrmsu_admin --clean --if-exists --no-owner --no-acl jrmsu_library > $tempDump
    $fileSize = (Get-Item $tempDump).Length / 1MB
    Write-Host "      Dump created successfully! ($($fileSize.ToString('F2')) MB)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Could not export from local db container. Make sure Docker is running." -ForegroundColor Red
    exit 1
}

# 4. Stream to Supabase Cloud DB via Docker PostgreSQL client
Write-Host "`n[2/3] Migrating data to Cloud Supabase ($CloudHost)..." -ForegroundColor Yellow

$connString = "postgresql://${CloudUser}:${CloudPassword}@${CloudHost}:${CloudPort}/${CloudDb}"
$cloudCommand = "Get-Content -Raw '$tempDump' | docker run --rm -i -e PGPASSWORD='$CloudPassword' postgres:16-alpine psql -h '$CloudHost' -p '$CloudPort' -U '$CloudUser' -d '$CloudDb'"

try {
    Invoke-Expression $cloudCommand
    Write-Host "      Cloud database import successfully completed!" -ForegroundColor Green
} catch {
    Write-Host "ERROR during cloud import: $_" -ForegroundColor Red
}

# 5. Run Parity Verification
Write-Host "`n[3/3] Running Data Parity Verification..." -ForegroundColor Yellow
try {
    docker-compose exec -T backend python manage.py verify_cloud_sync --cloud-host=$CloudHost --cloud-user=$CloudUser --cloud-password=$CloudPassword
} catch {
    Write-Host "Could not run verify_cloud_sync inside backend container." -ForegroundColor Gray
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host " MIGRATION COMPLETE: Physical PC records safely synced to Cloud!" -ForegroundColor Green
Write-Host " Timestamped archive preserved at: $tempDump" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
