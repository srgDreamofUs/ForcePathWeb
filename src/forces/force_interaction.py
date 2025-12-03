from __future__ import annotations

from typing import Dict

import numpy as np

from src.config.model_config import get_model_config
from src.forces.force_manager import ForceManager


class ForceInteraction:
    def __init__(self, manager: ForceManager | None = None) -> None:
        self.manager = manager or ForceManager()
        self.height_config = get_model_config().height

    def dot_products(self, vector: np.ndarray) -> Dict[str, float]:
        return self.manager.weighted_dot(vector)

    def multiplicative_score(self, vector: np.ndarray) -> float:
        eps = self.height_config.epsilon
        product = 1.0
        for name, score in self.dot_products(vector).items():
            clamped = max(score, eps)
            weight = self.manager.weight(name)
            product *= clamped**weight
        return product

