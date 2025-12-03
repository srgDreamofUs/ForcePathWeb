from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

import numpy as np

from src.config.settings import get_settings
from src.embeddings.embedder import embed_texts
from src.engine.cma_runner import CMARunner
from src.engine.height_calculator import HeightCalculator
from src.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class CandidateScore:
    vector: np.ndarray
    height: float

    def to_dict(self) -> dict:
        return {"vector": self.vector.tolist(), "height": self.height}


@dataclass
class StepResult:
    step: int
    current_height: float
    best_vector: np.ndarray
    best_height: float
    force_scores: dict
    candidate_scores: List[CandidateScore] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "step": self.step,
            "current_height": self.current_height,
            "best_height": self.best_height,
            "best_vector": self.best_vector.tolist(),
            "force_scores": self.force_scores,
            "candidates": [c.to_dict() for c in self.candidate_scores],
        }


class Simulator:
    def __init__(
        self,
        height_calculator: HeightCalculator | None = None,
        runner: CMARunner | None = None,
    ) -> None:
        settings = get_settings()
        self.max_steps = settings.simulation.steps
        self.height_calculator = height_calculator or HeightCalculator()
        self.runner = runner or CMARunner()

    def _embed_sentence(self, sentence: str) -> np.ndarray:
        embedding = embed_texts([sentence])
        if not embedding:
            raise ValueError("Unable to embed the provided sentence.")
        return np.array(embedding[0])

    def run(self, sentence: str, steps: int | None = None):
        current = self._embed_sentence(sentence)
        steps = steps or self.max_steps
        
        for step in range(steps):
            candidates = self.runner.sample(current)
            candidate_scores: List[CandidateScore] = []
            for candidate in candidates:
                height = self.height_calculator.height(candidate, current)
                candidate_scores.append(CandidateScore(vector=candidate, height=height))

            best = min(candidate_scores, key=lambda c: c.height)
            best_force_scores = self.height_calculator.force_interaction.dot_products(
                best.vector
            )
            current_height = self.height_calculator.height(current, current)

            result = StepResult(
                step=step,
                current_height=current_height,
                best_vector=best.vector,
                best_height=best.height,
                force_scores=best_force_scores,
                candidate_scores=candidate_scores,
            )
            
            logger.info(
                "Step %d | best height %.4f | dominant force %s",
                step,
                best.height,
                max(best_force_scores, key=best_force_scores.get),
            )
            current = best.vector
            yield result

