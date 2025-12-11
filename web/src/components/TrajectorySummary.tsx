import { Translation } from '../i18n/en'

interface TrajectorySummaryProps {
    summary: string
    isLoading: boolean
    error: string | null
    t: Translation
}

const shimmerLayer =
    "relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:animate-shimmer before:bg-[linear-gradient(110deg,rgba(255,255,255,0),rgba(255,255,255,0.65),rgba(255,255,255,0))] before:bg-[length:200%_100%]"

export default function TrajectorySummary({ summary, isLoading, error, t }: TrajectorySummaryProps) {
    if (!summary && !isLoading && !error) return null

    return (
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 shadow-lg p-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-white/15 to-white/5" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/65 to-transparent" />

            <div className="relative flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-slate-800">{t.predictionOverview}</h3>
                    <p className="text-[12px] text-slate-500">{t.predictionOverviewSubtitle}</p>
                </div>

                {isLoading && (
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

                {summary && !isLoading && (
                    <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line py-1">
                        {summary}
                    </div>
                )}
            </div>
        </div>
    )
}
