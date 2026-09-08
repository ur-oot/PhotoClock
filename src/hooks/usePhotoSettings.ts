import { useState } from 'react';
import type { UnsplashCollection } from '../types/unsplash';

const STORAGE_KEY_INTERVAL = 'photoclock_update_interval';
const STORAGE_KEY_COLLECTION = 'photoclock_selected_collection';
const STORAGE_KEY_CINEMATIC = 'photoclock_cinematic_motion';

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

  return {
    updateIntervalTime,
    setUpdateIntervalTime,
    selectedCollection,
    setSelectedCollection,
    isCinematicMotionEnabled,
    setIsCinematicMotionEnabled,
  };
}
