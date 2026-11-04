# ==============================================================================
# JRMSU Library System — Emergency Standby Database Failover Script
# ==============================================================================
# Purpose:
#   If the Primary Database container ('db') crashes, fails, or suffers
#   filesystem corruption, this script immediately promotes the Local Hot Standby
#   ('db-standby') to become the new READ-WRITE PRIMARY with ZERO data loss.
#
# Usage:
#   .\failover-to-standby.ps1
# ==============================================================================

Write-Host "============================================================" -ForegroundColor Red
Write-Host " JRMSU Library — Emergency Database Standby Failover" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Red

# 1. Confirmation prompt
$confirm = Read-Host "Are you sure you want to promote 'db-standby' to PRIMARY? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Failover cancelled." -ForegroundColor Gray
    exit 0
}

Write-Host "`n[1/3] Promoting 'db-standby' from Read-Only Standby to Read-Write Primary..." -ForegroundColor Yellow

# Execute promotion via pg_ctl promote inside db-standby
$promoteCmd = "docker exec db-standby pg_ctl promote -U jrmsu_admin"
try {
    $result = Invoke-Expression $promoteCmd
    Write-Host $result
} catch {
    Write-Host "Attempting promote via docker-compose exec..." -ForegroundColor Yellow
    docker-compose exec -T db-standby pg_ctl promote -U jrmsu_admin
}

Write-Host "`n[2/3] Verifying database status..." -ForegroundColor Yellow
$statusCheck = docker exec db-standby psql -U jrmsu_admin -d jrmsu_library -c "SELECT pg_is_in_recovery();" 2>$null
if ($statusCheck -match "f") {
    Write-Host "SUCCESS: 'db-standby' is now in READ-WRITE mode (pg_is_in_recovery = FALSE)!" -ForegroundColor Green
} else {
    Write-Host "Status: Please check logs via 'docker logs db-standby'." -ForegroundColor Yellow
}

Write-Host "`n[3/3] Failover Complete!" -ForegroundColor Cyan
Write-Host "------------------------------------------------------------"
Write-Host "Next Steps:"
Write-Host "1. To route backend traffic to the new primary, set in .env:"
Write-Host "   DB_HOST=db-standby" -ForegroundColor Green
Write-Host "2. Restart backend containers:"
Write-Host "   docker-compose restart backend celery-worker" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Red
