#!/bin/sh
# Optional destructive-to-availability test of THIS demo only; restores its DB on exit.
set -eu
cd "$(dirname "$0")/.."
trap 'docker compose -p backend-business-card up -d --wait db' EXIT
docker compose -p backend-business-card stop db
docker compose -p backend-business-card exec -T app node --input-type=module < scripts/check-unavailable.mjs
