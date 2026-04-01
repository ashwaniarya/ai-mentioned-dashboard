from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import lifespan
from app.mentions.mention_routes import mention_router


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

    return application
