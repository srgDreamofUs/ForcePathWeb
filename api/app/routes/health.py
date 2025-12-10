"""Health check endpoint."""
from __future__ import annotations

from fastapi import APIRouter

from api.app.schemas.response import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="ok", version="1.0.0")




