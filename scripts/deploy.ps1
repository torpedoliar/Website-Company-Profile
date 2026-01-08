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

Set-Location $ProjectRoot

# Check if already running
$containers = docker ps --format "{{.Names}}" 2>$null
if ($containers -match "company-profile") {
    Write-Host ""
    $confirm = Read-Host "Container sudah berjalan. Stop dan rebuild? (y/n)"
    if ($confirm -eq "y") {
        Write-Host "Stopping containers..." -ForegroundColor Yellow
        docker-compose -f docker-compose.production.yml down
    }
    else {
        Write-Host "Deploy dibatalkan." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "[1/2] Building and starting containers..." -ForegroundColor Yellow
Write-Host "      This may take several minutes on first run..." -ForegroundColor Gray
docker-compose -f docker-compose.production.yml up -d --build

Write-Host ""
Write-Host "[2/2] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check status
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Deploy Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
docker-compose -f docker-compose.production.yml ps
Write-Host ""
Write-Host "Akses aplikasi di: http://localhost:3100" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default login:" -ForegroundColor White
Write-Host "  Email: admin@example.com" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "Jangan lupa ganti password setelah login!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Commands:" -ForegroundColor White
Write-Host "  docker-compose -f docker-compose.production.yml logs -f    # View logs" -ForegroundColor Gray
Write-Host "  docker-compose -f docker-compose.production.yml down       # Stop" -ForegroundColor Gray
Write-Host "  docker-compose -f docker-compose.production.yml restart    # Restart" -ForegroundColor Gray
Write-Host ""
