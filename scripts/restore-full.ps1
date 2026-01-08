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
if (-not (Test-Path "docker-compose.db.yml") -and -not (Test-Path "docker-compose.yml")) {
  Write-Host "Error: docker-compose file not found!" -ForegroundColor Red
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
  Write-Host "      Skip - Web image not found" -ForegroundColor Yellow
}

if (Test-Path "db_image.tar") {
  docker load -i db_image.tar 2>$null
  Write-Host "      Done - DB image loaded" -ForegroundColor Green
}
else {
  Write-Host "      Skip - DB image not found" -ForegroundColor Yellow
}

# 2. Modify docker-compose to use image instead of build
Write-Host "[2/6] Configuring docker-compose..." -ForegroundColor Yellow

# Create new docker-compose for restore (use image, not build)
$dockerCompose = @"
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: company_profile_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: company_profile
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
"@
$dockerCompose | Out-File -FilePath "docker-compose.db.yml" -Encoding UTF8
Write-Host "      Done - docker-compose configured" -ForegroundColor Green

# 3. Create uploads directory
Write-Host "[3/6] Preparing directories..." -ForegroundColor Yellow
if (-not (Test-Path ".\public\uploads")) {
  New-Item -ItemType Directory -Path ".\public\uploads" -Force | Out-Null
}
Write-Host "      Done" -ForegroundColor Green

# 4. Start containers
Write-Host "[4/6] Starting containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.db.yml down 2>$null
docker-compose -f docker-compose.db.yml up -d 2>$null
Write-Host "      Waiting for database to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 20
Write-Host "      Done - Containers started" -ForegroundColor Green

# 5. Restore database
Write-Host "[5/6] Restoring database..." -ForegroundColor Yellow

if (Test-Path "database.sql") {
  # Check if database.sql has actual data
  $sqlContent = Get-Content "database.sql" -Raw
  if ($sqlContent.Length -gt 100) {
    Write-Host "      Restoring data from backup..." -ForegroundColor Gray
    $sqlContent | docker exec -i $ContainerDb psql -U postgres $DbName 2>$null
    Write-Host "      Done - Database restored from backup" -ForegroundColor Green
  }
  else {
    Write-Host "      Backup file is empty, run prisma seed manually..." -ForegroundColor Yellow
    Write-Host "      Done - Run 'npx tsx prisma/seed.ts' to seed data" -ForegroundColor Green
  }
}
else {
  Write-Host "      No backup found, run prisma seed manually..." -ForegroundColor Yellow
  Write-Host "      Done - Run 'npx tsx prisma/seed.ts' to seed data" -ForegroundColor Green
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
docker-compose -f docker-compose.db.yml ps
Write-Host ""
Write-Host "Akses aplikasi di: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default login:" -ForegroundColor White
Write-Host "  Email: admin@example.com" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray
Write-Host ""
