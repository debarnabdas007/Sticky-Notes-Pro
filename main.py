from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.logger import logger
from src.db.database import engine
from src.db.models import Base
from src.api.v1 import users, notes

# Create database tables automatically (perfect for SQLite development)
Base.metadata.create_all(bind=engine)

def get_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # Allow frontend to communicate with backend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # Change this to your frontend URL in production
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    logger.info("Application starting up...")

    # Include API routers
    app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
    app.include_router(notes.router, prefix=f"{settings.API_V1_STR}/notes", tags=["Notes"])

    return app

app = get_application()

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}