from datetime import datetime, timezone
import socket
from fastapi import FastAPI

start_time = datetime.now(timezone.utc)

def create_app() -> FastAPI:
    app = FastAPI(title="Idea Manager", version="0.1.0")

    @app.get("/", summary="API Info", tags=["System"])
    async def root():
        uptime_seconds = (datetime.now(timezone.utc) - start_time).total_seconds()
        return {
            "name": "Idea Manager API",
            "version": "1.0.0",
            "description": "Manage and rank innovative ideas.",
            "docs_url": "/docs",
            "uptime_seconds": uptime_seconds,
            "host": socket.gethostname()
        }

    # Routers (we’ll add ideas soon)
    from app.api.routers.ideas import router as ideas_router
    app.include_router(ideas_router, prefix="/ideas", tags=["ideas"])

    from app.api.routers.health import router as health_router
    app.include_router(health_router, prefix="/health", tags=["health"])

    return app

app = create_app()