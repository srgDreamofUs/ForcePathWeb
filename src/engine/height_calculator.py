from __future__ import annotations

import numpy as np

from src.config.model_config import get_model_config
from src.forces.force_interaction import ForceInteraction
from src.penalties.penalty_aggregator import PenaltyAggregator


class HeightCalculator:
    def __init__(
        self,
        force_interaction: ForceInteraction | None = None,
        penalties: PenaltyAggregator | None = None,
    ) -> None:
        model_config = get_model_config()
        self.force_interaction = force_interaction or ForceInteraction()
        self.penalties = penalties or PenaltyAggregator(
            distance_alpha=model_config.height.distance_alpha
        )
        self.epsilon = model_config.height.epsilon

    def height(self, candidate: np.ndarray, current: np.ndarray) -> float:
        force_product = self.force_interaction.multiplicative_score(candidate)
        penalties = self.penalties.total(candidate, current)
        return (1.0 / (force_product + self.epsilon)) * penalties

