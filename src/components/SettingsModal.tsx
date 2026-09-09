import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Check, Shuffle, RefreshCw, Heart, History, Trash2, ArrowUpRight } from 'lucide-react';
import type { UnsplashCollection, StoredPhoto } from '../types/unsplash';
import { PHOTO_TOPICS } from '../types/unsplash';
import {
  INTERVAL_OPTIONS,
  TYPOGRAPHY_OPTIONS,
  type TimeFormat,
  type TypographyStyle,
  type MatteColor,
  type LanguageMode,
  type ClockLanguageMode,
} from '../hooks/usePhotoSettings';
import { getSolarMoodInfo } from '../utils/sunCalc';
import { useTranslation } from '../hooks/useTranslation';
import type { ResolvedLanguage } from '../locales';

const TOPIC_TRANSLATION_KEYS: Record<string, string> = {
  all: 'settings.topics.all',
  wallpapers: 'settings.topics.wallpapers',
  nature: 'settings.topics.nature',
  travel: 'settings.topics.travel',
  'architecture-interior': 'settings.topics.architecture',
  'street-photography': 'settings.topics.street',
  'textures-patterns': 'settings.topics.textures',
  film: 'settings.topics.film',
  animals: 'settings.topics.animals',
  spirituality: 'settings.topics.spirituality',
  monochrome: 'settings.topics.monochrome',
};

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
  isZenTimerEnabled: boolean;
  setIsZenTimerEnabled: (enabled: boolean) => void;
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
  isZenTimerEnabled,
  setIsZenTimerEnabled,
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
  const [activeTab, setActiveTab] = useState<'general' | 'favorites' | 'history'>('general');
  const [collections, setCollections] = useState<UnsplashCollection[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState<boolean>(false);

  const solarMood = getSolarMoodInfo();

  // 初回表示時にコレクション一覧を取得
  useEffect(() => {
    if (isOpen && !hasLoadedInitial) {
      fetchCollections(1);
      setHasLoadedInitial(true);
    }
  }, [isOpen, hasLoadedInitial]);

  const fetchCollections = async (pageToFetch: number) => {
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/collections?page=${pageToFetch}&perPage=12`);
      if (res.ok) {
        const data: UnsplashCollection[] = await res.json();
        if (Array.isArray(data)) {
          setCollections((prev) => (pageToFetch === 1 ? data : [...prev, ...data]));
          setPage(pageToFetch);
        }
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchCollections(page + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex flex-col transition-all">
      {/* モーダルヘッダー */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-white/85 backdrop-blur-lg border-b border-stone-200/80">
        <div className="flex items-center space-x-6">
          <h2 className="text-lg font-bold tracking-tight text-stone-900 hidden sm:block">PhotoClock</h2>

          {/* ナビゲーションタブ */}
          <nav className="flex items-center space-x-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'general'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('settings.tabs.general')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'favorites'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{t('settings.tabs.favorites')}</span>
              {favorites.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-rose-100 text-rose-700 rounded-full font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('settings.tabs.history')}</span>
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-stone-200 text-stone-700 rounded-full font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              onRefreshPhoto();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
            title={t('settings.changePhotoNow')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('settings.changePhotoNow')}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
        {activeTab === 'general' && (
          <>
            {/* ディスプレイ & アニメーション設定 */}
        <section className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.languageTitle')}
            </h3>
            <div className="flex items-center max-w-xs bg-stone-200/70 p-1 rounded-lg border border-stone-300">
              <button
                type="button"
                onClick={() => setLanguage('auto')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                  language === 'auto'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.languageAuto')}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.languageEn')}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ja')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                  language === 'ja'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.languageJa')}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.languageDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.clockLanguageTitle')}
            </h3>
            <div className="flex items-center max-w-xs bg-stone-200/70 p-1 rounded-lg border border-stone-300">
              <button
                type="button"
                onClick={() => setClockLanguage('sync')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                  clockLanguage === 'sync'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.clockLanguageSync')}
              </button>
              <button
                type="button"
                onClick={() => setClockLanguage('en')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                  clockLanguage === 'en'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.clockLanguageEn')}
              </button>
              <button
                type="button"
                onClick={() => setClockLanguage('ja')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                  clockLanguage === 'ja'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.clockLanguageJa')}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.clockLanguageDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.updateIntervalTitle')}
            </h3>
            <div className="max-w-xs">
              <select
                value={updateIntervalTime}
                onChange={(e) => setUpdateIntervalTime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
              >
                {INTERVAL_OPTIONS.map((opt) => {
                  const mins = Math.round(opt.code / 60);
                  const label =
                    language === 'ja'
                      ? opt.code === 300
                        ? `${mins}分ごと（標準）`
                        : `${mins}分ごと`
                      : opt.code === 300
                      ? 'Every 5 minutes (default)'
                      : `Every ${mins} minutes`;
                  return (
                    <option key={opt.code} value={opt.code}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.updateIntervalDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.timeFormatTitle')}
            </h3>
            <div className="flex items-center max-w-xs bg-stone-200/70 p-1 rounded-lg border border-stone-300">
              <button
                type="button"
                onClick={() => setTimeFormat('12h')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                  timeFormat === '12h'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.timeFormat12')}
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat('24h')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                  timeFormat === '24h'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.timeFormat24')}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.timeFormatDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.typographyTitle')}
            </h3>
            <div className="flex flex-col space-y-1.5 max-w-xs">
              {TYPOGRAPHY_OPTIONS.map((opt) => {
                const info =
                  opt.id === 'sans'
                    ? { label: t('settings.general.typographySans'), desc: t('settings.general.typographySansDesc') }
                    : opt.id === 'serif'
                    ? { label: t('settings.general.typographySerif'), desc: t('settings.general.typographySerifDesc') }
                    : { label: t('settings.general.typographyMono'), desc: t('settings.general.typographyMonoDesc') };
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTypographyStyle(opt.id)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-left transition-all ${
                      typographyStyle === opt.id
                        ? 'bg-white border-blue-500 text-stone-900 shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white hover:text-stone-900'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{info.label}</span>
                      <span className="text-[10px] text-stone-400">{info.desc}</span>
                    </div>
                    <span className={`text-sm font-medium ${opt.fontClass}`}>
                      {opt.sample}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.typographyDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.zenTimerTitle')}
            </h3>
            <div className="flex items-center justify-between max-w-xs bg-white px-4 py-2 border border-stone-300 rounded-lg shadow-sm">
              <span className="text-sm text-stone-800 font-medium">
                {isZenTimerEnabled ? t('common.enabled') : t('common.disabled')}
              </span>
              <button
                type="button"
                onClick={() => setIsZenTimerEnabled(!isZenTimerEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isZenTimerEnabled ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={isZenTimerEnabled}
                aria-label="Toggle Zen pomodoro timer"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isZenTimerEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.zenTimerDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.cinematicMotionTitle')}
            </h3>
            <div className="flex items-center justify-between max-w-xs bg-white px-4 py-2 border border-stone-300 rounded-lg shadow-sm">
              <span className="text-sm text-stone-800 font-medium">
                {isCinematicMotionEnabled ? t('common.enabled') : t('common.disabled')}
              </span>
              <button
                type="button"
                onClick={() => setIsCinematicMotionEnabled(!isCinematicMotionEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isCinematicMotionEnabled ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={isCinematicMotionEnabled}
                aria-label="Toggle cinematic motion"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isCinematicMotionEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.cinematicMotionDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.screenAwakeTitle')}
            </h3>
            <div className="flex items-center justify-between max-w-xs bg-white px-4 py-2 border border-stone-300 rounded-lg shadow-sm">
              <span className="text-sm text-stone-800 font-medium">
                {isWakeLockEnabled ? t('common.active') : t('common.disabled')}
              </span>
              <button
                type="button"
                onClick={() => setIsWakeLockEnabled(!isWakeLockEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isWakeLockEnabled ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={isWakeLockEnabled}
                aria-label="Toggle keep screen awake"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isWakeLockEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.screenAwakeDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.burnInTitle')}
            </h3>
            <div className="flex items-center justify-between max-w-xs bg-white px-4 py-2 border border-stone-300 rounded-lg shadow-sm">
              <span className="text-sm text-stone-800 font-medium">
                {isPixelShiftEnabled ? t('common.active') : t('common.disabled')}
              </span>
              <button
                type="button"
                onClick={() => setIsPixelShiftEnabled(!isPixelShiftEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPixelShiftEnabled ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={isPixelShiftEnabled}
                aria-label="Toggle burn-in protection"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPixelShiftEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.burnInDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.galleryMatteTitle')}
            </h3>
            <div className="flex items-center justify-between max-w-xs bg-white px-4 py-2 border border-stone-300 rounded-lg shadow-sm">
              <span className="text-sm text-stone-800 font-medium">
                {isGalleryMatteEnabled ? t('common.enabled') : t('common.disabled')}
              </span>
              <button
                type="button"
                onClick={() => setIsGalleryMatteEnabled(!isGalleryMatteEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isGalleryMatteEnabled ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={isGalleryMatteEnabled}
                aria-label="Toggle gallery matte mode"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isGalleryMatteEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {isGalleryMatteEnabled && (
              <div className="mt-2.5 flex items-center max-w-xs bg-stone-200/70 p-1 rounded-lg border border-stone-300">
                <button
                  type="button"
                  onClick={() => setMatteColor('auto')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
                    matteColor === 'auto'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Automatically choose matte color based on photo brightness"
                >
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ede9e2] to-[#1c1a19] border border-stone-400/60 inline-block" />
                  <span>{t('settings.general.matteAuto')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatteColor('white')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
                    matteColor === 'white'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#ede9e2] border border-stone-400/60 inline-block" />
                  <span>{t('settings.general.matteWhite')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatteColor('black')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
                    matteColor === 'black'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#1c1a19] border border-stone-600 inline-block" />
                  <span>{t('settings.general.matteBlack')}</span>
                </button>
              </div>
            )}
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.galleryMatteDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.sunMoodTitle')}
            </h3>
            <div className="flex items-center justify-between max-w-xs bg-white px-4 py-2 border border-stone-300 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-stone-800 font-medium">
                  {isSunMoodEnabled ? t('common.enabled') : t('common.disabled')}
                </span>
                {isSunMoodEnabled && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                    {t(`solarPhases.${solarMood.phase}`)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsSunMoodEnabled(!isSunMoodEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSunMoodEnabled ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={isSunMoodEnabled}
                aria-label="Toggle sun-aware photo mood"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSunMoodEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.sunMoodDesc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('settings.general.nightDimmingTitle')}
            </h3>
            <div className="flex items-center justify-between max-w-xs bg-white px-4 py-2 border border-stone-300 rounded-lg shadow-sm">
              <span className="text-sm text-stone-800 font-medium">
                {isNightDimmingEnabled ? t('common.enabled') : t('common.disabled')}
              </span>
              <button
                type="button"
                onClick={() => setIsNightDimmingEnabled(!isNightDimmingEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isNightDimmingEnabled ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={isNightDimmingEnabled}
                aria-label="Toggle automatic night dimming"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isNightDimmingEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              {t('settings.general.nightDimmingDesc')}
            </p>
          </div>
        </section>

        {/* 写真のムード & トピック選択 */}
        <section className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                {t('settings.topics.title')}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {t('settings.topics.desc')}
              </p>
            </div>
            {selectedCollection ? (
              <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md inline-block self-start sm:self-auto">
                {t('settings.topics.customActive')}
              </span>
            ) : isSunMoodEnabled ? (
              <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md inline-flex items-center space-x-1.5 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {t('settings.topics.sunAwareActive', {
                    phase: t(`solarPhases.${solarMood.phase}`),
                  })}
                </span>
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {PHOTO_TOPICS.map((topic) => {
              const isSelected = !selectedCollection && selectedTopic === topic.id;
              const topicKey = TOPIC_TRANSLATION_KEYS[topic.id];
              const topicName = topicKey ? t(topicKey) : topic.name;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    onRefreshPhoto();
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-md ring-2 ring-stone-900/20 scale-105'
                      : 'bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <span className="text-sm">{topic.emoji}</span>
                  <span>{topicName}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-1 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* コレクション選択 */}
        <section className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                {t('settings.collections.title')}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {t('settings.collections.desc')}
              </p>
            </div>

            {selectedCollection && (
              <button
                onClick={() => {
                  setSelectedCollection(null);
                  onRefreshPhoto();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300 shadow-sm"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>
                  {language === 'ja'
                    ? 'コレクション解除（選択トピックを使用）'
                    : 'Clear Collection (Use Selected Topic)'}
                </span>
              </button>
            )}
          </div>

          {/* グリッドレイアウト */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((item) => {
              const isSelected = selectedCollection?.id === item.id;
              const previews = item.preview_photos || [];

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border-2 ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  {/* 3分割プレビューサムネイル */}
                  <a
                    href={`https://unsplash.com/collections/${item.id}?utm_source=photoclock&utm_medium=referral`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-[16/10] bg-stone-100 flex overflow-hidden group/thumb"
                  >
                    {previews[0]?.urls?.small && (
                      <div className="w-[70%] h-full relative">
                        <img
                          src={previews[0].urls.small}
                          alt=""
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="w-[30%] h-full flex flex-col pl-0.5 space-y-0.5">
                      {previews[1]?.urls?.small && (
                        <div className="h-1/2 relative overflow-hidden">
                          <img
                            src={previews[1].urls.small}
                            alt=""
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      {previews[2]?.urls?.small && (
                        <div className="h-1/2 relative overflow-hidden">
                          <img
                            src={previews[2].urls.small}
                            alt=""
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center space-x-1">
                      <span>{t('settings.favorites.viewOnUnsplash')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  </a>

                  {/* タイトルと選択ボタン */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {t('settings.collections.photosCount', { count: item.total_photos })}
                      </p>
                    </div>

                    <div className="mt-4">
                      {isSelected ? (
                        <button
                          disabled
                          className="w-full py-1.5 px-3 bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-default"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('common.selected')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCollection(item);
                            onClose();
                          }}
                          className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          {language === 'ja' ? 'このコレクションを適用' : 'Select this collection'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* もっと読み込むボタン */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2.5 bg-white border border-stone-300 text-stone-800 font-medium text-sm rounded-lg hover:bg-stone-50 shadow-sm transition-all disabled:opacity-50"
            >
              {isLoadingMore
                ? language === 'ja'
                  ? '読み込み中...'
                  : 'Loading collections...'
                : t('settings.collections.loadMore')}
            </button>
          </div>
        </section>
      </>
    )}

        {/* お気に入りタブ */}
        {activeTab === 'favorites' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>{t('settings.favorites.title')}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {t('settings.favorites.desc')}
                </p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-md rounded-2xl border border-stone-200/80">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-stone-700">
                  {t('settings.favorites.emptyTitle')}
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {t('settings.favorites.emptyDesc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-stone-200/80 flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                      <img
                        src={item.thumbUrl}
                        alt={item.description || `Photo by ${item.user.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-medium truncate max-w-[180px]">
                          {language === 'ja' ? `撮影: ${item.user.name}` : `By ${item.user.name}`}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-stone-700 flex items-center space-x-0.5"
                          title={t('settings.favorites.viewOnUnsplash')}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStoredPhoto(item);
                            onClose();
                          }}
                          className="flex-1 py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          {t('settings.favorites.apply')}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveFavorite(item.id)}
                          title={t('common.remove')}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 履歴タブ */}
        {activeTab === 'history' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                  <History className="w-4 h-4 text-stone-700" />
                  <span>{t('settings.history.title')}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {t('settings.history.desc')}
                </p>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-stone-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('settings.history.clearAll')}</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-md rounded-2xl border border-stone-200/80">
                <History className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-stone-700">
                  {t('settings.history.emptyTitle')}
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {t('settings.history.emptyDesc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div
                    key={`${item.id}-${item.savedAt}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-stone-200/80 flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                      <img
                        src={item.thumbUrl}
                        alt={item.description || `Photo by ${item.user.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-medium truncate max-w-[180px]">
                          {language === 'ja' ? `撮影: ${item.user.name}` : `By ${item.user.name}`}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-stone-700 flex items-center space-x-0.5"
                          title={t('settings.history.viewOnUnsplash')}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStoredPhoto(item);
                            onClose();
                          }}
                          className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-xs font-semibold transition-colors"
                        >
                          {t('settings.history.apply')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* フッター */}
      <footer className="py-4 text-center text-xs text-stone-500 bg-white/50 border-t border-stone-200/50">
        PhotoClock | Built with React, Vite & Unsplash API
      </footer>
    </div>
  );
};
