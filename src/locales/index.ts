import { en } from './en';
import { ja } from './ja';
import type { LanguageMode, ResolvedLanguage, TranslationDictionary } from './types';

export * from './types';
export { en, ja };

export const dictionaries: Record<ResolvedLanguage, TranslationDictionary> = {
  en,
  ja,
};

/**
 * ブラウザ環境等から実効言語（en または ja）を解決する
 */
export function resolveLanguage(mode: LanguageMode): ResolvedLanguage {
  if (mode === 'en' || mode === 'ja') {
    return mode;
  }
  // auto: ブラウザの言語設定を確認
  if (typeof navigator !== 'undefined' && navigator.language) {
    if (navigator.language.toLowerCase().startsWith('ja')) {
      return 'ja';
    }
  }
  return 'en';
}

/**
 * ドット区切りのキーパスから辞書文字列を取得し、パラメータを埋め込む
 */
export function getTranslation(
  dict: TranslationDictionary,
  path: string,
  params?: Record<string, string | number>
): string {
  const keys = path.split('.');
  let current: any = dict;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Translation key not found: ${path}`);
      return path;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  if (params) {
    return Object.entries(params).reduce((acc, [k, v]) => {
      return acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }, current);
  }

  return current;
}
