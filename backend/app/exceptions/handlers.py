"""
Custom exception classes and centralized exception handlers.
Provides structured error responses for the API.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from app.core.logging import logger




class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Raised when a requested resource is not found."""

    def __init__(self, resource: str, resource_id: int):
        super().__init__(
            message=f"{resource} with ID {resource_id} not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class DuplicateException(AppException):
    """Raised when a unique constraint is violated."""

    def __init__(self, field: str, value: str):
        super().__init__(
            message=f"A record with {field} '{value}' already exists",
            status_code=status.HTTP_409_CONFLICT,
        )


class InsufficientStockException(AppException):
    """Raised when order quantity exceeds available stock."""

    def __init__(self, product_name: str, available: int, requested: int):
        super().__init__(
            message=f"Insufficient stock for '{product_name}': available={available}, requested={requested}",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class ValidationException(AppException):
    """Raised for business rule validation failures."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )




def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers with the FastAPI application."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.error(f"AppException: {exc.message} | Path: {request.url.path}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": exc.message,
                "status_code": exc.status_code,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = []
        for error in exc.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            errors.append({
                "field": field,
                "message": error["msg"],
                "type": error["type"],
            })
        logger.warning(f"Validation error: {errors} | Path: {request.url.path}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": "Validation failed",
                "details": errors,
                "status_code": 422,
            },
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(
        request: Request, exc: IntegrityError
    ) -> JSONResponse:
        logger.error(f"Database integrity error: {str(exc)} | Path: {request.url.path}")
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "error": "Database constraint violation. A record with this data may already exist.",
                "status_code": 409,
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception(f"Unhandled exception: {str(exc)} | Path: {request.url.path}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "An unexpected error occurred. Please try again later.",
                "status_code": 500,
            },
        )
