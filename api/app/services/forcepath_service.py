"""Service layer for ForcePath engine operations.

This service integrates the ForcePath engine components from src/:
- src/embeddings: Load embeddings for input sentences
- src/engine: Run CMA-ES simulation engine  
- src/decoder: Decode candidate vectors to natural language

The service does NOT contain engine logic itself - it delegates to src/ components.
"""
from __future__ import annotations

from typing import Generator

from src.decoder.future_decoder import FutureDecoder
from src.engine.simulator import Simulator, StepResult
from src.utils.logger import get_logger

logger = get_logger(__name__)


class ForcePathService:
    """Service for running ForcePath simulations.
    
    This service orchestrates the ForcePath engine components:
    1. Embedding Load: Simulator internally uses src/embeddings/embedder.py embed_texts()
       via _embed_sentence() method
    2. CMA-ES Engine: Simulator.run() calls CMARunner from src/engine/cma_runner.py
       For each step, runner.sample() generates candidate vectors
    3. Candidate Decoding: Uses FutureDecoder.decode() from src/decoder/future_decoder.py
       to convert vectors + force scores into natural language
    """

    def __init__(self) -> None:
        """Initialize the service with engine components from src/."""
        # Simulator handles embedding loading internally via src/embeddings/embedder.py
        # It uses _embed_sentence() which calls embed_texts()
        self.simulator = Simulator()
        
        # Decoder for converting vectors + force scores to natural language
        # Uses src/decoder/future_decoder.py
        self.decoder = FutureDecoder()

    def simulate(
        self, sentence: str, steps: int = 4, decode: bool = True
    ) -> Generator[dict, None, None]:
        """
        Run a full simulation as a generator yielding step-by-step dicts.
        
        Process:
        1. Simulator.run() internally uses src/embeddings/embedder.py embed_texts()
           via _embed_sentence() to load embeddings
        2. Simulator.run() calls CMARunner from src/engine/cma_runner.py
           For each step, runner.sample() generates candidate vectors
        3. Each step result is decoded via src/decoder/future_decoder.py
           FutureDecoder.decode() converts vectors + force scores into natural language
        
        Args:
            sentence: Input sentence describing a social state
            steps: Number of simulation steps
            decode: Whether to decode steps to natural language (adds "summary" field)
        
        Yields:
            Dictionary containing step results with minimal but working JSON structure:
            {
                "step": 0,
                "current_height": 1.2345,
                "best_height": 1.1234,
                "best_vector": [...],
                "force_scores": { "security": 0.5, ... },
                "summary": "Natural language description...",
                "candidates": [...]
            }
        
        Raises:
            Exception: If simulation fails (with logging)
        """
        logger.info("Starting simulation: sentence='%s', steps=%d", sentence, steps)

        try:
            # Simulator.run() handles:
            # - Embedding via src/embeddings/embedder.py embed_texts() (internal _embed_sentence)
            # - CMA-ES via src/engine/cma_runner.py CMARunner (runner.sample generates candidates)
            for step_result in self.simulator.run(sentence, steps=steps):
                # Convert StepResult to dict (minimal JSON structure)
                # StepResult.to_dict() returns the required JSON structure
                result_dict = step_result.to_dict()

                # Decode candidate via src/decoder/future_decoder.py
                # FutureDecoder.decode() converts vectors + force scores into natural language
                if decode:
                    try:
                        summary_data = self.decoder.decode(
                            step_result.force_scores, step_result.best_vector
                        )
                        result_dict["summary"] = summary_data.get("summary")
                        logger.debug("Decoded summary for step %d", step_result.step)
                    except Exception as e:
                        logger.warning("Failed to decode step %d: %s", step_result.step, e)
                        result_dict["summary"] = None

                yield result_dict

        except Exception as e:
            logger.error("Simulation failed: %s", e, exc_info=True)
            raise

    def transition(self, sentence: str, steps: int = 1, decode: bool = True) -> dict:
        """
        Run a single-step CMA optimization returning a single dict.
        
        This method runs a single transition step, which is useful for interactive
        exploration of the simulation space.
        
        Process:
        1. Simulator.run() internally uses src/embeddings/embedder.py embed_texts()
           via _embed_sentence() to load embeddings
        2. Simulator.run() calls CMARunner from src/engine/cma_runner.py
           runner.sample() generates candidate vectors
        3. Result is decoded via src/decoder/future_decoder.py
           FutureDecoder.decode() converts vectors + force scores into natural language
        
        Args:
            sentence: Input sentence describing a social state
            steps: Number of transition steps (typically 1)
            decode: Whether to decode to natural language (adds "summary" field)
        
        Returns:
            Dictionary containing transition result with minimal but working JSON structure:
            {
                "step": 0,
                "current_height": 1.2345,
                "best_height": 1.1234,
                "best_vector": [...],
                "force_scores": { "security": 0.5, ... },
                "summary": "Natural language description...",
                "candidates": [...]
            }
        
        Raises:
            ValueError: If no transition result generated
            Exception: If transition fails (with logging)
        """
        logger.info("Starting transition: sentence='%s', steps=%d", sentence, steps)

        try:
            # Get the first step result from simulator
            # Simulator handles:
            # - Embedding via src/embeddings/embedder.py (internal _embed_sentence)
            # - CMA-ES via src/engine/cma_runner.py (runner.sample generates candidates)
            step_result = next(self.simulator.run(sentence, steps=steps))
            
            # Convert StepResult to dict (minimal JSON structure)
            result_dict = step_result.to_dict()

            # Decode via src/decoder/future_decoder.py
            # FutureDecoder.decode() converts vectors + force scores into natural language
            if decode:
                try:
                    summary_data = self.decoder.decode(
                        step_result.force_scores, step_result.best_vector
                    )
                    result_dict["summary"] = summary_data.get("summary")
                    logger.debug("Decoded summary for transition")
                except Exception as e:
                    logger.warning("Failed to decode transition: %s", e)
                    result_dict["summary"] = None

            return result_dict

        except StopIteration:
            error_msg = "No transition result generated"
            logger.error(error_msg)
            raise ValueError(error_msg)
        except Exception as e:
            logger.error("Transition failed: %s", e, exc_info=True)
            raise
