from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True)
class CMAConfig:
    max_generations: int = 60
    sigma_init: float = 0.4
    population_size: int = 12


@dataclass(frozen=True)
class HeightConfig:
    epsilon: float = 1e-8
    distance_alpha: float = 0.5
    social_floor: float = 1e-4


@dataclass(frozen=True)
class ModelConfig:
    cma: CMAConfig
    height: HeightConfig


@lru_cache(maxsize=1)
def get_model_config() -> ModelConfig:
    return ModelConfig(cma=CMAConfig(), height=HeightConfig())

