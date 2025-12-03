import os
from typing import Iterable, List, Sequence

from openai import NotFoundError, OpenAI

DEFAULT_EMBED_MODEL = "text-embedding-4"
FALLBACK_MODELS = [
    DEFAULT_EMBED_MODEL,
    "text-embedding-4-large",
    "text-embedding-3-large",
    "text-embedding-3-small",
]


class EmbeddingClient:
    """
    Simple embedding wrapper.

    - Default model is GPT-4o series embedding (`text-embedding-4`)
    - Can be overridden via `OPENAI_EMBED_MODEL` environment variable
    - Input must be a sequence of strings (list, tuple, etc.)
    """

    def __init__(self, model_name: str | None = None) -> None:
        selected_model = model_name or os.getenv(
            "OPENAI_EMBED_MODEL", DEFAULT_EMBED_MODEL
        )
        self.model_candidates = [
            selected_model,
            *[m for m in FALLBACK_MODELS if m != selected_model],
        ]
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def embed(self, texts: Sequence[str]) -> List[List[float]]:
        if not isinstance(texts, Iterable):
            raise TypeError("texts must be an iterable of strings")

        text_list = [str(t) for t in texts if str(t).strip()]
        if not text_list:
            return []

        last_error: Exception | None = None
        for model_name in self.model_candidates:
            try:
                response = self.client.embeddings.create(
                    model=model_name,
                    input=text_list,
                )
                self.model_name = model_name
                return [item.embedding for item in response.data]
            except NotFoundError as err:
                last_error = err
                continue

        if last_error:
            raise last_error
        raise RuntimeError("Embedding failed without a specific error.")


_default_client = EmbeddingClient()


def embed_texts(texts: Sequence[str]) -> List[List[float]]:
    """
    Convenience function. Returns list using default client.
    """

    return _default_client.embed(texts)

