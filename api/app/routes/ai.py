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

def get_openai_client() -> OpenAI:
    """
    Lazy initialization of OpenAI client.
    Critically important for Render where env vars might not be ready at import time.
    """
    # Try settings first
    api_key = settings.openai_api_key
    
    # Fallback to direct env var (runtime check)
    if not api_key:
        import os
        api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        logger.error("Attempted to initialize OpenAI client but OPENAI_API_KEY is missing")
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
    return OpenAI(api_key=api_key)


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
    client = get_openai_client()

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
    # If target is English, just return original (assuming input is English)
    if request.target_language == "en":
         return TranslationResponse(translated_text=request.text)

    # Lazy load client - if key is missing, we catch the exception or handle gracefully?
    # Requirement says "if API key missing, return original text to avoid breaking UI" in previous code.
    # But get_openai_client raises HTTPException.
    # Let's handle it here to preserve the "don't break UI" behavior for translation.
    try:
        client = get_openai_client()
    except HTTPException:
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
