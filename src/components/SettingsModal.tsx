import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Heart,
  Clock,
  Image,
  Zap,
} from 'lucide-react';
import type { UnsplashCollection, StoredPhoto } from '../types/unsplash';
import type {
  TimeFormat,
  TypographyStyle,
  MatteColor,
  LanguageMode,
  ClockLanguageMode,
} from '../hooks/usePhotoSettings';
import type { TemperatureUnit } from '../hooks/useWeather';
import { useTranslation } from '../hooks/useTranslation';
import type { ResolvedLanguage } from '../locales';
import { ClockSettingsTab } from './settings/ClockSettingsTab';
import { PhotoSettingsTab } from './settings/PhotoSettingsTab';
import { DeviceSettingsTab } from './settings/DeviceSettingsTab';
import { LibrarySettingsTab } from './settings/LibrarySettingsTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  resolvedLanguage: ResolvedLanguage;
  clockLanguage: ClockLanguageMode;
  setClockLanguage: (lang: ClockLanguageMode) => void;
  resolvedClockLanguage: ResolvedLanguage;
  updateIntervalTime: number;
  setUpdateIntervalTime: (seconds: number) => void;
  selectedCollection: UnsplashCollection | null;
  setSelectedCollection: (collection: UnsplashCollection | null) => void;
  onRefreshPhoto: () => void;
  isCinematicMotionEnabled: boolean;
  setIsCinematicMotionEnabled: (enabled: boolean) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  typographyStyle: TypographyStyle;
  setTypographyStyle: (style: TypographyStyle) => void;
  isGalleryMatteEnabled: boolean;
  setIsGalleryMatteEnabled: (enabled: boolean) => void;
  matteColor: MatteColor;
  setMatteColor: (color: MatteColor) => void;
  isSunMoodEnabled: boolean;
  setIsSunMoodEnabled: (enabled: boolean) => void;
  isNightDimmingEnabled: boolean;
  setIsNightDimmingEnabled: (enabled: boolean) => void;
  isWeatherEnabled: boolean;
  setIsWeatherEnabled: (enabled: boolean) => void;
  temperatureUnit: TemperatureUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  isPomodoroTimerEnabled: boolean;
  setIsPomodoroTimerEnabled: (enabled: boolean) => void;
  isWakeLockEnabled: boolean;
  setIsWakeLockEnabled: (enabled: boolean) => void;
  isPixelShiftEnabled: boolean;
  setIsPixelShiftEnabled: (enabled: boolean) => void;
  favorites: StoredPhoto[];
  history: StoredPhoto[];
  onSelectStoredPhoto: (photo: StoredPhoto) => void;
  onRemoveFavorite: (photoId: string) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  resolvedLanguage: _resolvedLanguage,
  clockLanguage,
  setClockLanguage,
  resolvedClockLanguage: _resolvedClockLanguage,
  updateIntervalTime,
  setUpdateIntervalTime,
  selectedCollection,
  setSelectedCollection,
  onRefreshPhoto,
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
  isWeatherEnabled,
  setIsWeatherEnabled,
  temperatureUnit,
  setTemperatureUnit,
  isPomodoroTimerEnabled,
  setIsPomodoroTimerEnabled,
  isWakeLockEnabled,
  setIsWakeLockEnabled,
  isPixelShiftEnabled,
  setIsPixelShiftEnabled,
  favorites,
  history,
  onSelectStoredPhoto,
  onRemoveFavorite,
  onClearHistory,
}) => {
  const { t } = useTranslation(language);
  type SettingsSection = 'clock' | 'photos' | 'device' | 'library';
  const [activeSection, setActiveSection] = useState<SettingsSection>('clock');

  if (!isOpen) return null;

  const SECTIONS = [
    {
      id: 'clock' as const,
      label: t('settings.sections.clock'),
      icon: Clock,
    },
    {
      id: 'photos' as const,
      label: t('settings.sections.photos'),
      icon: Image,
    },
    {
      id: 'device' as const,
      label: t('settings.sections.device'),
      icon: Zap,
    },
    {
      id: 'library' as const,
      label: t('settings.sections.library'),
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : undefined,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 背景透過クリック領域 */}
      <div
        className="absolute inset-0 pointer-events-auto bg-black/0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ライブサイドインスペクターパネル本体 */}
      <div
        className="fixed z-50 pointer-events-auto bg-stone-100/95 backdrop-blur-2xl flex flex-col overflow-hidden border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.4)] transition-all duration-300 ease-out bottom-0 left-0 right-0 max-h-[68vh] rounded-t-3xl border-b-0 md:bottom-3 md:top-3 md:left-3 md:right-auto md:w-[440px] md:max-w-[calc(100vw-24px)] md:max-h-none md:rounded-3xl md:border-b"
        onClick={(e) => e.stopPropagation()}
      >
        {/* モバイル用ドラッグハンドル */}
        <div className="md:hidden flex items-center justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-stone-300" />
        </div>

        {/* パネル上部ヘッダー */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-stone-200/80 shrink-0 bg-white/40">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-400" />
            <h2 className="text-sm font-bold tracking-tight text-stone-900">PhotoClock</h2>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-600">
              v0.2.0
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={onRefreshPhoto}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors"
              title={t('settings.changePhotoNow')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* セクションタブバー */}
        <div className="flex items-center p-2 bg-stone-200/50 border-b border-stone-200/80 shrink-0 gap-1">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-stone-900' : 'text-stone-500'}`} />
                <span className="truncate">{sec.label}</span>
                {sec.badge !== undefined && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-600 ml-0.5">
                    {sec.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* スクロール可能な設定コンテナ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 min-w-0">
          {activeSection === 'clock' && (
            <ClockSettingsTab
              language={language}
              setLanguage={setLanguage}
              clockLanguage={clockLanguage}
              setClockLanguage={setClockLanguage}
              typographyStyle={typographyStyle}
              setTypographyStyle={setTypographyStyle}
              timeFormat={timeFormat}
              setTimeFormat={setTimeFormat}
              isWeatherEnabled={isWeatherEnabled}
              setIsWeatherEnabled={setIsWeatherEnabled}
              temperatureUnit={temperatureUnit}
              setTemperatureUnit={setTemperatureUnit}
              isGalleryMatteEnabled={isGalleryMatteEnabled}
              setIsGalleryMatteEnabled={setIsGalleryMatteEnabled}
              matteColor={matteColor}
              setMatteColor={setMatteColor}
            />
          )}

          {activeSection === 'photos' && (
            <PhotoSettingsTab
              language={language}
              updateIntervalTime={updateIntervalTime}
              setUpdateIntervalTime={setUpdateIntervalTime}
              isSunMoodEnabled={isSunMoodEnabled}
              setIsSunMoodEnabled={setIsSunMoodEnabled}
              isNightDimmingEnabled={isNightDimmingEnabled}
              setIsNightDimmingEnabled={setIsNightDimmingEnabled}
              isCinematicMotionEnabled={isCinematicMotionEnabled}
              setIsCinematicMotionEnabled={setIsCinematicMotionEnabled}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              selectedCollection={selectedCollection}
              setSelectedCollection={setSelectedCollection}
              onRefreshPhoto={onRefreshPhoto}
              onClose={onClose}
            />
          )}

          {activeSection === 'device' && (
            <DeviceSettingsTab
              language={language}
              isPomodoroTimerEnabled={isPomodoroTimerEnabled}
              setIsPomodoroTimerEnabled={setIsPomodoroTimerEnabled}
              isWakeLockEnabled={isWakeLockEnabled}
              setIsWakeLockEnabled={setIsWakeLockEnabled}
              isPixelShiftEnabled={isPixelShiftEnabled}
              setIsPixelShiftEnabled={setIsPixelShiftEnabled}
            />
          )}

          {activeSection === 'library' && (
            <LibrarySettingsTab
              language={language}
              favorites={favorites}
              history={history}
              onSelectStoredPhoto={onSelectStoredPhoto}
              onRemoveFavorite={onRemoveFavorite}
              onClearHistory={onClearHistory}
              onClose={onClose}
            />
          )}

          {/* クレジット表記 */}
          <div className="pt-2 pb-2 text-center text-[10px] text-stone-400">
            PhotoClock | Unsplash API &amp; Open-Meteo
          </div>
        </div>
      </div>
    </div>
  );
};
