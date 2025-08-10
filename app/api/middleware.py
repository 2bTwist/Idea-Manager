import logging
import time
import uuid
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
from typing import Callable
from starlette.types import ASGIApp

# Stores the request_id per request
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")
log = logging.getLogger("app.request")

class RequestIDMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, header_name: str = "X-Request-ID"):
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next: Callable):
        rid = request.headers.get(self.header_name, str(uuid.uuid4()))
        token = request_id_ctx.set(rid)
        try:
            response = await call_next(request)
        finally:
            request_id_ctx.reset(token)
        response.headers[self.header_name] = rid
        return response


class AccessLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        start = time.perf_counter()
        rid = request_id_ctx.get()
        try:
            response = await call_next(request)
            status = response.status_code
        except Exception:
            status = 500
            raise
        finally:
            duration_ms = int((time.perf_counter() - start) * 1000)
            client = request.client.host if request.client else "-"
            log.info(
                "rid=%s method=%s path=%s status=%s duration_ms=%s client=%s",
                rid, request.method, request.url.path, status, duration_ms, client
            )
        return response
