"""Request schemas for API endpoints."""
from __future__ import annotations

from pydantic import BaseModel, Field


class SimulateRequest(BaseModel):
    sentence: str = Field(..., description="Input sentence describing a social state")
    steps: int = Field(default=1, ge=1, le=5, description="Number of simulation steps")
    verbose: bool = Field(
        default=False,
        description="If True, include detailed fields (vectors, candidates). "
        "If False (default), return only essential fields to keep response under 50KB."
    )


class TransitionRequest(BaseModel):
    sentence: str = Field(..., description="Input sentence describing a social state")
    steps: int = Field(default=1, ge=1, le=5, description="Number of transition steps")
    verbose: bool = Field(
        default=False,
        description="If True, include detailed fields (vectors, candidates). "
        "If False (default), return only essential fields to keep response under 50KB."
    )
