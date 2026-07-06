#!/usr/bin/env bash
set -Eeuo pipefail

REMOTE_HOST="${REMOTE_HOST:-orangepi.local}"
REMOTE_USER="${REMOTE_USER:-${USER}}"
REMOTE="${REMOTE_USER}@${REMOTE_HOST}"
REMOTE_DIR="${REMOTE_DIR:-/home/${REMOTE_USER}/apps/virtual-agency-studio}"
REMOTE_PASSWORD="${REMOTE_PASSWORD:-}"
API_PORT="${API_PORT:-4317}"
WEB_PORT="${WEB_PORT:-5173}"
PUBLIC_HOST="${PUBLIC_HOST:-${REMOTE_HOST}}"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://${PUBLIC_HOST}:${API_PORT}}"
RUN_TESTS="${RUN_TESTS:-false}"
SERVICE_PREFIX="${SERVICE_PREFIX:-virtual-agency}"

API_SERVICE="${SERVICE_PREFIX}-api.service"
WEB_SERVICE="${SERVICE_PREFIX}-web.service"

log() {
  printf '\n==> %s\n' "$*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

require_cmd ssh
require_cmd rsync

SSH_BASE=(ssh -o StrictHostKeyChecking=accept-new)
RSYNC_SSH="ssh -o StrictHostKeyChecking=accept-new"
if [ -n "${REMOTE_PASSWORD}" ]; then
  require_cmd sshpass
  SSH_BASE=(sshpass -p "${REMOTE_PASSWORD}" ssh -o StrictHostKeyChecking=accept-new)
  RSYNC_SSH="sshpass -p ${REMOTE_PASSWORD} ssh -o StrictHostKeyChecking=accept-new"
fi

log "Checking SSH access to ${REMOTE}"
"${SSH_BASE[@]}" "${REMOTE}" "mkdir -p '${REMOTE_DIR}'"

log "Syncing source to ${REMOTE}:${REMOTE_DIR}"
rsync -az --delete -e "${RSYNC_SSH}" \
  --exclude ".git/" \
  --exclude ".env" \
  --exclude ".playwright-cli/" \
  --exclude "node_modules/" \
  --exclude "dist/" \
  --exclude "apps/*/dist/" \
  --exclude "apps/web/.vite/" \
  --exclude "apps/web/tsconfig.tsbuildinfo" \
  --exclude "packages/*/dist/" \
  --exclude "packages/*/tsconfig.tsbuildinfo" \
  --exclude "data/agency.sqlite" \
  --exclude "data/assets/*" \
  --exclude "data/exports/*" \
  --include "data/assets/.gitkeep" \
  --include "data/exports/.gitkeep" \
  ./ "${REMOTE}:${REMOTE_DIR}/"

log "Installing dependencies, building, and installing user services"
"${SSH_BASE[@]}" "${REMOTE}" \
  "REMOTE_DIR='${REMOTE_DIR}' API_PORT='${API_PORT}' WEB_PORT='${WEB_PORT}' VITE_API_BASE_URL='${VITE_API_BASE_URL}' RUN_TESTS='${RUN_TESTS}' API_SERVICE='${API_SERVICE}' WEB_SERVICE='${WEB_SERVICE}' bash -s" <<'REMOTE_SCRIPT'
set -Eeuo pipefail

cd "${REMOTE_DIR}"
mkdir -p data/assets data/exports
touch data/assets/.gitkeep data/exports/.gitkeep

if [ ! -f .env ]; then
  cat > .env <<ENV
API_HOST=0.0.0.0
API_PORT=${API_PORT}
WEB_PORT=${WEB_PORT}
DATA_DIR=./data
DATABASE_URL=./data/agency.sqlite
MOCK_PROVIDERS=true
HERMES_BASE_URL=http://127.0.0.1:8645
HERMES_API_KEY=
HERMES_IMAGE_GENERATION_PATH=
HERMES_IMAGE_ANALYSIS_PATH=
COMFYUI_CLOUD_BASE_URL=
COMFYUI_CLOUD_API_KEY=
COMFYUI_CLOUD_GENERATION_PATH=/api/prompt
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1536
OPENAI_IMAGE_QUALITY=auto
OPENAI_IMAGE_OUTPUT_FORMAT=png
OPENAI_IMAGE_MODERATION=low
WAVESPEED_BASE_URL=https://api.wavespeed.ai/api/v3
WAVESPEED_API_KEY=
WAVESPEED_IMAGE_GENERATION_PATH=/wavespeed-ai/flux-dev
ENV
  chmod 600 .env
  echo "Created ${REMOTE_DIR}/.env. Fill Hermes paths there or in the app Settings UI."
else
  echo "Preserved existing ${REMOTE_DIR}/.env"
fi

npm ci
if [ "${RUN_TESTS}" = "true" ]; then
  npm run typecheck
  npm run test
fi
VITE_API_BASE_URL="${VITE_API_BASE_URL}" npm run build

mkdir -p "${HOME}/.config/systemd/user"

cat > "${HOME}/.config/systemd/user/${API_SERVICE}" <<SERVICE
[Unit]
Description=Virtual Agency Studio API
After=network-online.target

[Service]
Type=simple
WorkingDirectory=${REMOTE_DIR}
EnvironmentFile=${REMOTE_DIR}/.env
ExecStart=$(command -v npm) --workspace @virtual-agency/api run start
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
SERVICE

cat > "${HOME}/.config/systemd/user/${WEB_SERVICE}" <<SERVICE
[Unit]
Description=Virtual Agency Studio Web
After=${API_SERVICE}

[Service]
Type=simple
WorkingDirectory=${REMOTE_DIR}/apps/web
EnvironmentFile=${REMOTE_DIR}/.env
Environment=VITE_API_BASE_URL=${VITE_API_BASE_URL}
ExecStart=$(command -v npx) vite preview --host 0.0.0.0 --port ${WEB_PORT}
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
SERVICE

systemctl --user daemon-reload
systemctl --user enable "${API_SERVICE}" "${WEB_SERVICE}"
systemctl --user restart "${API_SERVICE}" "${WEB_SERVICE}"

sleep 2
systemctl --user --no-pager --full status "${API_SERVICE}" "${WEB_SERVICE}" || true
REMOTE_SCRIPT

log "Verifying deployed endpoints"
curl -fsS "http://${PUBLIC_HOST}:${API_PORT}/health" >/dev/null
curl -fsSI "http://${PUBLIC_HOST}:${WEB_PORT}/" >/dev/null

cat <<EOF

Deployment complete.

Web: http://${PUBLIC_HOST}:${WEB_PORT}
API: http://${PUBLIC_HOST}:${API_PORT}

Remote app directory:
  ${REMOTE}:${REMOTE_DIR}

Remote service commands:
  ssh ${REMOTE} 'systemctl --user status ${API_SERVICE} ${WEB_SERVICE}'
  ssh ${REMOTE} 'journalctl --user -u ${API_SERVICE} -u ${WEB_SERVICE} -f'

Hermes defaults created in .env only when missing:
  HERMES_BASE_URL=http://127.0.0.1:8645

Fill HERMES_IMAGE_GENERATION_PATH and HERMES_IMAGE_ANALYSIS_PATH after you confirm
the Hermes route names, then restart the API service.
EOF
