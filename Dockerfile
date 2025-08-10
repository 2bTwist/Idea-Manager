# syntax=docker/dockerfile:1.7
FROM python:3.13-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Non-root
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app
RUN mkdir -p /app/logs

# Copy reqs first for caching
COPY --chown=appuser:appuser requirements.txt .

# If you truly don't need nc, skip apt entirely to reduce CVEs.
# (If you must install, keep it together and minimal.)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     netcat-traditional \
#  && rm -rf /var/lib/apt/lists/*

# Install deps
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy app with correct ownership in one go
COPY --chown=appuser:appuser . .
COPY --chown=appuser:appuser entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER appuser

# Simple TCP healthcheck (works without curl/nc)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import socket; socket.create_connection(('localhost', 8000), 5)" || exit 1

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
