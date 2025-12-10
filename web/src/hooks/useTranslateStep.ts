import { useState, useEffect } from 'react'

interface TranslationResult {
    translatedSummary: string
    isTranslating: boolean
    error: string | null
}

export function useTranslateStep(
    originalSummary: string,
    language: 'en' | 'ko',
    apiKey?: string
): TranslationResult {
    const [translatedSummary, setTranslatedSummary] = useState(originalSummary)
    const [isTranslating, setIsTranslating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!originalSummary || language === 'en') {
            setTranslatedSummary(originalSummary)
            return
        }

        const translateSummary = async () => {
            setIsTranslating(true)
            setError(null)

            try {
                const openaiApiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY

                if (!openaiApiKey) {
                    setTranslatedSummary(originalSummary)
                    setIsTranslating(false)
                    return
                }

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openaiApiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional translator. Translate the following text into natural, fluent Korean. Maintain the meaning and tone. Output only the Korean translation, nothing else.'
                            },
                            {
                                role: 'user',
                                content: originalSummary
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 500
                    })
                })

                if (!response.ok) {
                    throw new Error('Translation failed')
                }

                const data = await response.json()
                const translation = data.choices?.[0]?.message?.content || originalSummary

                setTranslatedSummary(translation)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Translation error')
                setTranslatedSummary(originalSummary)
            } finally {
                setIsTranslating(false)
            }
        }

        translateSummary()
    }, [originalSummary, language, apiKey])

    return { translatedSummary, isTranslating, error }
}
