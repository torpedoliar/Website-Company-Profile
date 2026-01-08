# ===========================================
# DEPLOY SCRIPT - Company Profile Website
# ===========================================
# Jalankan: .\deploy.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Deploy Company Profile Website" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "Docker detected: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "Error: Docker tidak terinstall!" -ForegroundColor Red
    Write-Host "Download dari: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "Docker Compose detected: $composeVersion" -ForegroundColor Green
}
catch {
    Write-Host "Error: Docker Compose tidak terinstall!" -ForegroundColor Red
    exit 1
}

# Check if already running
$containers = docker ps --format "{{.Names}}" 2>$null
if ($containers -match "company_profile") {
    Write-Host ""
    $confirm = Read-Host "Container sudah berjalan. Stop dan rebuild? (y/n)"
    if ($confirm -eq "y") {
        Write-Host "Stopping containers..." -ForegroundColor Yellow
        Set-Location $ProjectRoot
        docker-compose -f docker-compose.db.yml down
    }
    else {
        Write-Host "Deploy dibatalkan." -ForegroundColor Yellow
        exit 0
    }
}
else {
    Set-Location $ProjectRoot
}

Write-Host ""
Write-Host "[1/3] Starting database container..." -ForegroundColor Yellow
docker-compose -f docker-compose.db.yml up -d

Write-Host ""
Write-Host "[2/3] Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "[3/3] Running database migrations..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/company_profile"
npx prisma db push
npx tsx prisma/seed.ts

# Check status
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Deploy Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
docker-compose -f docker-compose.db.yml ps
Write-Host ""
Write-Host "Start development server dengan: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default login:" -ForegroundColor White
Write-Host "  Email: admin@example.com" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "Jangan lupa ganti password setelah login!" -ForegroundColor Yellow
Write-Host ""
