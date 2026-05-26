"""
app/main.py
FastAPI application factory — registers all routers, CORS, and startup events.
"""
import logging
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from app.routers import auth, reports, chatbot, doctor, admin, dashboard

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title="MedAssist API",
        description="AI-powered medical report intelligence platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS — allow frontend origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(auth.router)
    app.include_router(auth.google_router, prefix="/auth")
    app.include_router(reports.router)
    app.include_router(chatbot.router)
    app.include_router(doctor.router)
    app.include_router(admin.router)
    app.include_router(dashboard.router)

    # Serve uploaded files (dev only — use S3/CDN in production)
    uploads_dir = Path(settings.UPLOAD_DIR)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

    @app.on_event("startup")
    async def startup():
        # Auto-create all tables (use Alembic migrations in production)
        Base.metadata.create_all(bind=engine)
        logger.info("✅ MedAssist API started — database tables ready")

    @app.get("/", tags=["Health"])
    def health_check():
        return {"status": "ok", "service": "MedAssist API", "version": "1.0.0"}

    @app.get("/api/health", tags=["Health"])
    def api_health():
        return {"status": "healthy", "env": settings.APP_ENV}

    return app


app = create_app()
