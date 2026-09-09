import { useState, useEffect, useCallback } from 'react';
import {
  ambientSynthesizer,
  type AmbientSoundType,
} from '../utils/ambientSynthesizer';

const STORAGE_KEY_SOUND_TYPE = 'photoclock_ambient_sound_type';
const STORAGE_KEY_VOLUME = 'photoclock_ambient_volume';

export function useAmbientSound() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [soundType, setSoundTypeState] = useState<AmbientSoundType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND_TYPE);
      if (saved === 'rain' || saved === 'waves' || saved === 'campfire' || saved === 'white_noise') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'rain'; // デフォルトは優しい雨音
  });

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return 0.5; // デフォルト50%
  });

  const play = useCallback((type = soundType) => {
    ambientSynthesizer.play(type, volume);
    setIsPlaying(true);
  }, [soundType, volume]);

  const stop = useCallback(() => {
    ambientSynthesizer.stop();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  const setSoundType = useCallback((type: AmbientSoundType) => {
    setSoundTypeState(type);
    try {
      localStorage.setItem(STORAGE_KEY_SOUND_TYPE, type);
    } catch {
      // ignore
    }
    if (isPlaying) {
      ambientSynthesizer.play(type, volume);
    }
  }, [isPlaying, volume]);

  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    ambientSynthesizer.setVolume(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped));
    } catch {
      // ignore
    }
  }, []);

  // アンマウント時の停止
  useEffect(() => {
    return () => {
      ambientSynthesizer.stop();
    };
  }, []);

  return {
    isPlaying,
    soundType,
    volume,
    play,
    stop,
    togglePlay,
    setSoundType,
    setVolume,
  };
}
