import { useLanguage } from '../hooks/useLanguage';

export default function HeaderBar() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <header className="w-full py-6 px-4 sm:px-8 flex items-center justify-between backdrop-blur-md bg-white/70 border-b border-slate-200">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    ForcePath
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                    Social Trajectory Simulator
                </p>
            </div>

            {/* Language Toggle Button */}
            <button
                onClick={toggleLanguage}
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-semibold"
            >
                {language === 'en' ? 'EN' : 'KO'}
            </button>
        </header>
    );
}
