#!/bin/sh
set -e

echo "=========================================="
echo "  Company Profile Website - Startup"
echo "=========================================="

# Wait for database to be ready
echo "Waiting for database..."
sleep 5

# Run database migrations
echo "Running database migrations..."
npx prisma db push --accept-data-loss

# Seed database if empty (first run)
echo "Checking if seeding needed..."
npx prisma db seed 2>/dev/null || echo "Database already seeded or seed skipped"

echo "Database ready!"
echo ""

# Start the application
echo "Starting Next.js server..."
exec "$@"
