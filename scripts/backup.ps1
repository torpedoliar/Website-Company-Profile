# ===========================================
# BACKUP SCRIPT - Company Profile Website
# ===========================================
# Jalankan: .\backup.ps1
# Output: backup_YYYY-MM-DD_HH-MM-SS.zip

$ErrorActionPreference = "Stop"

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupDir = ".\backups"
$BackupName = "backup_$Timestamp"
$ContainerDb = "company_profile_db"
$DbName = "company_profile"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Backup Company Profile Website" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# 1. Backup Database
Write-Host "[1/3] Backing up database..." -ForegroundColor Yellow
try {
    docker exec $ContainerDb pg_dump -U postgres $DbName | Out-File -FilePath "$BackupDir\database.sql" -Encoding UTF8
    Write-Host "      Done - Database backed up" -ForegroundColor Green
}
catch {
    Write-Host "      Warning - Could not backup database (container may not be running)" -ForegroundColor Yellow
}

# 2. Backup Uploads folder
Write-Host "[2/3] Backing up uploads..." -ForegroundColor Yellow
$uploadsPath = Join-Path $ProjectRoot "public\uploads"
if (Test-Path $uploadsPath) {
    Copy-Item -Path $uploadsPath -Destination "$BackupDir\uploads" -Recurse -Force
    Write-Host "      Done - Uploads backed up" -ForegroundColor Green
}
else {
    New-Item -ItemType Directory -Path "$BackupDir\uploads" -Force | Out-Null
    Write-Host "      Done - No uploads to backup" -ForegroundColor Green
}

# 3. Copy version info
Write-Host "[3/3] Saving version info..." -ForegroundColor Yellow
$versionPath = Join-Path $ProjectRoot "version.json"
if (Test-Path $versionPath) {
    Copy-Item $versionPath "$BackupDir\version.json"
}
else {
    '{"version":"unknown"}' | Out-File "$BackupDir\version.json" -Encoding UTF8
}
Write-Host "      Done - Version info saved" -ForegroundColor Green

# Create archive
Write-Host ""
Write-Host "Creating archive..." -ForegroundColor Yellow
$filesToCompress = @("$BackupDir\database.sql", "$BackupDir\uploads", "$BackupDir\version.json")
$zipPath = Join-Path $ProjectRoot "$BackupName.zip"
Compress-Archive -Path $filesToCompress -DestinationPath $zipPath -Force

# Cleanup temp files
Remove-Item "$BackupDir\database.sql" -Force -ErrorAction SilentlyContinue
Remove-Item "$BackupDir\uploads" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$BackupDir\version.json" -Force -ErrorAction SilentlyContinue

$FileSize = (Get-Item $zipPath).Length / 1MB

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Backup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "File: $BackupName.zip" -ForegroundColor White
Write-Host ("Size: {0:N2} MB" -f $FileSize) -ForegroundColor White
Write-Host "Location: $zipPath" -ForegroundColor White
Write-Host ""
