import { useState } from 'react';
import type { LanguageMode, ClockLanguageMode } from '../../locales';
import { resolveLanguage } from '../../locales';
import { getSafeStorageItem, setSafeStorageItem } from '../../utils/storage';

export type { LanguageMode, ClockLanguageMode };

const STORAGE_KEY_LANGUAGE = 'photoclock_language';
const STORAGE_KEY_CLOCK_LANGUAGE = 'photoclock_clock_language';

/**
 * アプリ全体の表示言語および時計パネルの個別言語設定フック
 */
export function useLanguageSettings() {
  const [language, setLanguageState] = useState<LanguageMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryLang = params.get('lang');
      if (queryLang === 'en' || queryLang === 'ja') {
        return queryLang;
      }
    }
    const saved = getSafeStorageItem(STORAGE_KEY_LANGUAGE);
    if (saved === 'auto' || saved === 'en' || saved === 'ja') {
      return saved;
    }
    return 'auto';
  });

  const [clockLanguage, setClockLanguageState] = useState<ClockLanguageMode>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_CLOCK_LANGUAGE);
    if (saved === 'sync' || saved === 'en' || saved === 'ja') {
      return saved;
    }
    return 'sync';
  });

  const setLanguage = (lang: LanguageMode) => {
    setLanguageState(lang);
    setSafeStorageItem(STORAGE_KEY_LANGUAGE, lang);
  };

  const setClockLanguage = (mode: ClockLanguageMode) => {
    setClockLanguageState(mode);
    setSafeStorageItem(STORAGE_KEY_CLOCK_LANGUAGE, mode);
  };

  const resolvedLanguage = resolveLanguage(language);
  const resolvedClockLanguage = clockLanguage === 'sync' ? resolvedLanguage : clockLanguage;

  return {
    language,
    setLanguage,
    resolvedLanguage,
    clockLanguage,
    setClockLanguage,
    resolvedClockLanguage,
  };
}
