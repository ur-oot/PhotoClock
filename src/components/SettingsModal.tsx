import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Check,
  Shuffle,
  RefreshCw,
  Heart,
  History,
  Trash2,
  ArrowUpRight,
  Clock,
  Image,
  Zap,
} from 'lucide-react';
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

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}> = ({ checked, onChange, ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none p-0.5 cursor-pointer flex items-center shrink-0 ${
      checked ? 'bg-stone-900' : 'bg-stone-300'
    }`}
  >
    <span
      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

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
  type SettingsSection = 'clock' | 'photos' | 'device' | 'library';
  const [activeSection, setActiveSection] = useState<SettingsSection>('clock');
  const [librarySubTab, setLibrarySubTab] = useState<'favorites' | 'history'>('favorites');
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
      {/* 背景透過クリック領域（写真・時計をクリックすると設定を閉じる。背景は100%クリアに透過） */}
      <div
        className="absolute inset-0 pointer-events-auto bg-black/0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ライブサイドインスペクターパネル本体 */}
      <div
        className="fixed z-50 pointer-events-auto bg-stone-100/95 backdrop-blur-2xl flex flex-col overflow-hidden border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.4)] transition-all duration-300 ease-out bottom-0 left-0 right-0 max-h-[68vh] rounded-t-3xl border-b-0 md:bottom-3 md:top-3 md:right-3 md:left-auto md:w-[440px] md:max-w-[calc(100vw-24px)] md:max-h-none md:rounded-3xl md:border-b"
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

        {/* セクションタブバー (4タブのセグメントコントロール) */}
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
            {/* Section 1: 時計・表示 */}
            {activeSection === 'clock' && (
              <div className="space-y-5">
                {/* 言語と地域 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
                    {language === 'ja' ? '言語と地域' : 'Language & Region'}
                  </span>
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
                    {/* 表示言語 */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.languageTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.languageDesc')}
                        </div>
                      </div>
                      <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200/70 self-start sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setLanguage('auto')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                            language === 'auto'
                              ? 'bg-white text-stone-900 font-semibold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {t('settings.general.languageAuto')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage('en')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                            language === 'en'
                              ? 'bg-white text-stone-900 font-semibold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {t('settings.general.languageEn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage('ja')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                            language === 'ja'
                              ? 'bg-white text-stone-900 font-semibold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {t('settings.general.languageJa')}
                        </button>
                      </div>
                    </div>

                    {/* 時計の日時表記 */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.clockLanguageTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.clockLanguageDesc')}
                        </div>
                      </div>
                      <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200/70 self-start sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setClockLanguage('sync')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                            clockLanguage === 'sync'
                              ? 'bg-white text-stone-900 font-semibold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {t('settings.general.clockLanguageSync')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setClockLanguage('en')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                            clockLanguage === 'en'
                              ? 'bg-white text-stone-900 font-semibold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {t('settings.general.clockLanguageEn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setClockLanguage('ja')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                            clockLanguage === 'ja'
                              ? 'bg-white text-stone-900 font-semibold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {t('settings.general.clockLanguageJa')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 時計スタイル */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
                    {language === 'ja' ? '時計スタイル' : 'Clock Style'}
                  </span>
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
                    {/* 時計フォント (ビジュアルセレクター) */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.typographyTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.typographyDesc')}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {TYPOGRAPHY_OPTIONS.map((opt) => {
                          const isSelected = typographyStyle === opt.id;
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
                              className={`p-3 rounded-xl text-left border transition-all ${
                                isSelected
                                  ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900/10'
                                  : 'border-stone-200/80 hover:border-stone-400 bg-white'
                              }`}
                            >
                              <div className={`text-lg font-bold leading-tight ${opt.fontClass} ${isSelected ? 'text-stone-900' : 'text-stone-700'}`}>
                                {opt.sample}
                              </div>
                              <div className="text-xs font-semibold text-stone-800 mt-1">
                                {info.label}
                              </div>
                              <div className="text-[10px] text-stone-400 line-clamp-1">
                                {info.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 時刻形式 */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.timeFormatTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.timeFormatDesc')}
                        </div>
                      </div>
                      <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200/70 self-start sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setTimeFormat('12h')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            timeFormat === '12h'
                              ? 'bg-white text-stone-900 font-semibold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {t('settings.general.timeFormat12')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeFormat('24h')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            timeFormat === '24h'
                              ? 'bg-white text-stone-900 font-semibold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {t('settings.general.timeFormat24')}
                        </button>
                      </div>
                    </div>

                    {/* 額装マット表示 */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.galleryMatteTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.galleryMatteDesc')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                        {isGalleryMatteEnabled && (
                          <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200/70">
                            <button
                              type="button"
                              onClick={() => setMatteColor('auto')}
                              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                                matteColor === 'auto'
                                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              {t('settings.general.matteAuto')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setMatteColor('white')}
                              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                                matteColor === 'white'
                                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              {t('settings.general.matteWhite')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setMatteColor('black')}
                              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                                matteColor === 'black'
                                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              {t('settings.general.matteBlack')}
                            </button>
                          </div>
                        )}
                        <ToggleSwitch
                          checked={isGalleryMatteEnabled}
                          onChange={setIsGalleryMatteEnabled}
                          ariaLabel="Toggle gallery matte mode"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: 写真・演出 */}
            {activeSection === 'photos' && (
              <div className="space-y-5">
                {/* 再生と演出 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
                    {language === 'ja' ? '再生と演出' : 'Playback & Effects'}
                  </span>
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
                    {/* 更新間隔 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.updateIntervalTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.updateIntervalDesc')}
                        </div>
                      </div>
                      <select
                        value={updateIntervalTime}
                        onChange={(e) => setUpdateIntervalTime(Number(e.target.value))}
                        className="text-xs font-semibold bg-stone-100 border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 outline-none cursor-pointer focus:ring-1 focus:ring-stone-400 shrink-0"
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

                    {/* 太陽光連動ムード */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-stone-900">
                            {t('settings.general.sunMoodTitle')}
                          </span>
                          {isSunMoodEnabled && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                              {t(`solarPhases.${solarMood.phase}`)}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.sunMoodDesc')}
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={isSunMoodEnabled}
                        onChange={setIsSunMoodEnabled}
                        ariaLabel="Toggle sun mood"
                      />
                    </div>

                    {/* 夜間自動減光 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.nightDimmingTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.nightDimmingDesc')}
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={isNightDimmingEnabled}
                        onChange={setIsNightDimmingEnabled}
                        ariaLabel="Toggle night dimming"
                      />
                    </div>

                    {/* シネマティック演出 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.cinematicMotionTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.cinematicMotionDesc')}
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={isCinematicMotionEnabled}
                        onChange={setIsCinematicMotionEnabled}
                        ariaLabel="Toggle cinematic motion"
                      />
                    </div>
                  </div>
                </div>

                {/* 写真テーマ・ムード */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
                    {t('settings.topics.title')}
                  </span>
                  <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-[11px] text-stone-500">
                        {t('settings.topics.desc')}
                      </p>
                      {selectedCollection ? (
                        <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md inline-block self-start sm:self-auto shrink-0">
                          {t('settings.topics.customActive')}
                        </span>
                      ) : isSunMoodEnabled ? (
                        <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md inline-flex items-center space-x-1.5 self-start sm:self-auto shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>
                            {t('settings.topics.sunAwareActive', {
                              phase: t(`solarPhases.${solarMood.phase}`),
                            })}
                          </span>
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
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
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-2xs ${
                              isSelected
                                ? 'bg-stone-900 text-white shadow-xs font-semibold'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            <span>{topic.emoji}</span>
                            <span>{topicName}</span>
                            {isSelected && <Check className="w-3 h-3 ml-0.5 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Unsplashコレクション */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {t('settings.collections.title')}
                    </span>
                    {selectedCollection && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCollection(null);
                          onRefreshPhoto();
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-200/70 hover:bg-stone-300 rounded-lg transition-colors"
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>
                          {language === 'ja'
                            ? 'コレクション解除'
                            : 'Clear Collection'}
                        </span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 px-1">
                    {t('settings.collections.desc')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {collections.map((item) => {
                      const isSelected = selectedCollection?.id === item.id;
                      const previews = item.preview_photos || [];

                      return (
                        <div
                          key={item.id}
                          className={`group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all border-2 ${
                            isSelected
                              ? 'border-blue-500 ring-2 ring-blue-500/20'
                              : 'border-stone-200/80 hover:border-stone-300'
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
                          <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                            <div>
                              <h4 className="font-semibold text-stone-900 text-xs line-clamp-1">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-stone-500 mt-0.5">
                                {t('settings.collections.photosCount', { count: item.total_photos })}
                              </p>
                            </div>

                            <div>
                              {isSelected ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-1.5 px-3 bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-default"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{t('common.selected')}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
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
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="px-5 py-2 bg-white border border-stone-300 text-stone-800 font-medium text-xs rounded-lg hover:bg-stone-50 shadow-xs transition-all disabled:opacity-50"
                    >
                      {isLoadingMore
                        ? language === 'ja'
                          ? '読み込み中...'
                          : 'Loading collections...'
                        : t('settings.collections.loadMore')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: 集中・省電力 */}
            {activeSection === 'device' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
                    {language === 'ja' ? 'デバイス維持 & 集中' : 'Device & Focus'}
                  </span>
                  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
                    {/* 禅タイマー */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.zenTimerTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.zenTimerDesc')}
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={isZenTimerEnabled}
                        onChange={setIsZenTimerEnabled}
                        ariaLabel="Toggle Zen timer"
                      />
                    </div>

                    {/* 画面スリープ防止 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.screenAwakeTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.screenAwakeDesc')}
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={isWakeLockEnabled}
                        onChange={setIsWakeLockEnabled}
                        ariaLabel="Toggle keep screen awake"
                      />
                    </div>

                    {/* 焼き付き防止 */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {t('settings.general.burnInTitle')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t('settings.general.burnInDesc')}
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={isPixelShiftEnabled}
                        onChange={setIsPixelShiftEnabled}
                        ariaLabel="Toggle burn-in protection"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: ライブラリ */}
            {activeSection === 'library' && (
              <div className="space-y-4">
                {/* サブタブ切り替え & アクション */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-stone-200/70 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLibrarySubTab('favorites')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        librarySubTab === 'favorites'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{t('settings.tabs.favorites')}</span>
                      {favorites.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-rose-100 text-rose-700 rounded-full font-bold">
                          {favorites.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLibrarySubTab('history')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        librarySubTab === 'history'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{t('settings.tabs.history')}</span>
                      {history.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-stone-200 text-stone-700 rounded-full font-bold">
                          {history.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {librarySubTab === 'history' && history.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearHistory}
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-stone-200/80 transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('settings.history.clearAll')}</span>
                    </button>
                  )}
                </div>

                {/* サブタブコンテンツ */}
                {librarySubTab === 'favorites' ? (
                  favorites.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white/80 rounded-2xl border border-stone-200/80">
                      <Heart className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                      <h4 className="text-sm font-semibold text-stone-700">
                        {t('settings.favorites.emptyTitle')}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        {t('settings.favorites.emptyDesc')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {favorites.map((item) => (
                        <div
                          key={item.id}
                          className="group bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all border border-stone-200/80 flex flex-col"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                            <img
                              src={item.thumbUrl}
                              alt={item.description || `Photo by ${item.user.name}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-700 font-medium truncate max-w-[160px]">
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
                            <div className="flex items-center space-x-2 pt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectStoredPhoto(item);
                                  onClose();
                                }}
                                className="flex-1 py-1 px-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                              >
                                {t('settings.favorites.apply')}
                              </button>
                              <button
                                type="button"
                                onClick={() => onRemoveFavorite(item.id)}
                                title={t('common.remove')}
                                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  history.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white/80 rounded-2xl border border-stone-200/80">
                      <History className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                      <h4 className="text-sm font-semibold text-stone-700">
                        {t('settings.history.emptyTitle')}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        {t('settings.history.emptyDesc')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {history.map((item) => (
                        <div
                          key={`${item.id}-${item.savedAt}`}
                          className="group bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all border border-stone-200/80 flex flex-col"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                            <img
                              src={item.thumbUrl}
                              alt={item.description || `Photo by ${item.user.name}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-700 font-medium truncate max-w-[160px]">
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
                            <div className="pt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectStoredPhoto(item);
                                  onClose();
                                }}
                                className="w-full py-1 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-xs font-semibold transition-colors"
                              >
                                {t('settings.history.apply')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
