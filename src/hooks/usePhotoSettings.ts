import { useClockSettings } from './settings/useClockSettings';
import { useLanguageSettings } from './settings/useLanguageSettings';
import { useDisplaySettings } from './settings/useDisplaySettings';

export * from './settings/useClockSettings';
export * from './settings/useLanguageSettings';
export * from './settings/useDisplaySettings';

/**
 * 写真、時計、言語、演出などの全設定を統括する合成フック。
 * 内部で useClockSettings, useLanguageSettings, useDisplaySettings に責務分割されている。
 */
export function usePhotoSettings() {
  const clock = useClockSettings();
  const language = useLanguageSettings();
  const display = useDisplaySettings();

  return {
    ...display,
    ...clock,
    ...language,
  };
}
