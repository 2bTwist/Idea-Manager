from datetime import datetime, timezone
import socket
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import configure_logging
from app.api.middleware import RequestIDMiddleware, AccessLogMiddleware

from app import __version__ as API_VERSION
from app.core.config import settings

start_time = datetime.now(timezone.utc)

def unhandled_exception_handler(request: Request, exc: Exception):
    logger = logging.getLogger("app")
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

def create_app() -> FastAPI:
    configure_logging()  # Set up logging early

    app = FastAPI(title="Idea Manager", version=API_VERSION)

        # Parse origins (handles comma-separated string or list)
    origins = settings.BACKEND_CORS_ORIGINS
    if isinstance(origins, str):
        origins = [o.strip() for o in origins.split(",") if o.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"] if settings.APP_ENV == "dev" else origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add middleware
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(AccessLogMiddleware)

    # Handle unexpected errors
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # Root info endpoint
    @app.get("/", summary="API Info", tags=["health"])
    async def root():
        uptime_seconds = (datetime.now(timezone.utc) - start_time).total_seconds()
        return {
            "name": "Idea Manager API",
            "version": API_VERSION,
            "description": "Manage and rank innovative ideas.",
            "docs_url": "/docs",
            "uptime_seconds": uptime_seconds,
            "host": socket.gethostname(),
        }

    # Routers
    from app.api.routers.health import router as health_router
    app.include_router(health_router, prefix="/health", tags=["health"])

    from app.api.routers.ideas import router as ideas_router
    app.include_router(ideas_router, prefix="/ideas", tags=["ideas"])

    return app

app = create_app()