import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ChevronDown } from 'lucide-react';

interface InputPanelProps {
  inputText: string;
  onInputChange: (value: string) => void;
  steps: number;
  onStepsChange: (value: number) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

export default function InputPanel({
  inputText,
  onInputChange,
  steps,
  onStepsChange,
  onRunSimulation,
  isRunning
}: InputPanelProps) {
  const { t } = useLanguage();
  const [isJelly, setIsJelly] = useState(false);

  const handleRunClick = () => {
    if (isRunning) return;
    setIsJelly(true);
    setTimeout(() => setIsJelly(false), 500);
    onRunSimulation();
  };

  return (
    <div className="w-full rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_rgba(31,38,135,0.10)] p-6 sm:p-8 transition-all duration-300 hover:scale-[1.01] hover:bg-white/30 hover:shadow-xl">
      <div className="flex flex-col gap-6">
        {/* Text Input */}
        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="w-full h-32 bg-white/40 border border-white/50 rounded-2xl p-4 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white/60 transition-all resize-none shadow-inner"
          />
          <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/20 group-hover:border-white/40 transition-colors" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          {/* Steps Selector */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="text-sm font-medium text-slate-700 ml-1">
              {t.futureStateDepth}
              <span className="block text-xs text-slate-500 font-normal mt-0.5">
                {t.futureStateDepthSub}
              </span>
            </label>
            <div className="relative">
              <select
                value={steps}
                onChange={(e) => onStepsChange(Number(e.target.value))}
                className="appearance-none w-full md:w-64 bg-white/40 border border-white/50 rounded-xl px-4 py-3 pr-10 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/50 cursor-pointer hover:bg-white/50 transition-colors"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} {t.step}{num > 1 ? 's' : ''}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunClick}
            disabled={isRunning}
            className={`
              relative overflow-hidden px-8 py-3.5 rounded-full font-bold text-white shadow-lg
              bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
              hover:shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
              transition-all duration-300 w-full md:w-auto
              ${isJelly ? 'animate-jelly' : ''}
            `}
          >
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.running}
                </>
              ) : (
                <>
                  <span>✨</span>
                  {t.runSimulation}
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
