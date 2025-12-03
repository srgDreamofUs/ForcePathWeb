from __future__ import annotations

from typing import List

import cma
import numpy as np

from src.config.model_config import get_model_config


class CMARunner:
    def __init__(self) -> None:
        config = get_model_config().cma
        self.population = config.population_size
        self.sigma = config.sigma_init

    def sample(self, current_vector: np.ndarray) -> List[np.ndarray]:
        es = cma.CMAEvolutionStrategy(
            current_vector.tolist(),
            self.sigma,
            {"popsize": self.population, "verbose": -9},
        )
        samples = es.ask()
        return [np.array(vec) for vec in samples]

