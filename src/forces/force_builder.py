from __future__ import annotations

from pathlib import Path
from typing import Dict, Sequence

import numpy as np

from src.config.settings import get_settings
from src.embeddings.embedder import embed_texts
from src.utils.io_utils import ensure_directory, load_force_definitions, save_force_vectors
from src.utils.logger import get_logger

logger = get_logger(__name__)


def _flatten_sentences(payload: dict | Sequence[str]) -> Sequence[str]:
    if isinstance(payload, dict):
        return payload.get("sentences", [])
    return payload


def compute_force_vector(sentences: Sequence[str]) -> np.ndarray:
    embeddings = embed_texts(sentences)
    if not embeddings:
        raise ValueError("No embeddings were produced for the provided sentences.")
    return np.mean(np.array(embeddings), axis=0)


def build_force_vectors(force_yaml: Path | None = None) -> Dict[str, np.ndarray]:
    settings = get_settings()
    source = force_yaml or settings.paths.force_yaml
    force_defs = load_force_definitions(source)
    results: Dict[str, np.ndarray] = {}
    for name, payload in force_defs.items():
        sentences = _flatten_sentences(payload)
        if not sentences:
            continue
        logger.info("Embedding %s (%d sentences)", name, len(sentences))
        vector = compute_force_vector(sentences)
        results[name] = vector
    return results


def rebuild_force_cache(
    force_yaml: Path | None = None, cache_path: Path | None = None
) -> Path:
    settings = get_settings()
    cache = cache_path or settings.paths.force_cache
    vectors = build_force_vectors(force_yaml)
    serializable = {k: v.tolist() for k, v in vectors.items()}
    ensure_directory(cache.parent)
    save_force_vectors(cache, serializable)
    logger.info("Force vector cache saved to %s", cache)
    return cache

