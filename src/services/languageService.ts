import { Language, translations, Translations } from '../translations/translations';

type LanguageListener = (lang: Language) => void;

class LanguageService {
  private currentLanguage: Language = 'ar'; // Default to Arabic as requested, with instant toggle to English
  private listeners: Set<LanguageListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem('aurex_language');
      if (saved === 'ar' || saved === 'en') {
        this.currentLanguage = saved;
      } else {
        // Check browser or telegram language
        const tgLang = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
        const navLang = navigator.language || '';
        if (
          (tgLang && tgLang.toLowerCase().startsWith('en')) ||
          navLang.toLowerCase().startsWith('en')
        ) {
          // If explicitly english environment without arabic preference, can be en, else default ar
          this.currentLanguage = 'ar';
        } else {
          this.currentLanguage = 'ar';
        }
      }
    } catch {
      this.currentLanguage = 'ar';
    }
  }

  public getLanguage(): Language {
    return this.currentLanguage;
  }

  public isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }

  public setLanguage(lang: Language) {
    if (this.currentLanguage === lang) return;
    this.currentLanguage = lang;
    try {
      localStorage.setItem('aurex_language', lang);
    } catch {
      // ignore
    }
    this.notify();
  }

  public toggleLanguage(): Language {
    const nextLang: Language = this.currentLanguage === 'ar' ? 'en' : 'ar';
    this.setLanguage(nextLang);
    return nextLang;
  }

  public t<K extends keyof Translations>(key: K): string {
    const langDict = translations[this.currentLanguage] || translations.en;
    return langDict[key] || translations.en[key] || String(key);
  }

  public subscribe(listener: LanguageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentLanguage);
      } catch (err) {
        console.error('Error in language listener:', err);
      }
    });
  }
}

export const languageService = new LanguageService();
