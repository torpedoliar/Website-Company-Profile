# Deployment Guide - Company Profile Website

## 🚀 Quick Start (Server Baru)

```bash
# 1. Clone repository
git clone https://github.com/torpedoliar/Website-Company-Profile.git
cd Website-Company-Profile

# 2. Deploy dengan Docker
docker-compose -f docker-compose.production.yml up -d --build

# 3. Akses
# http://[IP-SERVER]:3100
```

**Default Login:** `admin@example.com` / `admin123`

---

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────────┐
│              Docker Network                  │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │  company-       │  │  company_        │  │
│  │  profile-web    │  │  profile_db      │  │
│  │  (Next.js)      │──│  (PostgreSQL)    │  │
│  │  Port: 3100     │  │  Internal Only   │  │
│  └─────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 📦 Backup & Restore

### Backup (Server Lama)
```bash
# PowerShell
cd scripts
.\backup.ps1              # Quick backup (DB + uploads)
.\backup-full.ps1         # Full backup (termasuk Docker images)

# Bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### Transfer ke Server Baru
```bash
scp backup_*.zip user@new-server:/path/to/project/
```

### Restore (Server Baru)
```bash
# PowerShell
.\restore.ps1 backup_xxx.zip

# Bash
./restore.sh backup_xxx.tar.gz
```

---

## ⚙️ Konfigurasi

Edit environment di `docker-compose.production.yml`:

```yaml
environment:
  # GANTI untuk production!
  - NEXTAUTH_SECRET=your-super-secret-key
  - NEXTAUTH_URL=http://your-domain.com:3100
```

---

## 📁 Data Storage

| Lokasi | Isi |
|--------|-----|
| Docker Volume `postgres_data` | Database PostgreSQL |
| `./public/uploads/` | File upload |

---

## 🔧 Commands

| Command | Deskripsi |
|---------|-----------|
| `docker-compose -f docker-compose.production.yml up -d` | Start containers |
| `docker-compose -f docker-compose.production.yml down` | Stop containers |
| `docker-compose -f docker-compose.production.yml logs -f` | View logs |
| `docker-compose -f docker-compose.production.yml up -d --build` | Rebuild & restart |
| `docker-compose -f docker-compose.production.yml restart` | Restart containers |

---

## 🔄 Update Aplikasi

```bash
git pull origin main
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

Database otomatis ter-migrasi via `prisma db push`.

---

## 📊 Development Mode

Untuk development lokal tanpa Docker:

```bash
# Start database only
docker-compose -f docker-compose.db.yml up -d

# Set environment
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/company_profile"

# Run dev server
npm run dev
```
