#!/bin/bash
# ===========================================
# DEPLOY SCRIPT - Company Profile Website
# ===========================================
# Jalankan di server: ./deploy.sh

set -e

echo "=========================================="
echo "  Deploy Company Profile Website"
echo "=========================================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Error: Docker tidak terinstall!"
    echo "Install dengan: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose tidak terinstall!"
    exit 1
fi

echo "✓ Docker detected"

# Check if already running
if docker ps | grep -q "company-profile"; then
    echo ""
    read -p "Container sudah berjalan. Stop dan rebuild? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
        echo "Stopping containers..."
        docker-compose -f docker-compose.production.yml down
    else
        echo "Deploy dibatalkan."
        exit 0
    fi
fi

# Build and start
echo ""
echo "[1/2] Building and starting containers..."
echo "      This may take several minutes on first run..."
docker-compose -f docker-compose.production.yml up -d --build

echo ""
echo "[2/2] Waiting for services to be ready..."
sleep 30

# Check status
echo ""
echo "=========================================="
echo "  ✓ Deploy Complete!"
echo "=========================================="
echo ""
docker-compose -f docker-compose.production.yml ps
echo ""
echo "Akses aplikasi di: http://$(hostname -I | awk '{print $1}'):3100"
echo ""
echo "Default login:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "⚠️  Jangan lupa ganti password setelah login!"
echo ""
echo "Commands:"
echo "  docker-compose -f docker-compose.production.yml logs -f    # View logs"
echo "  docker-compose -f docker-compose.production.yml down       # Stop"
echo "  docker-compose -f docker-compose.production.yml restart    # Restart"
echo ""
