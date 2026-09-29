import logging
from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(AppException):
    """Resource not found exception (404)."""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            message=f"{resource} with id '{identifier}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ValidationErrorException(AppException):
    """Validation exception (422)."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class DatabaseException(AppException):
    """Safe database exception (500)."""

    def __init__(self, message: str = "A database error occurred."):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Global FastAPI handler for application exceptions."""
    if exc.status_code >= 500:
        logger.error(f"Internal server error: {exc.message} - path: {request.url.path}")
    else:
        logger.warning(f"Application warning ({exc.status_code}): {exc.message} - path: {request.url.path}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "status_code": exc.status_code,
                "details": exc.details,
            }
        },
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global fallback handler for unhandled exceptions."""
    logger.critical(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "An unexpected internal server error occurred.",
                "status_code": 500,
            }
        },
    )
