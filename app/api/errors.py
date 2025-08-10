import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette import status

log = logging.getLogger("app.errors")

async def unhandled_exception_handler(request: Request, exc: Exception):
    rid = request.headers.get("X-Request-ID", "-")
    log.exception("Unhandled exception rid=%s path=%s", rid, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error", "request_id": rid},
    )
