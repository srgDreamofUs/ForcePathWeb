"""FastAPI application entry point."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.app.core.config import get_settings
from api.app.core.logging import setup_logging
from api.app.routes import health, simulate, transition

# Setup logging first
setup_logging()

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="ForcePath API",
    description="API for ForcePath social dynamics simulation engine",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api")
app.include_router(simulate.router, prefix="/api")
app.include_router(transition.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "ForcePath API",
        "version": "1.0.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
    )




