"""Shared utilities for route handlers."""
from __future__ import annotations

from typing import Any

from api.app.schemas.response import StepResponseLightweight, StepResponseVerbose

# Safety limits to ensure response stays under 50KB
MAX_VECTOR_PREVIEW_LENGTH = 10
MAX_CANDIDATES_PREVIEW = 10


def truncate_vector(vector: list[float] | None, max_length: int = MAX_VECTOR_PREVIEW_LENGTH) -> list[float] | None:
    """Truncate vector to max_length elements for safety."""
    if vector is None:
        return None
    if len(vector) <= max_length:
        return vector
    return vector[:max_length]


def truncate_candidates(
    candidates: list[dict[str, Any]] | None, max_count: int = MAX_CANDIDATES_PREVIEW
) -> list[dict[str, Any]] | None:
    """Truncate candidates list to max_count items for safety."""
    if candidates is None:
        return None
    if len(candidates) <= max_count:
        return candidates
    return candidates[:max_count]


def create_step_response(step_dict: dict[str, Any], verbose: bool) -> StepResponseLightweight | StepResponseVerbose:
    """
    Create step response based on verbose flag.
    
    Args:
        step_dict: Raw step data from service
        verbose: If True, include detailed fields (truncated). If False, only essential fields.
    
    Returns:
        StepResponseLightweight or StepResponseVerbose
    """
    if not verbose:
        # Lightweight: only essential fields
        return StepResponseLightweight(
            step=step_dict["step"],
            current_height=step_dict["current_height"],
            best_height=step_dict["best_height"],
            summary=step_dict.get("summary"),
        )
    else:
        # Verbose: include detailed fields but truncated
        return StepResponseVerbose(
            step=step_dict["step"],
            current_height=step_dict["current_height"],
            best_height=step_dict["best_height"],
            summary=step_dict.get("summary"),
            force_scores=step_dict.get("force_scores", {}),
            best_vector_preview=truncate_vector(step_dict.get("best_vector")),
            candidates_preview=truncate_candidates(step_dict.get("candidates")),
        )


