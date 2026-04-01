import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import CORS_ORIGINS
from app.database import lifespan
from app.exceptions import AppApiException
from app.mentions.mention_routes import mention_router
from app.mentions.mention_schemas import ErrorResponse

logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    application = FastAPI(title="Brand Mentions API", lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(mention_router)

    @application.get("/health")
    async def health():
        return {"status": "ok"}

    @application.exception_handler(AppApiException)
    async def handle_app_api_exception(request: Request, exc: AppApiException):
        logger.error(
            "AppApiException %s: %s (detail: %s)",
            exc.status_code,
            exc.error,
            exc.detail,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(error=exc.error, detail=exc.detail).model_dump(),
        )

    @application.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError):
        first_error = exc.errors()[0]
        field_path = " -> ".join(str(loc) for loc in first_error["loc"] if loc != "body")
        detail = f"{field_path}: {first_error['msg']}" if field_path else first_error["msg"]
        return JSONResponse(
            status_code=422,
            content=ErrorResponse(error="Validation error", detail=detail).model_dump(),
        )

    return application
