#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/opt/low-altitude-economy-site"
WEB_ROOT="/var/www/low-altitude-economy-site"

sleep "$(( RANDOM % 660 ))"

cd "$PROJECT_DIR"
npm run collect:news
npm run build
mkdir -p "$WEB_ROOT"
rsync -a --delete dist/ "$WEB_ROOT/"
