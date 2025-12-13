import { useState, useEffect } from 'react'

interface TranslationResult {
    translatedSummary: string
    isTranslating: boolean
    error: string | null
}

export function useTranslateStep(
    originalSummary: string,
    language: 'en' | 'ko'
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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/ai/translate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: originalSummary,
                        target_language: language
                    })
                })

                if (!response.ok) {
                    throw new Error('Translation failed')
                }

                const data = await response.json()
                setTranslatedSummary(data.translated_text)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Translation error')
                setTranslatedSummary(originalSummary)
            } finally {
                setIsTranslating(false)
            }
        }

        translateSummary()
    }, [originalSummary, language])

    return { translatedSummary, isTranslating, error }
}
