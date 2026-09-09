import { useMemo } from 'react';
import type { LanguageMode, ResolvedLanguage, TranslationKey } from '../locales';
import { dictionaries, resolveLanguage, getTranslation } from '../locales';

export function useTranslation(languageMode: LanguageMode = 'auto') {
  const resolvedLanguage: ResolvedLanguage = useMemo(() => {
    return resolveLanguage(languageMode);
  }, [languageMode]);

  const dict = dictionaries[resolvedLanguage];

  const t = useMemo(() => {
    return (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      return getTranslation(dict, key, params);
    };
  }, [dict]);

  return {
    t,
    resolvedLanguage,
  };
}
