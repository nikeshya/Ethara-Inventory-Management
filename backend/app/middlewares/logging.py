"""
Request/Response logging middleware.
Logs request method, path, status code, and response time for every API call.
"""

import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs HTTP request/response details with timing."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()

        # Log incoming request
        logger.info(f"→ {request.method} {request.url.path}")

        try:
            response = await call_next(request)
        except Exception as exc:
            # Log failed requests
            duration = time.time() - start_time
            logger.error(
                f"✗ {request.method} {request.url.path} | "
                f"Error: {str(exc)} | {duration:.3f}s"
            )
            raise

        # Calculate response time
        duration = time.time() - start_time

        # Log response
        status_emoji = "✓" if response.status_code < 400 else "✗"
        logger.info(
            f"{status_emoji} {request.method} {request.url.path} | "
            f"Status: {response.status_code} | {duration:.3f}s"
        )

        # Add response time header
        response.headers["X-Response-Time"] = f"{duration:.3f}s"

        return response
