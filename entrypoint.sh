#!/bin/bash
set -e

echo "Starting Idea Manager API..."

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting FastAPI application..."
if [ "$APP_ENV" = "development" ] || [ "$APP_ENV" = "dev" ]; then
    # Development mode with reload
    exec uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --reload \
        --no-access-log
else
    # Production mode
    exec uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 1 \
        --no-access-log
fi
