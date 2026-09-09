import { useState, useEffect } from 'react';

const STORAGE_KEY_PIXEL_SHIFT = 'photoclock_pixel_shift_enabled';
const SHIFT_INTERVAL_MS = 5 * 60 * 1000; // 5分ごと

export interface PixelOffset {
  x: number;
  y: number;
}

export function usePixelShift() {
  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PIXEL_SHIFT);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // 焼き付き防止のためデフォルト有効
  });

  const [offset, setOffset] = useState<PixelOffset>({ x: 0, y: 0 });

  const setIsEnabled = (enabled: boolean) => {
    setIsEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_PIXEL_SHIFT, String(enabled));
    } catch {
      // ignore
    }
    if (!enabled) {
      setOffset({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (!isEnabled) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const shift = () => {
      // -3px から +3px の微小ランダムオフセット
      const x = Math.floor(Math.random() * 7) - 3;
      const y = Math.floor(Math.random() * 7) - 3;
      setOffset({ x, y });
    };

    const timer = setInterval(shift, SHIFT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isEnabled]);

  return {
    isEnabled,
    setIsEnabled,
    offset,
  };
}
