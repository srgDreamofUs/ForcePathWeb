from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.app.core.logging import setup_logging
from api.app.routes import health, simulate, transition, ai

setup_logging()

app = FastAPI(
    title="ForcePath API",
    description="API for ForcePath social dynamics simulation engine",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://forcepath.dev"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(health.router, prefix="/api")
app.include_router(simulate.router, prefix="/api")
app.include_router(transition.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

# Render health check
@app.get("/", include_in_schema=False)
async def root():
    return {"status": "ok"}
