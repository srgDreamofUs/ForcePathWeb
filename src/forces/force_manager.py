from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

import numpy as np

from src.config.settings import get_settings
from src.utils.io_utils import load_force_vectors, load_force_weights
from src.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ForceData:
    vectors: Dict[str, np.ndarray]
    weights: Dict[str, float]


class ForceManager:
    def __init__(self) -> None:
        settings = get_settings()
        self._cache_path = settings.paths.force_cache
        self._weights_path = settings.paths.weights_file
        self.data = self._load_data()

    def _load_data(self) -> ForceData:
        vectors = load_force_vectors(self._cache_path)
        weights = load_force_weights(self._weights_path)
        return ForceData(vectors=vectors, weights=weights)

    def names(self) -> list[str]:
        return list(self.data.vectors.keys())

    def vector(self, name: str) -> np.ndarray:
        return self.data.vectors[name]

    def weight(self, name: str) -> float:
        return float(self.data.weights.get(name, 1.0))

    def weighted_dot(self, vector: np.ndarray) -> Dict[str, float]:
        results: Dict[str, float] = {}
        for name, force_vector in self.data.vectors.items():
            score = float(np.dot(vector, force_vector)) * self.weight(name)
            results[name] = score
        return results

