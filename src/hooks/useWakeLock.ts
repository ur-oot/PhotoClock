import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY_WAKE_LOCK = 'photoclock_wake_lock_enabled';

export function useWakeLock() {
  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WAKE_LOCK);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // 常設時計としてデフォルト有効
  });

  const [isSupported] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  });

  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }
    try {
      if (wakeLockSentinelRef.current && !wakeLockSentinelRef.current.released) {
        return;
      }
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinelRef.current = sentinel;
      sentinel.addEventListener('release', () => {
        wakeLockSentinelRef.current = null;
      });
    } catch {
      // 省電力モードやバックグラウンド時は静かに待機
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockSentinelRef.current) {
      wakeLockSentinelRef.current.release().catch(() => {});
      wakeLockSentinelRef.current = null;
    }
  }, []);

  const setIsEnabled = (enabled: boolean) => {
    setIsEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_WAKE_LOCK, String(enabled));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isEnabled) {
      releaseWakeLock();
      return;
    }

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isEnabled) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isEnabled, requestWakeLock, releaseWakeLock]);

  return {
    isEnabled,
    setIsEnabled,
    isSupported,
  };
}
