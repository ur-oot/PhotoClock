import { useState } from 'react';
import type { UnsplashCollection } from '../types/unsplash';
import type { LanguageMode, ClockLanguageMode } from '../locales';
import { resolveLanguage } from '../locales';

export type TimeFormat = '12h' | '24h';
export type TypographyStyle = 'sans' | 'serif' | 'mono';
export type MatteColor = 'auto' | 'white' | 'black';
export type { LanguageMode, ClockLanguageMode };

const STORAGE_KEY_INTERVAL = 'photoclock_update_interval';
const STORAGE_KEY_COLLECTION = 'photoclock_selected_collection';
const STORAGE_KEY_CINEMATIC = 'photoclock_cinematic_motion';
const STORAGE_KEY_TIME_FORMAT = 'photoclock_time_format';
const STORAGE_KEY_TOPIC = 'photoclock_selected_topic';
const STORAGE_KEY_TYPOGRAPHY = 'photoclock_typography_style';
const STORAGE_KEY_GALLERY_MATTE = 'photoclock_gallery_matte_enabled';
const STORAGE_KEY_MATTE_COLOR = 'photoclock_gallery_matte_color';
const STORAGE_KEY_SUN_MOOD = 'photoclock_sun_mood_enabled';
const STORAGE_KEY_NIGHT_DIMMING = 'photoclock_night_dimming_enabled';
const STORAGE_KEY_LANGUAGE = 'photoclock_language';
const STORAGE_KEY_CLOCK_LANGUAGE = 'photoclock_clock_language';

export interface TypographyOption {
  id: TypographyStyle;
  label: string;
  description: string;
  fontClass: string;
  sample: string;
}

export const TYPOGRAPHY_OPTIONS: TypographyOption[] = [
  {
    id: 'sans',
    label: 'Modern Sans',
    description: 'Clean and contemporary',
    fontClass: 'font-sans',
    sample: '12:45',
  },
  {
    id: 'serif',
    label: 'Classic Serif',
    description: 'Elegant and editorial',
    fontClass: 'font-serif',
    sample: '12:45',
  },
  {
    id: 'mono',
    label: 'Monospace',
    description: 'Minimal and structured',
    fontClass: 'font-mono',
    sample: '12:45',
  },
];

export interface IntervalOption {
  label: string;
  code: number;
}

export const INTERVAL_OPTIONS: IntervalOption[] = [
  { label: 'Every 3 minutes', code: 180 },
  { label: 'Every 5 minutes (default)', code: 300 },
  { label: 'Every 15 minutes', code: 900 },
  { label: 'Every 30 minutes', code: 1800 },
  { label: 'Every 45 minutes', code: 2700 },
  { label: 'Every hour', code: 3600 },
];

export function usePhotoSettings() {
  const [updateIntervalTime, setUpdateIntervalTimeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INTERVAL);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // localStorage read error fallback
    }
    return 300;
  });

  const [selectedCollection, setSelectedCollectionState] = useState<UnsplashCollection | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLLECTION);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // localStorage read error fallback
    }
    return null;
  });

  const [isCinematicMotionEnabled, setIsCinematicMotionEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CINEMATIC);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // デフォルトは有効
  });

  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIME_FORMAT);
      if (saved === '12h' || saved === '24h') {
        return saved;
      }
    } catch {
      // ignore
    }
    return '12h';
  });

  const [selectedTopic, setSelectedTopicState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOPIC);
      if (saved) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'wallpapers';
  });

  const [typographyStyle, setTypographyStyleState] = useState<TypographyStyle>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TYPOGRAPHY);
      if (saved === 'sans' || saved === 'serif' || saved === 'mono') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'sans';
  });

  const [isGalleryMatteEnabled, setIsGalleryMatteEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GALLERY_MATTE);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [matteColor, setMatteColorState] = useState<MatteColor>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATTE_COLOR);
      if (saved === 'auto' || saved === 'white' || saved === 'black') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'auto';
  });

  const [isSunMoodEnabled, setIsSunMoodEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUN_MOOD);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // デフォルト: 有効
  });

  const [isNightDimmingEnabled, setIsNightDimmingEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NIGHT_DIMMING);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // デフォルト: 有効
  });

  const [language, setLanguageState] = useState<LanguageMode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const queryLang = params.get('lang');
        if (queryLang === 'en' || queryLang === 'ja') {
          return queryLang;
        }
      }
      const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
      if (saved === 'auto' || saved === 'en' || saved === 'ja') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'auto';
  });

  const [clockLanguage, setClockLanguageState] = useState<ClockLanguageMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLOCK_LANGUAGE);
      if (saved === 'sync' || saved === 'en' || saved === 'ja') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'sync';
  });

  const setUpdateIntervalTime = (seconds: number) => {
    setUpdateIntervalTimeState(seconds);
    try {
      localStorage.setItem(STORAGE_KEY_INTERVAL, String(seconds));
    } catch {
      // ignore
    }
  };

  const setSelectedCollection = (collection: UnsplashCollection | null) => {
    setSelectedCollectionState(collection);
    try {
      if (collection) {
        localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
      } else {
        localStorage.removeItem(STORAGE_KEY_COLLECTION);
      }
    } catch {
      // ignore
    }
  };

  const setIsCinematicMotionEnabled = (enabled: boolean) => {
    setIsCinematicMotionEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_CINEMATIC, String(enabled));
    } catch {
      // ignore
    }
  };

  const setTimeFormat = (format: TimeFormat) => {
    setTimeFormatState(format);
    try {
      localStorage.setItem(STORAGE_KEY_TIME_FORMAT, format);
    } catch {
      // ignore
    }
  };

  const setSelectedTopic = (topic: string) => {
    setSelectedTopicState(topic);
    try {
      localStorage.setItem(STORAGE_KEY_TOPIC, topic);
    } catch {
      // ignore
    }
    // トピックが選ばれたらコレクション指定を解除してトピックを優先
    if (selectedCollection) {
      setSelectedCollection(null);
    }
  };

  const setTypographyStyle = (style: TypographyStyle) => {
    setTypographyStyleState(style);
    try {
      localStorage.setItem(STORAGE_KEY_TYPOGRAPHY, style);
    } catch {
      // ignore
    }
  };

  const setIsGalleryMatteEnabled = (enabled: boolean) => {
    setIsGalleryMatteEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_GALLERY_MATTE, String(enabled));
    } catch {
      // ignore
    }
  };

  const setMatteColor = (color: MatteColor) => {
    setMatteColorState(color);
    try {
      localStorage.setItem(STORAGE_KEY_MATTE_COLOR, color);
    } catch {
      // ignore
    }
  };

  const setIsSunMoodEnabled = (enabled: boolean) => {
    setIsSunMoodEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_SUN_MOOD, String(enabled));
    } catch {
      // ignore
    }
  };

  const setIsNightDimmingEnabled = (enabled: boolean) => {
    setIsNightDimmingEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_NIGHT_DIMMING, String(enabled));
    } catch {
      // ignore
    }
  };

  const setLanguage = (lang: LanguageMode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    } catch {
      // ignore
    }
  };

  const setClockLanguage = (mode: ClockLanguageMode) => {
    setClockLanguageState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_CLOCK_LANGUAGE, mode);
    } catch {
      // ignore
    }
  };

  const resolvedLanguage = resolveLanguage(language);
  const resolvedClockLanguage = clockLanguage === 'sync' ? resolvedLanguage : clockLanguage;

  return {
    updateIntervalTime,
    setUpdateIntervalTime,
    selectedCollection,
    setSelectedCollection,
    isCinematicMotionEnabled,
    setIsCinematicMotionEnabled,
    timeFormat,
    setTimeFormat,
    selectedTopic,
    setSelectedTopic,
    typographyStyle,
    setTypographyStyle,
    isGalleryMatteEnabled,
    setIsGalleryMatteEnabled,
    matteColor,
    setMatteColor,
    isSunMoodEnabled,
    setIsSunMoodEnabled,
    isNightDimmingEnabled,
    setIsNightDimmingEnabled,
    language,
    setLanguage,
    resolvedLanguage,
    clockLanguage,
    setClockLanguage,
    resolvedClockLanguage,
  };
}
