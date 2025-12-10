import { useLanguage } from '../hooks/useLanguage';

export default function HeaderBar() {
    const { t } = useLanguage();

    return (
        <header className="w-full py-6 px-4 sm:px-8 flex items-center justify-between backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    ForcePath
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                    Social Trajectory Simulator
                </p>
            </div>
            {/* Language toggle is injected via App layout or separate component */}
        </header>
    );
}
