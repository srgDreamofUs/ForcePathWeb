"""AI-powered features (Summary, Translation)."""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from openai import OpenAI

from api.app.core.config import get_settings
from api.app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()

# Initialize OpenAI client
client = OpenAI(api_key=settings.openai_api_key)

# Allow override from environment if settings not populated correctly
# (Safety net for local dev vs production env var differences)
if not client.api_key:
    import os
    client.api_key = os.getenv("OPENAI_API_KEY")


class StepSummary(BaseModel):
    step: int
    summary: str

class SummaryRequest(BaseModel):
    input_text: str
    steps: List[StepSummary]
    language: str = "en"

class SummaryResponse(BaseModel):
    summary: str

class TranslationRequest(BaseModel):
    text: str
    target_language: str = "ko"  # Default to Korean

class TranslationResponse(BaseModel):
    translated_text: str


@router.post("/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest) -> SummaryResponse:
    """Generate a holistic summary of the simulation trajectory."""
    if not client.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    try:
        system_prompt = (
            "당신은 사회 변화 궤적을 분석하는 전문가입니다. 입력된 시나리오와 예측된 단계들을 바탕으로 전체적인 변화 양상을 한국어로 요약해주세요. 주요 추세, 긴장 요소, 그리고 안정화 과정을 중심으로 설명하세요."
            if request.language == "ko"
            else "You are an expert in analyzing social change trajectories. Based on the input scenario and predicted steps, summarize the overall pattern of change. Focus on major trends, tensions, and stabilization processes."
        )

        steps_text = "\n".join([f"Step {s.step}: {s.summary}" for s in request.steps])
        user_prompt = f'Input Scenario: "{request.input_text}"\n\nPredicted Trajectory:\n{steps_text}\n\nPlease provide a concise holistic summary of this trajectory.'

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        content = response.choices[0].message.content or ""
        return SummaryResponse(summary=content)

    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest) -> TranslationResponse:
    """Translate text to the target language (default: Korean)."""
    if not client.api_key:
        # If API key missing, return original text to avoid breaking UI
        return TranslationResponse(translated_text=request.text)

    # If target is English, just return original (assuming input is English)
    if request.target_language == "en":
         return TranslationResponse(translated_text=request.text)

    try:
        system_prompt = "You are a professional translator. Translate the following text into natural, fluent Korean. Maintain the meaning and tone. Output only the Korean translation, nothing else."
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.text}
            ],
            temperature=0.3,
            max_tokens=500
        )

        content = response.choices[0].message.content or request.text
        return TranslationResponse(translated_text=content)

    except Exception as e:
        logger.error(f"Translation failed: {e}")
        # Fallback to original text on error
        return TranslationResponse(translated_text=request.text)
