"""Simulation endpoint."""
from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from api.app.schemas.request import SimulateRequest
from api.app.schemas.response import SimulateResponse
from api.app.services.forcepath_service import ForcePathService
from api.app.core.logging import get_logger
from api.app.routes.utils import create_step_response

logger = get_logger(__name__)

router = APIRouter(prefix="/simulate", tags=["simulation"])

service = ForcePathService()


@router.post("", response_model=SimulateResponse)
async def simulate(
    request: SimulateRequest,
    verbose: bool = Query(
        False,
        description="If True, include detailed fields (vectors, candidates). "
        "If False (default), return only essential fields to keep response under 50KB."
    ),
) -> SimulateResponse:
    """
    Run a full simulation from an input sentence.
    
    This endpoint runs multiple steps of the ForcePath simulation,
    generating a trajectory of future states.
    
    **Response Size Control:**
    - By default (verbose=False), returns only essential fields:
      - step
      - current_height
      - best_height
      - summary
    - With verbose=True, includes additional fields but truncated:
      - force_scores (all forces)
      - best_vector_preview (first 10 elements only)
      - candidates_preview (first 10 candidates only)
    
    **Examples:**
    
    Default response (verbose=False):
    ```json
    {
        "success": true,
        "steps": [
            {
                "step": 0,
                "current_height": 1.2345,
                "best_height": 1.1234,
                "summary": "Natural language description..."
            }
        ],
        "message": null
    }
    ```
    
    Verbose response (verbose=True):
    ```json
    {
        "success": true,
        "steps": [
            {
                "step": 0,
                "current_height": 1.2345,
                "best_height": 1.1234,
                "summary": "Natural language description...",
                "force_scores": {
                    "security": 0.5,
                    "sustainability": 0.3
                },
                "best_vector_preview": [0.1, 0.2, ...],
                "candidates_preview": [...]
            }
        ],
        "message": null
    }
    ```
    
    **Safety:**
    - Response size is guaranteed to stay under 50KB
    - Large arrays are automatically truncated
    - No raw embedding vectors are returned by default
    """
    # Use query parameter if explicitly True, otherwise use request body value
    # Query parameter takes precedence when True
    use_verbose = verbose or request.verbose
    
    try:
        steps = []
        sanitized_steps = max(1, min(5, request.steps))
        for step_dict in service.simulate(
            sentence=request.sentence, steps=sanitized_steps, decode=True
        ):
            step_response = create_step_response(step_dict, use_verbose)
            steps.append(step_response)

        return SimulateResponse(success=True, steps=steps)

    except Exception as e:
        logger.error("Simulation error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


async def _stream_simulation_steps(
    sentence: str, steps: int, decode: bool = True
):
    """
    Async generator that yields simulation steps as they are computed.
    
    This function wraps the synchronous service.simulate() generator
    and yields lightweight step data suitable for streaming.
    
    Args:
        sentence: Input sentence describing a social state
        steps: Number of simulation steps
        decode: Whether to decode steps to natural language
    
    Yields:
        Dictionary with only lightweight fields:
        {
            "step": int,
            "current_height": float,
            "best_height": float,
            "summary": str | None
        }
    """
    try:
        # Iterate over synchronous generator
        # Since it yields step-by-step, we can iterate without blocking too long
        sanitized_steps = max(1, min(5, steps))
        for step_dict in service.simulate(sentence=sentence, steps=sanitized_steps, decode=decode):
            lightweight_step = {
                "step": step_dict["step"],
                "current_height": step_dict["current_height"],
                "best_height": step_dict["best_height"],
                "summary": step_dict.get("summary"),
            }
            await asyncio.sleep(0)
            yield lightweight_step
            
    except asyncio.CancelledError:
        # Client disconnected - log and exit gracefully
        logger.info("Client disconnected during simulation stream")
        raise
    except Exception as e:
        logger.error("Error in simulation stream: %s", e, exc_info=True)
        # Yield error as final message
        yield {"error": str(e), "success": False}


@router.post("/simulate_stream")
async def simulate_stream(request: SimulateRequest) -> StreamingResponse:
    """
    Stream simulation steps in real-time as they are computed.
    
    This endpoint streams each simulation step immediately when it finishes computation,
    allowing clients to see progress in real-time without waiting for all steps to complete.
    
    **Request Body:**
    Same as `/api/simulate` endpoint:
    ```json
    {
        "sentence": "The pace of technological advancement is outstripping social institutions.",
        "steps": 4
    }
    ```
    
    **Response Format:**
    Newline-delimited JSON (NDJSON). Each line is a complete JSON object representing one step.
    
    **Streamed Fields:**
    Only lightweight fields are included (no heavy vectors or arrays):
    - `step`: Step index (0-indexed)
    - `current_height`: Height of current state
    - `best_height`: Height of best candidate
    - `summary`: Natural language description of the step (if available)
    
    **Example Output:**
    ```
    {"step": 0, "current_height": 123.3, "best_height": 5.1, "summary": "Society faces increasing polarization..."}
    {"step": 1, "current_height": 90.2, "best_height": 4.3, "summary": "Technological disruption accelerates..."}
    ```
    
    **Usage with curl:**
    ```bash
    curl -X POST "http://localhost:8000/api/simulate/simulate_stream" \\
         -H "Content-Type: application/json" \\
         -d '{"sentence": "Technology is advancing rapidly", "steps": 4}' \\
         --no-buffer
    ```
    
    **Usage with Python:**
    ```python
    import requests
    import json
    
    response = requests.post(
        "http://localhost:8000/api/simulate/simulate_stream",
        json={"sentence": "Technology is advancing rapidly", "steps": 4},
        stream=True
    )
    
    for line in response.iter_lines():
        if line:
            step = json.loads(line)
            print(f"Step {step['step']}: {step['summary']}")
    ```
    
    **Client Disconnect Handling:**
    - If the client disconnects, the stream stops gracefully
    - No errors are raised on the server side
    - Partial results are still valid
    
    **Safety:**
    - No heavy vectors (best_vector, candidates) are included
    - Response size per line is kept small (< 1KB typically)
    - Suitable for real-time UI updates
    """
    
    async def generate():
        """Async generator that yields JSON lines for streaming."""
        try:
            async for step in _stream_simulation_steps(
                sentence=request.sentence,
                steps=request.steps,
                decode=True
            ):
                # Serialize to JSON and add newline
                json_line = json.dumps(step, ensure_ascii=False) + "\n"
                yield json_line.encode("utf-8")
                
        except asyncio.CancelledError:
            # Client disconnected - this is expected, just log and exit
            logger.info("Stream cancelled (client disconnected)")
        except Exception as e:
            # Send error as final JSON line
            logger.error("Stream error: %s", e, exc_info=True)
            error_line = json.dumps({"error": str(e), "success": False}, ensure_ascii=False) + "\n"
            yield error_line.encode("utf-8")
    
    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )


@router.post("/stream")
async def simulate_stream_legacy(
    request: SimulateRequest,
    verbose: bool = Query(
        False,
        description="If True, include detailed fields (vectors, candidates). "
        "If False (default), return only essential fields."
    ),
):
    """
    Legacy streaming endpoint (kept for backward compatibility).
    
    For new implementations, use `/api/simulate/simulate_stream` instead.
    
    Returns a streaming response with JSON lines.
    Each line is a step result, lightweight by default.
    
    **Safety:**
    - Large arrays are truncated even in streaming mode
    - Each line is kept small to prevent buffer issues
    """
    use_verbose = verbose or request.verbose

    def generate():
        try:
            for step_dict in service.simulate(
                sentence=request.sentence, steps=request.steps, decode=True
            ):
                # Create lightweight or verbose response
                step_response = create_step_response(step_dict, use_verbose)
                # Convert to dict for JSON serialization
                step_dict_clean = step_response.model_dump()
                yield json.dumps(step_dict_clean) + "\n"
        except Exception as e:
            logger.error("Streaming simulation error: %s", e, exc_info=True)
            error_dict = {"error": str(e), "success": False}
            yield json.dumps(error_dict) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")

@router.options("/simulate")
def simulate_options():
    return Response(status_code=200)

@router.options("/simulate/simulate_stream")
def simulate_stream_options():
    return Response(status_code=200)