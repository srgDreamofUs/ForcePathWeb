import { Translation } from '../i18n/en'
import { useTranslateStep } from '../hooks/useTranslateStep'

interface PredictionOverviewProps {
    summary: string
    isLoading: boolean
    error: string | null
    t: Translation
    language: 'en' | 'ko'
}

const shimmerLayer =
    "relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:animate-shimmer before:bg-[linear-gradient(110deg,rgba(255,255,255,0),rgba(255,255,255,0.65),rgba(255,255,255,0))] before:bg-[length:200%_100%]"

export default function PredictionOverview({ summary, isLoading, error, t, language }: PredictionOverviewProps) {
    const { translatedSummary, isTranslating } = useTranslateStep(summary, language)

    if (!summary && !isLoading && !error) return null

    return (
        <div className="relative w-full overflow-hidden rounded-4xl backdrop-blur-2xl bg-white/30 border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.10),inset_0_0_30px_rgba(255,255,255,0.25)] p-8 transition-all duration-300 hover:scale-[1.01] hover:bg-white/40 hover:shadow-glass-hover animate-fadeInUp ring-1 ring-white/40">
            <div className="absolute inset-0 rounded-4xl bg-gradient-to-br from-white/50 via-white/20 to-white/10" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

            <div className="relative flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <h3 className="text-lg font-bold text-slate-900">{t.predictionOverview}</h3>
                    <p className="text-sm text-slate-600">{t.predictionOverviewSubtitle}</p>
                </div>

                {(isLoading || isTranslating) && (
                    <div className="flex flex-col gap-3 py-2">
                        <div className={`h-4 rounded-lg bg-white/60 ${shimmerLayer}`} />
                        <div className={`h-4 rounded-lg bg-white/60 ${shimmerLayer}`} />
                        <div className={`h-4 rounded-lg bg-white/60 ${shimmerLayer}`} />
                        <div className={`h-4 w-3/4 rounded-lg bg-white/60 ${shimmerLayer}`} />
                    </div>
                )}

                {error && (
                    <div className="text-sm text-red-600 py-2">
                        {error}
                    </div>
                )}

                {summary && !isLoading && !isTranslating && (
                    <div className="text-base leading-relaxed text-gray-800 whitespace-pre-line py-1">
                        {translatedSummary}
                    </div>
                )}
            </div>
        </div>
    )
}
