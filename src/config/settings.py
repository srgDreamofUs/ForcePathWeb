from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class PathConfig:
    repo_root: Path
    data_dir: Path
    force_yaml: Path
    social_reference_yaml: Path
    force_cache: Path
    cache_dir: Path
    weights_file: Path


@dataclass(frozen=True)
class EmbeddingConfig:
    model_name: str
    batch_size: int


@dataclass(frozen=True)
class SimulationConfig:
    steps: int
    population_size: int
    sigma_init: float


@dataclass(frozen=True)
class Settings:
    paths: PathConfig
    embedding: EmbeddingConfig
    simulation: SimulationConfig
    openai_api_key: str | None


def _default_repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _build_paths(root: Path) -> PathConfig:
    data_dir = root / "data"
    cache_dir = root / "cache"
    return PathConfig(
        repo_root=root,
        data_dir=data_dir,
        force_yaml=data_dir / "forces" / "forces.yaml",
        social_reference_yaml=data_dir / "social_reference.yaml",
        force_cache=cache_dir / "force_vectors.npy",
        cache_dir=cache_dir,
        weights_file=root / "src" / "config" / "force_weights.json",
    )


def _build_embedding() -> EmbeddingConfig:
    return EmbeddingConfig(
        model_name=os.getenv("OPENAI_EMBED_MODEL", "text-embedding-4"),
        batch_size=int(os.getenv("EMBED_BATCH_SIZE", "32")),
    )


def _build_simulation() -> SimulationConfig:
    return SimulationConfig(
        steps=int(os.getenv("SIMULATION_STEPS", "10")),
        population_size=int(os.getenv("SIMULATION_POPULATION", "8")),
        sigma_init=float(os.getenv("SIMULATION_SIGMA", "0.1")),
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    repo_root = _default_repo_root()
    return Settings(
        paths=_build_paths(repo_root),
        embedding=_build_embedding(),
        simulation=_build_simulation(),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
    )

