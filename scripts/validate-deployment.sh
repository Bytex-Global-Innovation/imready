#!/usr/bin/env bash
# Safe local validation for IMReady deployment artifacts.
# Does not start production stacks or contact remote servers.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Validating docker-compose.prod.yml"
docker compose -f docker-compose.prod.yml config > /dev/null
echo "    OK"

echo "==> Validating docker-compose.yml (dev)"
docker compose -f docker-compose.yml config > /dev/null
echo "    OK"

if command -v nginx >/dev/null 2>&1; then
  echo "==> Nginx syntax check (standalone snippet — may warn if incomplete)"
  nginx -t -c "$ROOT/docs/deployment/nginx/imready.in.conf" 2>/dev/null || \
    echo "    Skip: host nginx -t requires full server context; validate on VPS after install"
else
  echo "==> nginx not installed locally — skip syntax check"
fi

echo "Done. For production: run this script on the VPS after copying the repo."
