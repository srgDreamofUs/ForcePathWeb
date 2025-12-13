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


// Jelly Motion Constants exported for reuse if needed, or kept internal
// ...

const EXAMPLE_PROMPTS = [
  {
    id: 'mercantilist',
    label: { en: 'Late European Mercantilist Society', ko: '후기 유럽 중상주의 사회' },
    text: {
      en: 'A society in which the state centralizes power to accumulate wealth through trade surpluses, regulates markets to favor domestic producers, and expands colonial networks to secure resources. Economic growth is prioritized over individual freedom, creating rising class stratification, geopolitical competition, and internal pressure for systemic transformation.',
      ko: '국가는 무역 흑자를 통해 부를 축적하기 위해 권력을 중앙집중화하고, 국내 생산자를 보호하기 위해 시장을 규제하며, 자원 확보를 위해 식민지 네트워크를 확장하는 사회이다. 개인의 자유보다 경제 성장이 우선시되며, 그 결과 계층 분화의 심화, 지정학적 경쟁, 그리고 체제 전환을 요구하는 내부 압력이 축적된다.'
    }
  },
  {
    id: 'socialist',
    label: { en: 'Late Cold War State-Socialist Society', ko: '냉전기 후기 국가사회주의 사회' },
    text: {
      en: 'A society where the state controls the means of production in pursuit of equality and social stability, while increasing bureaucratic rigidity, information asymmetry, and declining economic efficiency accumulate over time. The tension between ideological cohesion and structural stagnation shapes uncertain future trajectories.',
      ko: '국가는 평등과 사회적 안정을 목표로 생산수단을 통제하지만, 시간이 지남에 따라 관료적 경직성, 정보 비대칭, 경제 효율성 저하가 누적되는 사회이다. 이념적 결속과 구조적 정체 사이의 긴장이 불확실한 미래 경로를 형성한다.'
    }
  },
  {
    id: 'digital',
    label: { en: 'Contemporary Global Digital-Capitalist Society', ko: '현대 글로벌 디지털 자본주의 사회' },
    text: {
      en: 'A society shaped by globalized digital capitalism, where technological platforms mediate economic activity, social interaction, and information flows. Market efficiency and innovation are prioritized, while wealth concentration, algorithmic influence, and social polarization intensify, generating structural tension between connectivity, autonomy, and long-term stability.',
      ko: '글로벌 디지털 자본주의에 의해 형성된 사회로, 기술 플랫폼이 경제 활동과 사회적 상호작용, 정보 흐름을 매개한다. 시장 효율성과 혁신이 우선시되는 가운데, 부의 집중, 알고리즘의 영향력, 사회적 양극화가 심화되며 연결성, 개인의 자율성, 장기적 안정성 사이의 구조적 긴장이 발생한다.'
    }
  }
];

export default function InputPanel({
  inputText,
  onInputChange,
  steps,
  onStepsChange,
  onRunSimulation,
  isRunning
}: InputPanelProps) {
  const { t, language } = useLanguage();

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

        {/* Historical Example Prompts Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <motion.button
              key={prompt.id}
              onClick={() => onInputChange(prompt.text[language])}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-white/20 shadow-sm text-left transition-colors relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-xs font-semibold text-slate-700/90 leading-tight block">
                {prompt.label[language]}
              </span>
            </motion.button>
          ))}
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
              whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 15 } }}
              whileTap={{ scale: 0.95, transition: { type: "spring", stiffness: 500, damping: 10 } }}
            >
              <select
                value={steps}
                onChange={(e) => onStepsChange(Number(e.target.value))}
                className="appearance-none w-full md:w-64 border border-white/40 rounded-xl px-4 py-3 pr-10 text-slate-800 font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300/20 cursor-pointer shadow-sm transition-colors"
                style={{
                  // Subtle Pastel Jelly Gradient (Airy, light diffraction)
                  background: 'radial-gradient(100% 180% at 50% 0%, rgba(232, 240, 255, 0.8) 0%, rgba(240, 230, 255, 0.4) 100%)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.6)'
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

            // 1. Initial Press (Squash)
            whileTap={{
              scale: 0.92,
              scaleY: 0.88, // Strong squash
              scaleX: 1.05, // Bulge out
              transition: { type: "spring", stiffness: 520, damping: 18, mass: 0.8 }
            }}

            // 2. Rebound + Predicting State (Wobble)
            animate={isRunning ? {
              scale: [1, 1.02, 0.98, 1], // Subtle wobble
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 16,
                mass: 1.1,
                repeat: Infinity,
                repeatType: "mirror",
                repeatDelay: 0.1
              }
            } : {
              // Return to normal
              scale: 1,
              transition: { type: "spring", stiffness: 420, damping: 14, mass: 0.9 }
            }}

            whileHover={!isRunning ? {
              scale: 1.05,
              filter: "brightness(1.05)",
              transition: { type: "spring", stiffness: 400, damping: 12 }
            } : {}}

            className={`
              relative overflow-hidden px-10 py-4 rounded-full font-bold text-white shadow-lg
              w-full md:w-auto
              disabled:cursor-not-allowed
            `}
            style={{
              // Pastel Glass Jelly Gradient (Harmonized Blue/Purple)
              background: 'radial-gradient(140% 140% at 50% 10%, #A5B4FC 0%, #818CF8 40%, #6366F1 100%)',

              // Thick, glass-jelly shadow/highlight stack (Softer than before)
              boxShadow: `
                    inset 0 3px 6px rgba(255,255,255,0.4), 
                    inset 0 -3px 6px rgba(0,0,0,0.1),
                    0 8px 20px rgba(99, 102, 241, 0.3),
                    0 10px 0 rgba(99, 102, 241, 0.1)
                `,
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {/* Glossy shine on top half */}
            <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none" />

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
