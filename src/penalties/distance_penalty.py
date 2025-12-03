from __future__ import annotations

import numpy as np


class DistancePenalty:
    def __init__(self, alpha: float = 0.5) -> None:
        self.alpha = alpha

    def __call__(self, candidate: np.ndarray, current: np.ndarray) -> float:
        distance = float(np.linalg.norm(candidate - current))
        return 1.0 + self.alpha * distance

