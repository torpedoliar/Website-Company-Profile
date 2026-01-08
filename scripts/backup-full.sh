#!/bin/bash
# ===========================================
# FULL BACKUP SCRIPT - Company Profile Website
# ===========================================
# Backup keseluruhan: Docker images + Database + Uploads + Config
# Jalankan: ./backup-full.sh
# Output: full_backup_YYYY-MM-DD_HH-MM-SS.tar.gz

set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="./full_backup_temp"
BACKUP_NAME="full_backup_${TIMESTAMP}"
CONTAINER_DB="company_profile_db"
CONTAINER_WEB="company-profile-web"
DB_NAME="company_profile"

echo "=========================================="
echo "  Full Backup - Company Profile Website"
echo "=========================================="
echo ""
echo "Backup includes:"
echo "  - Docker images (web + db)"
echo "  - Database dump"
echo "  - Upload files"
echo "  - Configuration files"
echo ""

# Create backup directory
rm -rf $BACKUP_DIR
mkdir -p $BACKUP_DIR

# 1. Export Docker Images
echo "[1/5] Exporting Docker images..."
echo "      This may take several minutes..."

docker save $CONTAINER_WEB -o "$BACKUP_DIR/web_image.tar" 2>/dev/null || echo "      Warning - Could not export web image"
echo "      ✓ Web image exported"

docker save postgres:15-alpine -o "$BACKUP_DIR/db_image.tar" 2>/dev/null || echo "      Warning - Could not export DB image"
echo "      ✓ DB image exported"

# 2. Backup Database
echo "[2/5] Backing up database..."
docker exec $CONTAINER_DB pg_dump -U postgres $DB_NAME > "$BACKUP_DIR/database.sql"
echo "      ✓ Database backed up"

# 3. Backup Uploads folder
echo "[3/5] Backing up uploads..."
if [ -d "./public/uploads" ]; then
    cp -r ./public/uploads "$BACKUP_DIR/uploads"
    echo "      ✓ Uploads backed up"
else
    mkdir -p "$BACKUP_DIR/uploads"
    echo "      ✓ No uploads found"
fi

# 4. Copy config files
echo "[4/5] Backing up configuration..."
[ -f "docker-compose.yml" ] && cp docker-compose.yml "$BACKUP_DIR/docker-compose.yml"
[ -f "docker-compose.db.yml" ] && cp docker-compose.db.yml "$BACKUP_DIR/docker-compose.db.yml"
[ -f "docker-entrypoint.sh" ] && cp docker-entrypoint.sh "$BACKUP_DIR/docker-entrypoint.sh"
[ -f "version.json" ] && cp version.json "$BACKUP_DIR/version.json"
[ -f ".env" ] && cp .env "$BACKUP_DIR/.env"
[ -f "Dockerfile" ] && cp Dockerfile "$BACKUP_DIR/Dockerfile"
echo "      ✓ Config files backed up"

# 5. Create restore script
echo "[5/5] Creating restore script..."
cat > "$BACKUP_DIR/restore-full.sh" << 'EOF'
#!/bin/bash
# ===========================================
# RESTORE SCRIPT - Auto-generated
# ===========================================

set -e

CONTAINER_DB="company_profile_db"
DB_NAME="company_profile"

echo "=========================================="
echo "  Restore Full Backup"
echo "=========================================="
echo ""

# 1. Load Docker images
echo "[1/4] Loading Docker images..."
[ -f "web_image.tar" ] && docker load -i web_image.tar
echo "      ✓ Web image loaded"
[ -f "db_image.tar" ] && docker load -i db_image.tar
echo "      ✓ DB image loaded"

# 2. Start containers
echo "[2/4] Starting containers..."
docker-compose -f docker-compose.db.yml up -d
echo "      Waiting for database to be ready..."
sleep 15
echo "      ✓ Containers started"

# 3. Restore database
echo "[3/4] Restoring database..."
cat database.sql | docker exec -i $CONTAINER_DB psql -U postgres $DB_NAME
echo "      ✓ Database restored"

# 4. Restore uploads
echo "[4/4] Restoring uploads..."
if [ -d "uploads" ]; then
    mkdir -p ./public/uploads
    cp -r uploads/* ./public/uploads/ 2>/dev/null || true
fi
echo "      ✓ Uploads restored"

echo ""
echo "=========================================="
echo "  ✓ Restore Complete!"
echo "=========================================="
echo ""
echo "Akses aplikasi di: http://localhost:3000"
echo ""
EOF
chmod +x "$BACKUP_DIR/restore-full.sh"
echo "      ✓ Restore script created"

# Create archive
echo ""
echo "Creating archive (this may take a while)..."
cd $BACKUP_DIR
tar -czf "../$BACKUP_NAME.tar.gz" .
cd ..

# Cleanup temp files
rm -rf $BACKUP_DIR

FILE_SIZE=$(du -h "$BACKUP_NAME.tar.gz" | cut -f1)

echo ""
echo "=========================================="
echo "  ✓ Full Backup Complete!"
echo "=========================================="
echo "File: $BACKUP_NAME.tar.gz"
echo "Size: $FILE_SIZE"
echo ""
echo "Untuk restore di server baru:"
echo "  1. Copy file ke server baru"
echo "  2. tar -xzf $BACKUP_NAME.tar.gz -C ./app"
echo "  3. cd app"
echo "  4. ./restore-full.sh"
echo ""
