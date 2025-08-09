from fastapi import FastAPI

def create_app() -> FastAPI:
    app = FastAPI(title="Idea Manager", version="0.1.0")

    # Routers (we’ll add ideas soon)
    from app.api.routers.ideas import router as ideas_router
    app.include_router(ideas_router, prefix="/ideas", tags=["ideas"])

    return app

app = create_app()