# app/api/middleware.py
import logging
import time
import uuid
from contextvars import ContextVar
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from fastapi import Request, Response

request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")

# Two loggers: one generic 'app' and a special 'app.request' for access lines
app_log = logging.getLogger("app")
access_log = logging.getLogger("app.request")

class RequestIDMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, header_name: str = "X-Request-ID"):
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        rid = request.headers.get(self.header_name, str(uuid.uuid4()))
        token = request_id_ctx.set(rid)
        try:
            response = await call_next(request)
        finally:
            request_id_ctx.reset(token)
        response.headers[self.header_name] = rid
        return response


# ...existing code...

class AccessLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()
        response: Response | None = None
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            duration_ms = int((time.perf_counter() - start) * 1000)
            rid = request_id_ctx.get()
            access_log.error(
                f"Unhandled exception for {request.method} {request.url.path}: {exc}",
                exc_info=True,
                extra={
                    "request_id": rid,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "client": request.client.host if request.client else "-",
                },
            )
            raise  # re-raise so FastAPI can handle it
        finally:
            if response is not None:
                duration_ms = int((time.perf_counter() - start) * 1000)
                # Prefer request ID from response header (set by RequestIDMiddleware),
                # fall back to context var which might be reset to '-' by then.
                rid = response.headers.get("X-Request-ID") or request_id_ctx.get()
                status_code = response.status_code
                access_log.info(
                    "request",
                    extra={
                        "request_id": rid,
                        "method": request.method,
                        "path": request.url.path,
                        "status_code": status_code,
                        "duration_ms": duration_ms,
                        "client": request.client.host if request.client else "-",
                    },
                )
# ...existing code...