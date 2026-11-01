from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, stream
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(
    title="Mypaisaa Prediction API",
    version="0.1.0",
    description="Personal investment intelligence API. No trade execution.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "Last-Event-ID"],
)
app.include_router(health.router, prefix="/api/v1")
app.include_router(stream.router, prefix="/api/v1")
