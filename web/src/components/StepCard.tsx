import { useLanguage } from '../hooks/useLanguage';
import { useTranslateStep } from '../hooks/useTranslateStep';

interface StepCardProps {
  step: number;
  summary: string;
  delay: number;
}

export default function StepCard({ step, summary, delay }: StepCardProps) {
  const { language, t } = useLanguage();

  // Use the secure hook for translation
  // The hook handles 'en' logic internally (returns original text)
  const { translatedSummary, isTranslating } = useTranslateStep(summary, language);

  return (
    <div
      className="rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_rgba(31,38,135,0.10)] p-6 transition-all duration-300 hover:scale-[1.01] hover:bg-white/30 hover:shadow-xl animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/40 text-slate-800 font-bold text-sm shadow-sm">
          {step}
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          {t.step} {step}
        </h3>
      </div>

      <div className="text-slate-700 leading-relaxed min-h-[80px]">
        {isTranslating ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-400/20 rounded w-3/4"></div>
            <div className="h-4 bg-slate-400/20 rounded w-full"></div>
            <div className="h-4 bg-slate-400/20 rounded w-5/6"></div>
          </div>
        ) : (
          translatedSummary
        )}
      </div>
    </div>
  );
}