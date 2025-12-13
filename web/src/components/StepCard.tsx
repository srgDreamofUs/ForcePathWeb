import { useLanguage } from '../hooks/useLanguage';
import { useTranslateStep } from '../hooks/useTranslateStep';
import { motion } from 'framer-motion';

interface StepCardProps {
  step: number;
  summary: string;
  delay: number;
}

export default function StepCard({ step, summary, delay }: StepCardProps) {
  const { language, t } = useLanguage();
  const { translatedSummary, isTranslating } = useTranslateStep(summary, language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: 1.02,
        rotate: Math.random() > 0.5 ? 0.5 : -0.5, // Subtle random tilt
        transition: { type: "spring", stiffness: 300, damping: 12 }
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: delay / 1000
      }}
      className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.05),_inset_0_0_32px_rgba(255,255,255,0.05)] p-6 relative overflow-hidden group"
    >
      {/* Glossy top highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/30 text-slate-800 font-bold text-sm shadow-sm border border-white/20">
          {step}
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          {t.step} {step}
        </h3>
      </div>

      <div className="text-slate-700 leading-relaxed min-h-[80px] relative z-10 font-medium">
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
    </motion.div>
  );
}