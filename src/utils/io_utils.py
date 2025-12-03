from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Iterable, List

import numpy as np
import yaml


def ensure_directory(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def load_yaml(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_force_definitions(force_yaml: Path) -> dict:
    if not force_yaml.exists():
        raise FileNotFoundError(f"Force definition file not found: {force_yaml}")
    data = load_yaml(force_yaml)
    return data.get("forces", data)


def load_force_weights(path: Path) -> Dict[str, float]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_force_vectors(path: Path, vectors: Dict[str, List[float]]) -> None:
    ensure_directory(path.parent)
    np.save(path, vectors)


def load_force_vectors(path: Path) -> Dict[str, np.ndarray]:
    if not path.exists():
        raise FileNotFoundError(f"Force vector cache missing: {path}")
    data = np.load(path, allow_pickle=True).item()
    return {k: np.array(v) for k, v in data.items()}


def load_social_reference(path: Path) -> List[str]:
    data = load_yaml(path)
    return data.get("sentences", data.get("reference_sentences", []))


def chunk_iterable(items: Iterable[str], size: int) -> Iterable[List[str]]:
    chunk: List[str] = []
    for item in items:
        chunk.append(item)
        if len(chunk) == size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def append_jsonl(path: Path, records: Iterable[dict]) -> None:
    ensure_directory(path.parent)
    with path.open("a", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False))
            f.write("\n")

