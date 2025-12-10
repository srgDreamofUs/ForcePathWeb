"""Transition endpoint."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from api.app.schemas.request import TransitionRequest
from api.app.schemas.response import TransitionResponse
from api.app.services.forcepath_service import ForcePathService
from api.app.core.logging import get_logger
from api.app.routes.utils import create_step_response

logger = get_logger(__name__)

router = APIRouter(prefix="/transition", tags=["transition"])

service = ForcePathService()


@router.post("", response_model=TransitionResponse)
async def transition(
    request: TransitionRequest,
    verbose: bool = Query(
        False,
        description="If True, include detailed fields (vectors, candidates). "
        "If False (default), return only essential fields to keep response under 50KB."
    ),
) -> TransitionResponse:
    """
    Run a single transition step from an input sentence.
    
    This endpoint generates one step forward in the simulation,
    useful for interactive exploration.
    
    **Response Size Control:**
    - By default (verbose=False), returns only essential fields
    - With verbose=True, includes additional fields but truncated
    
    **Safety:**
    - Response size is guaranteed to stay under 50KB
    - Large arrays are automatically truncated
    """
    # Use query parameter if explicitly True, otherwise use request body value
    # Query parameter takes precedence when True
    use_verbose = verbose or request.verbose
    
    try:
        sanitized_steps = max(1, min(5, request.steps))
        step_dict = service.transition(
            sentence=request.sentence, steps=sanitized_steps, decode=True
        )
        
        # Create lightweight or verbose response based on flag
        step_response = create_step_response(step_dict, use_verbose)

        return TransitionResponse(success=True, step=step_response)

    except Exception as e:
        logger.error("Transition error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Transition failed: {str(e)}")
