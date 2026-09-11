import { useState } from 'react';
import type { UnsplashCollection } from '../../types/unsplash';
import { getSafeStorageItem, setSafeStorageItem, removeSafeStorageItem } from '../../utils/storage';

export type MatteColor = 'auto' | 'white' | 'black';
export type PhotoFitMode = 'cover' | 'contain';
export type PhotoDisplayStyle = 'cover' | 'cinema' | 'frame';

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

const STORAGE_KEY_INTERVAL = 'photoclock_update_interval';
const STORAGE_KEY_COLLECTION = 'photoclock_selected_collection';
const STORAGE_KEY_CINEMATIC = 'photoclock_cinematic_motion';
const STORAGE_KEY_TOPIC = 'photoclock_selected_topic';
const STORAGE_KEY_GALLERY_MATTE = 'photoclock_gallery_matte_enabled';
const STORAGE_KEY_MATTE_COLOR = 'photoclock_gallery_matte_color';
const STORAGE_KEY_PHOTO_FIT = 'photoclock_photo_fit_mode';
const STORAGE_KEY_DISPLAY_STYLE = 'photoclock_photo_display_style';
const STORAGE_KEY_SUN_MOOD = 'photoclock_sun_mood_enabled';
const STORAGE_KEY_NIGHT_DIMMING = 'photoclock_night_dimming_enabled';

/**
 * 写真の取得間隔・トピック・コレクション・表示スタイル（全画面/シネマ/額装）・環境演出（太陽光連動/減光）の設定フック
 */
export function useDisplaySettings() {
  const [updateIntervalTime, setUpdateIntervalTimeState] = useState<number>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_INTERVAL);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 300;
  });

  const [selectedCollection, setSelectedCollectionState] = useState<UnsplashCollection | null>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_COLLECTION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [isCinematicMotionEnabled, setIsCinematicMotionEnabledState] = useState<boolean>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_CINEMATIC);
    if (saved !== null) {
      return saved === 'true';
    }
    return true;
  });

  const [selectedTopic, setSelectedTopicState] = useState<string>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_TOPIC);
    if (saved) return saved;
    return 'wallpapers';
  });

  const [photoDisplayStyle, setPhotoDisplayStyleState] = useState<PhotoDisplayStyle>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_DISPLAY_STYLE);
    if (saved === 'cover' || saved === 'cinema' || saved === 'frame') {
      return saved;
    }
    // 過去の設定キーからの自動移行
    const legacyMatte = getSafeStorageItem(STORAGE_KEY_GALLERY_MATTE);
    if (legacyMatte === 'true') return 'frame';
    const legacyFit = getSafeStorageItem(STORAGE_KEY_PHOTO_FIT);
    if (legacyFit === 'contain') return 'cinema';
    return 'cover';
  });

  const [matteColor, setMatteColorState] = useState<MatteColor>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_MATTE_COLOR);
    if (saved === 'auto' || saved === 'white' || saved === 'black') {
      return saved;
    }
    return 'auto';
  });

  const [isSunMoodEnabled, setIsSunMoodEnabledState] = useState<boolean>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_SUN_MOOD);
    if (saved !== null) {
      return saved === 'true';
    }
    return true;
  });

  const [isNightDimmingEnabled, setIsNightDimmingEnabledState] = useState<boolean>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_NIGHT_DIMMING);
    if (saved !== null) {
      return saved === 'true';
    }
    return true;
  });

  const setUpdateIntervalTime = (seconds: number) => {
    setUpdateIntervalTimeState(seconds);
    setSafeStorageItem(STORAGE_KEY_INTERVAL, String(seconds));
  };

  const setSelectedCollection = (collection: UnsplashCollection | null) => {
    setSelectedCollectionState(collection);
    if (collection) {
      setSafeStorageItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
    } else {
      removeSafeStorageItem(STORAGE_KEY_COLLECTION);
    }
  };

  const setIsCinematicMotionEnabled = (enabled: boolean) => {
    setIsCinematicMotionEnabledState(enabled);
    setSafeStorageItem(STORAGE_KEY_CINEMATIC, String(enabled));
  };

  const setSelectedTopic = (topic: string) => {
    setSelectedTopicState(topic);
    setSafeStorageItem(STORAGE_KEY_TOPIC, topic);
    if (selectedCollection) {
      setSelectedCollection(null);
    }
  };

  const setPhotoDisplayStyle = (style: PhotoDisplayStyle) => {
    setPhotoDisplayStyleState(style);
    setSafeStorageItem(STORAGE_KEY_DISPLAY_STYLE, style);
    setSafeStorageItem(STORAGE_KEY_GALLERY_MATTE, String(style === 'frame'));
    setSafeStorageItem(STORAGE_KEY_PHOTO_FIT, style === 'cover' ? 'cover' : 'contain');
  };

  const setIsGalleryMatteEnabled = (enabled: boolean) => {
    setPhotoDisplayStyle(enabled ? 'frame' : 'cover');
  };

  const setMatteColor = (color: MatteColor) => {
    setMatteColorState(color);
    setSafeStorageItem(STORAGE_KEY_MATTE_COLOR, color);
  };

  const setPhotoFitMode = (mode: PhotoFitMode) => {
    setPhotoDisplayStyle(mode === 'cover' ? 'cover' : 'cinema');
  };

  const setIsSunMoodEnabled = (enabled: boolean) => {
    setIsSunMoodEnabledState(enabled);
    setSafeStorageItem(STORAGE_KEY_SUN_MOOD, String(enabled));
  };

  const setIsNightDimmingEnabled = (enabled: boolean) => {
    setIsNightDimmingEnabledState(enabled);
    setSafeStorageItem(STORAGE_KEY_NIGHT_DIMMING, String(enabled));
  };

  return {
    updateIntervalTime,
    setUpdateIntervalTime,
    selectedCollection,
    setSelectedCollection,
    isCinematicMotionEnabled,
    setIsCinematicMotionEnabled,
    selectedTopic,
    setSelectedTopic,
    photoDisplayStyle,
    setPhotoDisplayStyle,
    isGalleryMatteEnabled: photoDisplayStyle === 'frame',
    setIsGalleryMatteEnabled,
    matteColor,
    setMatteColor,
    photoFitMode: photoDisplayStyle === 'cover' ? 'cover' : 'contain',
    setPhotoFitMode,
    isSunMoodEnabled,
    setIsSunMoodEnabled,
    isNightDimmingEnabled,
    setIsNightDimmingEnabled,
  };
}
