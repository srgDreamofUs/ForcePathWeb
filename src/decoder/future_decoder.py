from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List

from openai import OpenAI

from src.decoder.force_summary import explain_direction, summarize_forces
from src.decoder.nearest_context import get_default_retriever

DEFAULT_SYSTEM_PROMPT = """You are a social dynamics expert.
Your task is to describe the future state of a society based on the provided "forces" and "context cues".
The description must be:
1. Concrete and specific (avoid abstract or vague terms).
2. Based on the dominant forces and the nearest historical/social contexts provided.
3. A coherent paragraph describing the structural changes in society.
"""

USER_PROMPT_TEMPLATE = """
Current Dominant Forces:
{forces}

Trajectory Direction:
{direction}

Nearest Context Cues (Reference):
{contexts}

Based on these, describe the specific social structure and daily life in this future society.
"""


class FutureDecoder:
    def __init__(self, template_path: Path | None = None) -> None:
        # Template path is kept for backward compatibility signature, but we use LLM now.
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.retriever = get_default_retriever()

    def decode(self, force_scores: Dict[str, float], vector) -> Dict[str, List[str] | str]:
        contexts = self.retriever.find(vector, top_k=5)
        context_lines = [f"- {sentence} (sim {score:.2f})" for sentence, score in contexts]
        
        forces_summary = summarize_forces(force_scores, top_k=3)
        direction_summary = explain_direction(force_scores)
        
        user_content = USER_PROMPT_TEMPLATE.format(
            forces=forces_summary,
            direction=direction_summary,
            contexts="\n".join(context_lines),
        )

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": DEFAULT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.7,
            )
            description = response.choices[0].message.content.strip()
        except Exception as e:
            description = f"(Error generating description: {e})"

        return {"summary": description, "contexts": context_lines}

