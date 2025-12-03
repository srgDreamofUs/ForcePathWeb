from __future__ import annotations

import numpy as np

from src.embeddings.social_penalty import compute_social_penalty
from src.penalties.distance_penalty import DistancePenalty


class PenaltyAggregator:
    def __init__(self, distance_alpha: float = 0.5) -> None:
        self.distance_penalty = DistancePenalty(alpha=distance_alpha)

    def total(self, candidate: np.ndarray, current: np.ndarray) -> float:
        social = compute_social_penalty(candidate)
        distance = self.distance_penalty(candidate, current)
        return social * distance

