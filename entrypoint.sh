#!/bin/bash
set -e

echo "Starting Idea Manager API..."

# Cloudflare Tunnel/host typically hits port 8000; allow override for future flexibility
PORT="${PORT:-8000}"

# Control migrations at start: default = run in dev, skip in prod
# You can override explicitly with MIGRATE_ON_START=true/false
if [ -z "${MIGRATE_ON_START}" ]; then
  if [ "$APP_ENV" = "development" ] || [ "$APP_ENV" = "dev" ]; then
    MIGRATE_ON_START=true
  else
    MIGRATE_ON_START=false
  fi
fi

if [ "${MIGRATE_ON_START}" = "true" ]; then
  echo "Running database migrations (alembic upgrade head)..."
  alembic upgrade head
else
  echo "Skipping migrations at start (MIGRATE_ON_START=false)."
fi

echo "Starting FastAPI on :$PORT ..."
if [ "$APP_ENV" = "development" ] || [ "$APP_ENV" = "dev" ]; then
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload --no-access-log
else
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers 1 --no-access-log
fi
