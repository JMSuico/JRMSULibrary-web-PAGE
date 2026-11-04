# ==============================================================================
# JRMSU Library System — 1-Click Database & Media Backup Script
# ==============================================================================
# Usage:
#   .\backup-db.ps1
#
# Creates a timestamped backup in .\backups\ containing:
#   1. PostgreSQL database dump (.sql.gz or .sql)
#   2. Media files archive (uploaded book covers, PDFs, facility images)
# ==============================================================================

$backupDir = ".\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$dbBackupFile = "$backupDir\jrmsu_library_db_$timestamp.sql"
$mediaBackupFile = "$backupDir\jrmsu_library_media_$timestamp.zip"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " JRMSU Library — Starting Automated Backup: $timestamp" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. PostgreSQL Database Dump
Write-Host "`n[1/2] Exporting PostgreSQL Database..." -ForegroundColor Yellow
docker-compose exec -T db pg_dump -U jrmsu_admin jrmsu_library > $dbBackupFile

if (Test-Path $dbBackupFile) {
    $dbSize = (Get-Item $dbBackupFile).Length / 1MB
    Write-Host "      Database backup successful! Size: $($dbSize.ToString('F2')) MB" -ForegroundColor Green
} else {
    Write-Host "      Database backup failed. Please ensure Docker containers are running." -ForegroundColor Red
}

# 2. Archive Django Media Files (Uploads, PDFs, Images)
Write-Host "`n[2/2] Archiving Media Files (PDFs, Book Covers, Images)..." -ForegroundColor Yellow
$mediaSource = ".\backend\media"
if (Test-Path $mediaSource) {
    Compress-Archive -Path "$mediaSource\*" -DestinationPath $mediaBackupFile -Force
    $mediaSize = (Get-Item $mediaBackupFile).Length / 1MB
    Write-Host "      Media archive successful! Size: $($mediaSize.ToString('F2')) MB" -ForegroundColor Green
} else {
    Write-Host "      Media folder not found. Skipping media backup." -ForegroundColor DarkYellow
}

# 3. Clean up backups older than 30 days
Write-Host "`n[Clean-up] Pruning backups older than 30 days..." -ForegroundColor Gray
Get-ChildItem -Path $backupDir -Filter "jrmsu_library_*" | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host " Backup Complete! Files saved in: $backupDir" -ForegroundColor Green
Write-Host " TIP: Copy this folder to a USB Drive or Cloud Storage regularly." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
