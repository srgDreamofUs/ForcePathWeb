import { useLanguage } from '../hooks/useLanguage';

interface TrajectoryOverviewProps {
    summary: string;
    isLoading: boolean;
    error: string | null;
}

export default function TrajectoryOverview({ summary, isLoading, error }: TrajectoryOverviewProps) {
    const { t } = useLanguage();

    if (!summary && !isLoading && !error) return null;

    return (
        <div className="w-full rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_rgba(31,38,135,0.10)] p-6 sm:p-8 mb-8 transition-all duration-300 hover:scale-[1.01] hover:bg-white/30 hover:shadow-xl animate-fadeInUp">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">{t.predictionOverview}</h2>
                <p className="text-sm text-slate-600">{t.predictionOverviewSubtitle}</p>
            </div>

            <div className="bg-white/30 rounded-2xl p-6 border border-white/20">
                {isLoading ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-slate-400/20 rounded w-full"></div>
                        <div className="h-4 bg-slate-400/20 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-400/20 rounded w-4/5"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : (
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {summary}
                    </p>
                )}
            </div>
        </div>
    );
}
