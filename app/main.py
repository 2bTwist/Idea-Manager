from datetime import datetime, timezone
import socket
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.logging import configure_logging
from app.api.middleware import RequestIDMiddleware, AccessLogMiddleware

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

    app = FastAPI(title="Idea Manager", version="0.1.0")

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
            "version": "1.0.0",
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