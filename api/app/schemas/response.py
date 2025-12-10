"""Response schemas for API endpoints."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ForceScore(BaseModel):
    """Force score for a single force."""

    name: str
    score: float


class StepResponseLightweight(BaseModel):
    """Lightweight response for a single simulation step (verbose=False).
    
    Contains only essential fields to keep response size under 50KB.
    
    Example:
        {
            "step": 0,
            "current_height": 1.2345,
            "best_height": 1.1234,
            "summary": "Natural language description of the future state..."
        }
    """

    step: int = Field(..., description="Step number (0-indexed)")
    current_height: float = Field(..., description="Height of current state")
    best_height: float = Field(..., description="Height of best candidate")
    summary: str | None = Field(None, description="Natural language summary of this step")


class StepResponseVerbose(BaseModel):
    """Verbose response for a single simulation step (verbose=True).
    
    Includes detailed fields but with truncation to prevent large responses.
    Vectors and candidates are limited to max 10 items for safety.
    
    Example:
        {
            "step": 0,
            "current_height": 1.2345,
            "best_height": 1.1234,
            "summary": "Natural language description...",
            "force_scores": {"security": 0.5, "sustainability": 0.3},
            "best_vector_preview": [0.1, 0.2, ...],  # First 10 elements only
            "candidates_preview": [...]  # Max 10 candidates
        }
    """

    step: int = Field(..., description="Step number (0-indexed)")
    current_height: float = Field(..., description="Height of current state")
    best_height: float = Field(..., description="Height of best candidate")
    summary: str | None = Field(None, description="Natural language summary of this step")
    force_scores: dict[str, float] = Field(
        default_factory=dict,
        description="Force alignment scores (all forces included)"
    )
    best_vector_preview: list[float] | None = Field(
        None,
        description="First 10 elements of best candidate embedding vector (truncated for safety)"
    )
    candidates_preview: list[dict[str, Any]] | None = Field(
        None,
        description="First 10 candidate scores (truncated for safety)"
    )


# Alias for backward compatibility (will use lightweight by default)
StepResponse = StepResponseLightweight


class SimulateResponse(BaseModel):
    """Response for /api/simulate endpoint.
    
    Response size is kept under 50KB by default (verbose=False).
    When verbose=True, detailed fields are included but still truncated.
    
    Example (verbose=False):
        {
            "success": true,
            "steps": [
                {
                    "step": 0,
                    "current_height": 1.2345,
                    "best_height": 1.1234,
                    "summary": "Description..."
                }
            ],
            "message": null
        }
    """

    success: bool = Field(..., description="Whether simulation completed successfully")
    steps: list[StepResponseLightweight | StepResponseVerbose] = Field(
        ..., description="List of simulation steps"
    )
    message: str | None = Field(None, description="Optional message")


class TransitionResponse(BaseModel):
    """Response for /api/transition endpoint.
    
    Uses lightweight response by default to keep size small.
    """

    success: bool = Field(..., description="Whether transition completed successfully")
    step: StepResponseLightweight | StepResponseVerbose = Field(
        ..., description="Transition step result"
    )
    message: str | None = Field(None, description="Optional message")


class HealthResponse(BaseModel):
    """Response for /api/health endpoint."""

    status: str = Field(..., description="Health status")
    version: str = Field(default="1.0.0", description="API version")
