import { useState, useEffect } from 'react';
import { StepResult } from '../api/client';
import { useLanguage } from './useLanguage';



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
                // Prepare payload for backend
                const stepSummaries = results.map(r => ({
                    step: r.step,
                    summary: r.summary
                }));

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/ai/summary`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        input_text: inputText,
                        steps: stepSummaries,
                        language: language
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'Failed to generate summary');
                }

                const data = await response.json();
                setSummary(data.summary);
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
