import React, { createContext, useContext } from 'react';
import { usePhotoSettings } from '../hooks/usePhotoSettings';
import { useWeather } from '../hooks/useWeather';
import { useWakeLock } from '../hooks/useWakeLock';
import { usePixelShift } from '../hooks/usePixelShift';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';

export type SettingsContextType = ReturnType<typeof usePhotoSettings> & {
  weather: ReturnType<typeof useWeather>;
  wakeLock: ReturnType<typeof useWakeLock>;
  pixelShift: ReturnType<typeof usePixelShift>;
  pomodoroTimer: ReturnType<typeof usePomodoroTimer>;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const photoSettings = usePhotoSettings();
  const weather = useWeather();
  const wakeLock = useWakeLock();
  const pixelShift = usePixelShift();
  const pomodoroTimer = usePomodoroTimer();

  const value: SettingsContextType = {
    ...photoSettings,
    weather,
    wakeLock,
    pixelShift,
    pomodoroTimer,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
