import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  de: { translation: de },
};

// Get saved language from localStorage or default to Turkish
const savedLanguage = localStorage.getItem('app_language') || 'tr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
