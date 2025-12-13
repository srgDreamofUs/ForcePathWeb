import { useState } from 'react';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import LanguageToggle from './components/LanguageToggle';
import InputPanel from './components/InputPanel';
import StepCard from './components/StepCard';
import TrajectoryOverview from './components/TrajectoryOverview';
import StabilityGraph from './components/StabilityGraph';
import { useSimulation } from './hooks/useSimulation';
import { useTrajectorySummary } from './hooks/useTrajectorySummary';

function AppContent() {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [steps, setSteps] = useState(3);

  const { results, isRunning, error, run } = useSimulation();
  const { summary, isLoading: isSummaryLoading, error: summaryError } = useTrajectorySummary(results, inputText);

  const handleRunSimulation = () => {
    if (!inputText.trim()) return;
    run({ sentence: inputText, steps });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-900 font-sans selection:bg-purple-200">
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        fontSize: '12px',
        opacity: 0.4
      }}>
        DEPLOY VERIFY — REMOVE AFTER CONFIRMATION
      </div>
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              {t.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              {t.subtitle}
            </p>
          </div>
          <LanguageToggle />
        </div>

        <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
          <InputPanel
            inputText={inputText}
            onInputChange={setInputText}
            steps={steps}
            onStepsChange={setSteps}
            onRunSimulation={handleRunSimulation}
            isRunning={isRunning}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50/80 border border-red-200 text-red-600 rounded-2xl text-center backdrop-blur-sm animate-fadeInUp">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-12 space-y-8">
              <TrajectoryOverview
                summary={summary}
                isLoading={isSummaryLoading}
                error={summaryError}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, idx) => (
                  <StepCard
                    key={idx}
                    step={result.step}
                    summary={result.summary}
                    delay={idx * 150}
                  />
                ))}
              </div>

              <StabilityGraph
                results={results}
                inputHeight={results[0]?.current_height ? results[0].current_height * 1.2 : 1}
              />
            </div>
          )}
        </main>

        <footer className="py-8 text-center text-slate-500 text-sm font-medium border-t border-white/20 bg-white/10 backdrop-blur-sm">
          <p>{t.footer}</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
