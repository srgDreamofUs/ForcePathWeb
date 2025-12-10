import { useState, useEffect } from 'react';
import { StepResult } from '../api/client';
import { useLanguage } from './useLanguage';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export function useTrajectorySummary(results: StepResult[], inputText: string) {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    useEffect(() => {
        if (!results || results.length === 0 || !inputText) {
            setSummary('');
            return;
        }

        const generateSummary = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (!OPENAI_API_KEY) {
                    throw new Error('OpenAI API key not configured');
                }

                const systemPrompt = language === 'ko'
                    ? "당신은 사회 변화 궤적을 분석하는 전문가입니다. 입력된 시나리오와 예측된 단계들을 바탕으로 전체적인 변화 양상을 한국어로 요약해주세요. 주요 추세, 긴장 요소, 그리고 안정화 과정을 중심으로 설명하세요."
                    : "You are an expert in analyzing social change trajectories. Based on the input scenario and predicted steps, summarize the overall pattern of change. Focus on major trends, tensions, and stabilization processes.";

                const stepsText = results.map(r => `Step ${r.step}: ${r.summary}`).join('\n');
                const userPrompt = `Input Scenario: "${inputText}"\n\nPredicted Trajectory:\n${stepsText}\n\nPlease provide a concise holistic summary of this trajectory.`;

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 300
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to generate summary');
                }

                const data = await response.json();
                setSummary(data.choices[0].message.content);
            } catch (err) {
                console.error('Summary generation error:', err);
                setError(language === 'ko' ? '요약을 생성할 수 없습니다.' : 'Could not generate summary.');
            } finally {
                setIsLoading(false);
            }
        };

        generateSummary();
    }, [results, inputText, language]);

    return { summary, isLoading, error };
}
