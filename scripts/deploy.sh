#!/bin/bash
# ===========================================
# DEPLOY SCRIPT - Company Profile Website
# ===========================================
# Jalankan di server baru: ./deploy.sh

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
if docker ps | grep -q "company_profile"; then
    echo ""
    read -p "Container sudah berjalan. Stop dan rebuild? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
        echo "Stopping containers..."
        docker-compose -f docker-compose.db.yml down
    else
        echo "Deploy dibatalkan."
        exit 0
    fi
fi

# Start database
echo ""
echo "[1/3] Starting database container..."
docker-compose -f docker-compose.db.yml up -d

echo ""
echo "[2/3] Waiting for database to be ready..."
sleep 15

# Run migrations
echo ""
echo "[3/3] Running database migrations..."
npx prisma db push
npx tsx prisma/seed.ts

# Check status
echo ""
echo "=========================================="
echo "  ✓ Deploy Complete!"
echo "=========================================="
echo ""
docker-compose -f docker-compose.db.yml ps
echo ""
echo "Start development server dengan: npm run dev"
echo ""
echo "Default login:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "⚠️  Jangan lupa ganti password setelah login!"
echo ""
