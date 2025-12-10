import { useLanguage } from '../hooks/useLanguage';

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="relative flex items-center bg-white/30 backdrop-blur-md border border-white/40 rounded-full p-1 shadow-sm transition-all hover:bg-white/40"
        >
            <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${language === 'en'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                EN
            </div>
            <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${language === 'ko'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                KR
            </div>
        </button>
    );
}
