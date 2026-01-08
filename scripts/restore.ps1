# ===========================================
# RESTORE SCRIPT - Company Profile Website
# ===========================================
# Jalankan: .\restore.ps1 backup_YYYY-MM-DD_HH-MM-SS.zip

param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"
$RestoreDir = ".\restore_temp"
$ContainerDb = "company_profile_db"
$DbName = "company_profile"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path $BackupFile)) {
    Write-Host "Error: Backup file '$BackupFile' not found!" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Restore Company Profile Website" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Backup: $BackupFile" -ForegroundColor White
Write-Host ""

# Confirm
$confirm = Read-Host "Ini akan menimpa data yang ada. Lanjutkan? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Restore dibatalkan." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Extract backup
Write-Host "[1/4] Extracting backup..." -ForegroundColor Yellow
if (Test-Path $RestoreDir) {
    Remove-Item $RestoreDir -Recurse -Force
}
Expand-Archive -Path $BackupFile -DestinationPath $RestoreDir -Force
Write-Host "      Done - Backup extracted" -ForegroundColor Green

# Check if containers are running
Write-Host "[2/4] Checking Docker containers..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>$null
if ($containers -notmatch $ContainerDb) {
    Write-Host "      Starting containers..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    docker-compose -f docker-compose.db.yml up -d
    Set-Location scripts
    Write-Host "      Waiting for database to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}
Write-Host "      Done - Containers running" -ForegroundColor Green

# Restore database
Write-Host "[3/4] Restoring database..." -ForegroundColor Yellow
Get-Content "$RestoreDir\database.sql" -Raw | docker exec -i $ContainerDb psql -U postgres $DbName
Write-Host "      Done - Database restored" -ForegroundColor Green

# Restore uploads
Write-Host "[4/4] Restoring uploads..." -ForegroundColor Yellow
if (Test-Path "$RestoreDir\uploads") {
    $uploadsPath = Join-Path $ProjectRoot "public\uploads"
    if (-not (Test-Path $uploadsPath)) {
        New-Item -ItemType Directory -Path $uploadsPath | Out-Null
    }
    Copy-Item -Path "$RestoreDir\uploads\*" -Destination $uploadsPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "      Done - Uploads restored" -ForegroundColor Green
}
else {
    Write-Host "      Done - No uploads to restore" -ForegroundColor Green
}

# Cleanup
Remove-Item $RestoreDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Restore Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Akses aplikasi di: http://localhost:3000" -ForegroundColor White
Write-Host ""
