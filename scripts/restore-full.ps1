# ===========================================
# RESTORE FULL SCRIPT - Company Profile Website
# ===========================================
# Jalankan dari folder hasil extract: .\restore-full.ps1

$ErrorActionPreference = "Continue"

$ContainerDb = "company_profile_db"
$ContainerWeb = "company-profile-web"
$DbName = "company_profile"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Restore Full Backup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check required files
if (-not (Test-Path "docker-compose.production.yml")) {
  Write-Host "Error: docker-compose.production.yml not found!" -ForegroundColor Red
  Write-Host "Make sure you run this from the extracted backup folder." -ForegroundColor Yellow
  exit 1
}

# 1. Load Docker images
Write-Host "[1/6] Loading Docker images..." -ForegroundColor Yellow
if (Test-Path "web_image.tar") {
  docker load -i web_image.tar 2>$null
  Write-Host "      Done - Web image loaded" -ForegroundColor Green
}
else {
  Write-Host "      Skip - Web image not found (will build from source)" -ForegroundColor Yellow
}

if (Test-Path "db_image.tar") {
  docker load -i db_image.tar 2>$null
  Write-Host "      Done - DB image loaded" -ForegroundColor Green
}
else {
  Write-Host "      Skip - DB image not found (will pull from registry)" -ForegroundColor Yellow
}

# 2. Create uploads directory
Write-Host "[2/6] Preparing directories..." -ForegroundColor Yellow
if (-not (Test-Path ".\public\uploads")) {
  New-Item -ItemType Directory -Path ".\public\uploads" -Force | Out-Null
}
Write-Host "      Done" -ForegroundColor Green

# 3. Start containers
Write-Host "[3/6] Starting containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml down 2>$null
docker-compose -f docker-compose.production.yml up -d --build 2>$null
Write-Host "      Waiting for services to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 30
Write-Host "      Done - Containers started" -ForegroundColor Green

# 4. Wait for database
Write-Host "[4/6] Waiting for database..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "      Done" -ForegroundColor Green

# 5. Restore database
Write-Host "[5/6] Restoring database..." -ForegroundColor Yellow
if (Test-Path "database.sql") {
  $sqlContent = Get-Content "database.sql" -Raw
  if ($sqlContent.Length -gt 100) {
    Write-Host "      Restoring data from backup..." -ForegroundColor Gray
    $sqlContent | docker exec -i $ContainerDb psql -U postgres $DbName 2>$null
    Write-Host "      Done - Database restored from backup" -ForegroundColor Green
  }
  else {
    Write-Host "      Backup file is empty, database will be seeded by entrypoint" -ForegroundColor Yellow
  }
}
else {
  Write-Host "      No backup found, database will be seeded by entrypoint" -ForegroundColor Yellow
}

# 6. Restore uploads
Write-Host "[6/6] Restoring uploads..." -ForegroundColor Yellow
if (Test-Path "uploads") {
  Copy-Item -Path "uploads\*" -Destination ".\public\uploads\" -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "      Done - Uploads restored" -ForegroundColor Green
}
else {
  Write-Host "      Skip - No uploads to restore" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Restore Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Container status:" -ForegroundColor White
docker-compose -f docker-compose.production.yml ps
Write-Host ""
Write-Host "Akses aplikasi di: http://localhost:3100" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default login:" -ForegroundColor White
Write-Host "  Email: admin@example.com" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray
Write-Host ""
