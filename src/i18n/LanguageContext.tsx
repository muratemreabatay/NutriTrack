import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import tr from './tr';
import en from './en';
import type { TranslationKeys } from './tr';

export type Language = 'tr' | 'en';

const translations: Record<Language, TranslationKeys> = { tr, en };

type LanguageContextType = {
    lang: Language;
    t: TranslationKeys;
    setLanguage: (lang: Language) => void;
    isFirstLaunch: boolean;
    completeFirstLaunch: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    t: en,
    setLanguage: () => { },
    isFirstLaunch: false,
    completeFirstLaunch: () => { },
});

const STORAGE_KEY = '@nutritrack_language';

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState<Language>('en');
    const [ready, setReady] = useState(false);
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved === 'tr' || saved === 'en') {
                    setLang(saved);
                    setIsFirstLaunch(false);
                } else {
                    // No saved language = first launch
                    const locales = getLocales();
                    const deviceLang = locales?.[0]?.languageCode;
                    setLang(deviceLang === 'tr' ? 'tr' : 'en');
                    setIsFirstLaunch(true);
                }
            } catch {
                setLang('en');
            }
            setReady(true);
        })();
    }, []);

    const setLanguage = useCallback((newLang: Language) => {
        setLang(newLang);
        AsyncStorage.setItem(STORAGE_KEY, newLang).catch(() => { });
    }, []);

    const completeFirstLaunch = useCallback((selectedLang: Language) => {
        setLang(selectedLang);
        AsyncStorage.setItem(STORAGE_KEY, selectedLang).catch(() => { });
        setIsFirstLaunch(false);
    }, []);

    const t = translations[lang];

    // Don't render children until language is resolved
    if (!ready) {
        return (
            <View style={{ flex: 1, backgroundColor: '#030712', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="#34D399" />
            </View>
        );
    }

    return (
        <LanguageContext.Provider value={{ lang, t, setLanguage, isFirstLaunch, completeFirstLaunch }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
