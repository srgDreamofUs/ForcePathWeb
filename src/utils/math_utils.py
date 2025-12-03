from __future__ import annotations

import numpy as np


def normalize(vector: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector
    return vector / norm


def cosine_similarity(a: np.ndarray, b: np.ndarray, eps: float = 1e-8) -> float:
    denom = max(np.linalg.norm(a) * np.linalg.norm(b), eps)
    return float(np.dot(a, b) / denom)

