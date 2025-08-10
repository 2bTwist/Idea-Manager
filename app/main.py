from datetime import datetime, timezone
import socket
from fastapi import FastAPI

from app import __version__ as APP_VERSION

start_time = datetime.now(timezone.utc)

def create_app() -> FastAPI:
    app = FastAPI(title="Idea Manager", version=APP_VERSION)

    # API Info
    @app.get("/", summary="API Info", tags=["health"])
    async def root():
        uptime_seconds = (datetime.now(timezone.utc) - start_time).total_seconds()
        return {
            "name": "Idea Manager API",
            "version": APP_VERSION,
            "description": "Manage and rank innovative ideas.",
            "docs_url": "/docs",
            "uptime_seconds": uptime_seconds,
            "host": socket.gethostname()
        }

    # Routers
    from app.api.routers.health import router as health_router
    app.include_router(health_router, prefix="/health", tags=["health"])

    from app.api.routers.ideas import router as ideas_router
    app.include_router(ideas_router, prefix="/ideas", tags=["ideas"])

    return app

app = create_app()