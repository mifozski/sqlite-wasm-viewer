#!/usr/bin/env bash
# Build the tester-app bundle and copy it to the server with scp.
#
# Requires: yarn, ssh, scp.
#   DEPLOY_HOST=other.example.com DEPLOY_WEBROOT=/srv/demo bash scripts/deploy-demo.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_HOST="${DEPLOY_HOST:-45.154.35.21}"
DEPLOY_WEBROOT="${DEPLOY_WEBROOT:-/var/www/sqlite-wasm-viewer-demo}"

ssh_target="${DEPLOY_USER}@${DEPLOY_HOST}"

yarn build-tester-app

ssh "$ssh_target" "mkdir -p '${DEPLOY_WEBROOT}'"

(
  cd "${ROOT}/tester-app/dist"
  scp -r ./* "${ssh_target}:${DEPLOY_WEBROOT}/"
)

echo "Synced to ${ssh_target}:${DEPLOY_WEBROOT}/"
