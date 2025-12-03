from __future__ import annotations

from functools import lru_cache
from typing import List, Tuple

import numpy as np

from src.config.settings import get_settings
from src.embeddings.embedder import embed_texts
from src.utils.io_utils import load_force_definitions, load_social_reference
from src.utils.math_utils import cosine_similarity


def _collect_sentences() -> List[str]:
    settings = get_settings()
    force_defs = load_force_definitions(settings.paths.force_yaml)
    sentences: List[str] = []
    for payload in force_defs.values():
        if isinstance(payload, dict):
            sentences.extend(payload.get("sentences", []))
    sentences.extend(load_social_reference(settings.paths.social_reference_yaml))
    return sentences


class NearestContextRetriever:
    def __init__(self) -> None:
        self.sentences = _collect_sentences()
        embeddings = embed_texts(self.sentences)
        self.embeddings = [np.array(vec) for vec in embeddings]

    def find(self, vector: np.ndarray, top_k: int = 3) -> List[Tuple[str, float]]:
        scores: List[Tuple[str, float]] = []
        for sentence, emb in zip(self.sentences, self.embeddings):
            sim = cosine_similarity(vector, emb)
            scores.append((sentence, sim))
        scores.sort(key=lambda item: item[1], reverse=True)
        return scores[:top_k]


@lru_cache(maxsize=1)
def get_default_retriever() -> NearestContextRetriever:
    return NearestContextRetriever()

