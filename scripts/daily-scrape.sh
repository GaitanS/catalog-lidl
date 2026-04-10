#!/bin/bash
# Daily Lidl catalog scraper — designed for crontab
# 0 7 * * * /var/www/catalog-lidl/scripts/daily-scrape.sh >> /var/www/catalog-lidl/logs/cron.log 2>&1

set -euo pipefail

APP_DIR="/var/www/catalog-lidl"
LOG_DIR="$APP_DIR/logs"
LOCK_FILE="$LOG_DIR/scraper.lock"

mkdir -p "$LOG_DIR"

echo "━━━ $(date '+%Y-%m-%d %H:%M:%S') — Starting daily scrape ━━━"

# Prevent overlapping runs
if [ -f "$LOCK_FILE" ]; then
    pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        echo "Scraper already running (PID $pid). Exiting."
        exit 0
    fi
    rm -f "$LOCK_FILE"
fi
echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

cd "$APP_DIR"

# Step 1: Run scraper
echo "[1/3] Running scraper..."
node scripts/scrape-catalogs.js

# Step 2: Rebuild Next.js
echo "[2/3] Building Next.js..."
npm run build

# Step 3: Copy static assets to standalone
if [ -d ".next/standalone" ]; then
    cp -r public .next/standalone/ 2>/dev/null || true
    cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
fi

# Step 4: Restart PM2
echo "[3/3] Restarting PM2..."
pm2 restart catalog-lidl --update-env

echo "━━━ $(date '+%Y-%m-%d %H:%M:%S') — Done ━━━"
