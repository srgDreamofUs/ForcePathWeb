import { useLanguage } from '../hooks/useLanguage';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface InputPanelProps {
  inputText: string;
  onInputChange: (value: string) => void;
  steps: number;
  onStepsChange: (value: number) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

// Jelly Motion Constants
const JELLY_SPRING = { type: "spring", stiffness: 400, damping: 12, mass: 0.8 };
const JELLY_HOVER = { scale: 1.03, transition: JELLY_SPRING };
const JELLY_TAP = { scale: 0.92, transition: JELLY_SPRING };

export default function InputPanel({
  inputText,
  onInputChange,
  steps,
  onStepsChange,
  onRunSimulation,
  isRunning
}: InputPanelProps) {
  const { t } = useLanguage();

  // No longer needed: local useState for 'isJelly' since we use Framer Motion

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.05)] p-6 sm:p-8 relative overflow-hidden"
    >
      {/* Subtle internal glow/reflection for 'slab' feel */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_0_40px_rgba(255,255,255,0.1)]" />

      <div className="flex flex-col gap-6 relative z-10">
        {/* Text Input */}
        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="w-full h-32 bg-white/30 border border-white/30 rounded-2xl p-4 text-slate-800 placeholder:text-slate-500/70 focus:outline-none focus:ring-4 focus:ring-purple-300/20 focus:bg-white/50 transition-all resize-none shadow-inner"
          />
          {/* Jelly border highlight */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/10 group-hover:border-white/30 transition-colors" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">

          {/* Steps Selector - Jelly Button Feel */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {t.futureStateDepth}
              <span className="block text-xs text-slate-500 font-normal mt-0.5">
                {t.futureStateDepthSub}
              </span>
            </label>
            <motion.div
              className="relative"
              whileHover={JELLY_HOVER}
              whileTap={JELLY_TAP}
            >
              <select
                value={steps}
                onChange={(e) => onStepsChange(Number(e.target.value))}
                className="appearance-none w-full md:w-64 bg-white/40 border border-white/40 rounded-xl px-4 py-3 pr-10 text-slate-800 font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300/20 cursor-pointer shadow-sm hover:bg-white/60 transition-colors"
                style={{
                  // Fake thickness / depth
                  boxShadow: '0 4px 0 rgba(255,255,255,0.2), 0 8px 16px rgba(0,0,0,0.05)'
                }}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} {t.step}{num > 1 ? 's' : ''}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 pointer-events-none" />
            </motion.div>
          </div>

          {/* Run Button - CRITICAL REDESIGN */}
          <motion.button
            onClick={onRunSimulation}
            disabled={isRunning}
            whileHover={!isRunning ? {
              scale: 1.05,
              filter: "brightness(1.1)",
              transition: { type: "spring", stiffness: 300, damping: 10 }
            } : {}}
            whileTap={!isRunning ? {
              scale: 0.90,
              scaleY: 0.85, // Squish effect
              transition: { type: "spring", stiffness: 500, damping: 15 }
            } : {}}
            className={`
              relative overflow-hidden px-10 py-4 rounded-full font-bold text-white shadow-lg
              w-full md:w-auto
              disabled:opacity-80 disabled:cursor-not-allowed disabled:grayscale-[0.3]
            `}
            style={{
              // Radial Gradient like a jelly candy (center highlight)
              background: 'radial-gradient(120% 120% at 50% 20%, #A855F7 0%, #9333EA 50%, #7E22CE 100%)',
              // Thick, gummy shadow/highlight
              boxShadow: `
                    inset 0 4px 6px rgba(255,255,255,0.4), 
                    inset 0 -4px 6px rgba(0,0,0,0.2),
                    0 8px 20px rgba(126, 34, 206, 0.4),
                    0 12px 0 rgba(126, 34, 206, 0.2)
                `,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Glossy shine on top */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full pointer-events-none" />

            <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md text-lg tracking-wide">
              {isRunning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full"
                  />
                  {t.running}
                </>
              ) : (
                <>
                  <span className="text-xl">✨</span>
                  {t.runSimulation}
                </>
              )}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
