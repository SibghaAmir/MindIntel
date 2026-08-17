from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, games
from app.config.settings import settings

app = FastAPI(
    title="Kasoti API",
    description="Backend API for the Kasoti AI Mind Investigation game.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "*"], # allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api")
app.include_router(games.router, prefix="/api/games", tags=["Games"])
