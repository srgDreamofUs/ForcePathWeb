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

# Configure CORS - MUST be set BEFORE including routers
# This allows all frontend domains to access the API
origins = [
    "https://forcepath.dev",
    "https://www.forcepath.dev",
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include routers AFTER CORS middleware
app.include_router(health.router, prefix="/api")
app.include_router(simulate.router, prefix="/api")
app.include_router(transition.router, prefix="/api")


@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    """Root endpoint - responds to both GET and HEAD for health checks."""
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

from fastapi.responses import JSONResponse

@app.get("/")
def root_get():
    return {"status": "ok"}

@app.head("/")
def root_head():
    return JSONResponse(content={"status": "ok"})