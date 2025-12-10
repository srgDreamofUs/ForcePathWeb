import { useState, createContext, useContext } from 'react';
import { translations, Language } from '../utils/translations';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const toggleLanguage = () => {
        setLanguage(prev => (prev === 'en' ? 'ko' : 'en'));
    };

    const value = {
        language,
        toggleLanguage,
        t: translations[language],
    };

    return (
        <LanguageContext.Provider value= { value } >
        { children }
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
