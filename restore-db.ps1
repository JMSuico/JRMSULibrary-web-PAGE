# ==============================================================================
# JRMSU Library System — Database Restore Script
# ==============================================================================
# Usage:
#   .\restore-db.ps1 -BackupSqlFile ".\backups\jrmsu_library_db_YYYY-MM-DD_HH-mm-ss.sql"
# ==============================================================================

param (
    [Parameter(Mandatory = $true)]
    [string]$BackupSqlFile
)

if (-not (Test-Path $BackupSqlFile)) {
    Write-Host "Error: Backup file '$BackupSqlFile' not found!" -ForegroundColor Red
    exit 1
}

Write-Host "============================================================" -ForegroundColor Red
Write-Host " WARNING: Restoring will overwrite existing database records!" -ForegroundColor Yellow
Write-Host " Selected File: $BackupSqlFile" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Red

$confirm = Read-Host "Are you sure you want to proceed with the database restore? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Restore cancelled." -ForegroundColor Gray
    exit 0
}

Write-Host "`n[1/1] Restoring PostgreSQL Database..." -ForegroundColor Yellow
Get-Content $BackupSqlFile | docker-compose exec -T db psql -U jrmsu_admin -d jrmsu_library

Write-Host "`nDatabase restore complete!" -ForegroundColor Green
