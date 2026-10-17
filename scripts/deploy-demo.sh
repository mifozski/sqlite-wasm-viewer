#!/usr/bin/env bash
# Build the tester-app bundle and copy it, plus tester-app/sqlite-wasm-viewer-demo.conf, to the server.
#
# Requires: yarn, ssh, scp.
#   DEPLOY_HOST=other.example.com DEPLOY_WEBROOT=/srv/demo bash scripts/deploy-demo.sh
# The nginx file's root directive must match DEPLOY_WEBROOT.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_HOST="${DEPLOY_HOST:-45.154.35.21}"
DEPLOY_WEBROOT="${DEPLOY_WEBROOT:-/var/www/sqlite-wasm-viewer-demo}"
DEPLOY_NGINX_DIR="${DEPLOY_NGINX_DIR:-/etc/nginx/sites-available}"

ssh_target="${DEPLOY_USER}@${DEPLOY_HOST}"

yarn build-tester-app

ssh "$ssh_target" "mkdir -p '${DEPLOY_WEBROOT}' '${DEPLOY_NGINX_DIR}'"

(
  cd "${ROOT}/tester-app/dist"
  scp -r ./* "${ssh_target}:${DEPLOY_WEBROOT}/"
)

scp "${ROOT}/tester-app/sqlite-wasm-viewer-demo.conf" "${ssh_target}:${DEPLOY_NGINX_DIR}/sqlite-wasm-viewer-demo.conf"

echo "Synced site to ${ssh_target}:${DEPLOY_WEBROOT}/"
echo "Synced nginx config to ${ssh_target}:${DEPLOY_NGINX_DIR}/sqlite-wasm-viewer-demo.conf"
