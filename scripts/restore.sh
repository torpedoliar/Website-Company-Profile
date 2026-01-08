#!/bin/bash
# ===========================================
# RESTORE SCRIPT - Company Profile Website
# ===========================================
# Jalankan: ./restore.sh backup_YYYY-MM-DD_HH-MM-SS.tar.gz

set -e

CONTAINER_DB="company_profile_db"
DB_NAME="company_profile"

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.tar.gz>"
    echo "Example: ./restore.sh backup_2025-12-29_20-00-00.tar.gz"
    exit 1
fi

BACKUP_FILE=$1
RESTORE_DIR="./restore_temp"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found!"
    exit 1
fi

echo "=========================================="
echo "  Restore Company Profile Website"
echo "=========================================="
echo "Backup: $BACKUP_FILE"
echo ""

# Confirm
read -p "Ini akan menimpa data yang ada. Lanjutkan? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Restore dibatalkan."
    exit 0
fi

# Extract backup
echo ""
echo "[1/4] Extracting backup..."
mkdir -p $RESTORE_DIR
tar -xzf "$BACKUP_FILE" -C $RESTORE_DIR
echo "      ✓ Backup extracted"

# Check if containers are running
echo "[2/4] Checking Docker containers..."
if ! docker ps | grep -q "$CONTAINER_DB"; then
    echo "      Starting containers..."
    docker-compose -f docker-compose.db.yml up -d
    echo "      Waiting for database to be ready..."
    sleep 10
fi
echo "      ✓ Containers running"

# Restore database
echo "[3/4] Restoring database..."
cat "${RESTORE_DIR}/database.sql" | docker exec -i $CONTAINER_DB psql -U postgres $DB_NAME
echo "      ✓ Database restored"

# Restore uploads
echo "[4/4] Restoring uploads..."
if [ -d "${RESTORE_DIR}/uploads" ]; then
    mkdir -p ./public/uploads
    cp -r "${RESTORE_DIR}/uploads/"* ./public/uploads/ 2>/dev/null || true
    echo "      ✓ Uploads restored"
else
    echo "      ✓ No uploads to restore"
fi

# Cleanup
rm -rf $RESTORE_DIR

echo ""
echo "=========================================="
echo "  ✓ Restore Complete!"
echo "=========================================="
echo ""
echo "Akses aplikasi di: http://localhost:3000"
echo ""
