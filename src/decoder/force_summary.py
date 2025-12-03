from __future__ import annotations

from typing import Dict, List, Tuple


def _top_forces(force_scores: Dict[str, float], top_k: int = 3) -> List[Tuple[str, float]]:
    return sorted(force_scores.items(), key=lambda item: item[1], reverse=True)[:top_k]


def summarize_forces(force_scores: Dict[str, float], top_k: int = 3) -> str:
    top = _top_forces(force_scores, top_k)
    phrases = [
        f"{name} (score {score:.2f})"
        for name, score in top
    ]
    return "Dominant forces: " + ", ".join(phrases)


def explain_direction(force_scores: Dict[str, float]) -> str:
    strongest = max(force_scores, key=force_scores.get)
    return f"Trajectory leans toward the {strongest} axis."

