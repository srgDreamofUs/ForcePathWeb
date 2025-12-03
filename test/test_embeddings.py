import numpy as np

from src.utils.io_utils import chunk_iterable
from src.utils.math_utils import cosine_similarity


def test_chunk_iterable_balances_chunks():
    chunks = list(chunk_iterable([1, 2, 3, 4, 5], 2))
    assert len(chunks) == 3
    assert chunks[-1] == [5]


def test_cosine_similarity_between_identical_vectors():
    a = np.array([1.0, 0.0])
    b = np.array([1.0, 0.0])
    assert np.isclose(cosine_similarity(a, b), 1.0)

