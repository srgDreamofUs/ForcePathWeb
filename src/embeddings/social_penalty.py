from __future__ import annotations

from functools import lru_cache

import numpy as np

from src.config.settings import get_settings
from src.embeddings.embedder import embed_texts
from src.utils.io_utils import load_social_reference
from src.utils.math_utils import cosine_similarity


@lru_cache(maxsize=1)
def _reference_vector() -> np.ndarray:
    settings = get_settings()
    sentences = load_social_reference(settings.paths.social_reference_yaml)
    embeddings = embed_texts(sentences)
    if not embeddings:
        raise ValueError("Unable to embed social reference sentences.")
    return np.mean(np.array(embeddings), axis=0)


def compute_social_penalty(vector: np.ndarray, eps: float = 1e-8) -> float:
    reference = _reference_vector()
    similarity = max(cosine_similarity(vector, reference, eps), eps)
    return 1.0 / similarity

