import numpy as np
import pytest

from src.decoder.force_summary import summarize_forces
from src.decoder.future_decoder import FutureDecoder


def test_summarize_forces_orders_scores():
    summary = summarize_forces({"a": 1.0, "b": 2.0, "c": 0.5})
    assert "b" in summary.split(":")[1]


def test_future_decoder_uses_template(monkeypatch):
    class DummyRetriever:
        def find(self, vector, top_k: int = 3):
            return [("context sentence", 0.9)]

    monkeypatch.setattr(
        "src.decoder.future_decoder.get_default_retriever",
        lambda: DummyRetriever(),
    )
    decoder = FutureDecoder(template_path=None)
    result = decoder.decode({"a": 2.0, "b": 1.0}, np.zeros(2))
    assert "Dominant forces" in result["summary"]
    assert "- context sentence" in result["summary"]

