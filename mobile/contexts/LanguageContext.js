import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const useLanguage = () => {
    return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
    // Default to 'en'
    const [language, setLanguage] = useState('en');

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('appLanguage');
            if (savedLanguage) {
                setLanguage(savedLanguage);
            }
        } catch (error) {
            console.error("Failed to load language", error);
        }
    };

    useEffect(() => {
        loadLanguage();
    }, []);

    const t = (key) => {
        if (!translations[language]) return key;
        return translations[language][key] || key;
    };

    const changeLanguage = async (lang) => {
        try {
            setLanguage(lang);
            await AsyncStorage.setItem('appLanguage', lang);
        } catch (error) {
            console.error("Failed to save language", error);
        }
    };

    const value = {
        language,
        changeLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
