import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface StepCardProps {
  step: number;
  summary: string;
  delay: number;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function StepCard({ step, summary, delay }: StepCardProps) {
  const { language, t } = useLanguage();
  const [translatedSummary, setTranslatedSummary] = useState<string>(summary);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // If language is English, use original summary
    if (language === 'en') {
      setTranslatedSummary(summary);
      return;
    }

    // If language is Korean, translate
    const translate = async () => {
      setIsTranslating(true);
      try {
        if (!OPENAI_API_KEY) {
          setTranslatedSummary(summary + " (API Key missing for translation)");
          return;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: "Translate the following social simulation summary into natural, professional Korean." },
              { role: 'user', content: summary }
            ],
            temperature: 0.3
          })
        });

        if (response.ok) {
          const data = await response.json();
          setTranslatedSummary(data.choices[0].message.content);
        } else {
          setTranslatedSummary(summary); // Fallback
        }
      } catch (e) {
        console.error("Translation failed", e);
        setTranslatedSummary(summary);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [summary, language]);

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