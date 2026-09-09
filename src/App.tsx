import { useState, useEffect, useRef } from 'react';
import { Menu, Maximize, Minimize, Keyboard } from 'lucide-react';
import { useClock } from './hooks/useClock';
import { usePhotoSettings } from './hooks/usePhotoSettings';
import { usePhotoManager } from './hooks/usePhotoManager';
import { usePhotoFavorites } from './hooks/usePhotoFavorites';
import { useFullscreen } from './hooks/useFullscreen';
import { useZenTimer } from './hooks/useZenTimer';
import { useWakeLock } from './hooks/useWakeLock';
import { usePixelShift } from './hooks/usePixelShift';
import { ClockDisplay } from './components/ClockDisplay';
import { ZenTimerBar } from './components/ZenTimerBar';
import { PhotoCredit } from './components/PhotoCredit';
import { SettingsModal } from './components/SettingsModal';
import { CinematicBackground } from './components/CinematicBackground';
import { ShortcutHelpModal } from './components/ShortcutHelpModal';
import { useTranslation } from './hooks/useTranslation';
import {
  detectImageLuminance,
  getAutoMatteColor,
  getLuminanceFromHex,
} from './utils/photoColor';
import { getSolarMoodInfo } from './utils/sunCalc';

export default function App() {
  const {
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
  } = usePhotoSettings();

  const { t } = useTranslation(language);

  const {
    favorites,
    history,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    addToHistory,
    clearHistory,
  } = usePhotoFavorites();

  const clock = useClock(timeFormat, resolvedClockLanguage);
  const { isFullscreen, isSupported: isFullscreenSupported, toggleFullscreen } = useFullscreen();
  const zenTimer = useZenTimer();
  const wakeLock = useWakeLock();
  const pixelShift = usePixelShift();

  const { photo, photoUrl, refreshPhoto, applyStoredPhoto } = usePhotoManager(
    updateIntervalTime,
    selectedCollection,
    selectedTopic,
    addToHistory,
    isSunMoodEnabled
  );

  const solarMood = getSolarMoodInfo();
  const isNightDimmed = isNightDimmingEnabled && solarMood.isDimmed;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isZenHide, setIsZenHide] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // 写真の明暗に応じた台紙色の自動判定
  const [detectedMatteColor, setDetectedMatteColor] = useState<'white' | 'black'>('white');

  useEffect(() => {
    if (!photoUrl) return;

    if (photo?.color) {
      setDetectedMatteColor(getAutoMatteColor(getLuminanceFromHex(photo.color)));
    }

    let isMounted = true;
    detectImageLuminance(photoUrl, photo?.color).then((luminance) => {
      if (isMounted) {
        setDetectedMatteColor(getAutoMatteColor(luminance));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [photoUrl, photo?.color]);

  const activeMatteColor = matteColor === 'auto' ? detectedMatteColor : matteColor;

  // キーボードショートカット体系
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // フォーム入力中はスキップ
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Escapeキー
      if (e.key === 'Escape') {
        if (isHelpOpen) {
          setIsHelpOpen(false);
          return;
        }
        if (isModalOpen) {
          setIsModalOpen(false);
          return;
        }
        if (isZenHide) {
          setIsZenHide(false);
          return;
        }
      }

      // ? または / キーでショートカットガイドを表示/非表示
      if (e.key === '?' || (e.key === '/' && !isModalOpen)) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // ダイアログ表示中は他のショートカットを無効化
      if (isModalOpen || isHelpOpen) {
        return;
      }

      // Hキー: Zen Hide Mode (純粋アート鑑賞モード)
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsZenHide((prev) => !prev);
        return;
      }

      // Zen Hide 中は他の操作を抑制（クリック/Esc/Hで復帰）
      if (isZenHide) {
        return;
      }

      // Fキー: フルスクリーン切り替え
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Spaceキー: 背景写真を即時更新
      if (e.code === 'Space') {
        e.preventDefault();
        refreshPhoto();
        showToast(t('toast.changingPhoto'));
        return;
      }

      // Lキー: お気に入りトグル
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (photo) {
          const willBeFavorite = !isFavorite(photo.id);
          toggleFavorite(photo);
          showToast(willBeFavorite ? t('toast.addedToFavorites') : t('toast.removedFromFavorites'));
        }
        return;
      }

      // Tキー: 禅ポモドーロタイマーの開始/一時停止
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        if (!zenTimer.isEnabled) {
          zenTimer.setIsEnabled(true);
          zenTimer.start();
          showToast(t('toast.zenTimerStarted'));
        } else {
          const nextRunning = !zenTimer.isRunning;
          zenTimer.togglePlay();
          showToast(nextRunning ? t('toast.zenTimerResumed') : t('toast.zenTimerPaused'));
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isModalOpen,
    isHelpOpen,
    isZenHide,
    toggleFullscreen,
    refreshPhoto,
    photo,
    isFavorite,
    toggleFavorite,
    zenTimer,
    t,
  ]);

  // マウス動作時にコントローラーを表示し、3.5秒無操作でフェードアウト
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (!isModalOpen) {
        setIsControlsVisible(false);
      }
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (isZenHide) {
          setIsZenHide(false);
        }
      }}
      className={`relative w-screen h-screen overflow-hidden flex items-center justify-center select-none transition-all duration-700 ${
        isZenHide ? 'cursor-none' : ''
      } ${
        isGalleryMatteEnabled
          ? 'p-5 sm:p-8 md:p-12 lg:p-16'
          : 'p-0'
      }`}
      style={{
        backgroundColor: isGalleryMatteEnabled
          ? (activeMatteColor === 'white' ? '#ede9e2' : '#1a1918')
          : '#0c0a09',
      }}
    >
      {/* 写真・画像エリア（台紙の中央開口部。白い境界線なし、台紙の厚みによる陰影のみ） */}
      <div
        className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-700 ${
          isGalleryMatteEnabled ? 'rounded-[2px]' : ''
        }`}
        style={
          isGalleryMatteEnabled
            ? {
                boxShadow:
                  activeMatteColor === 'white'
                    ? 'inset 0 2px 6px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15)'
                    : 'inset 0 2px 6px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.35)',
              }
            : undefined
        }
      >
        {/* シネマティック背景レイヤー (Ken Burns & ダブルバッファクロスフェード) */}
        <div
          className="absolute inset-0 w-full h-full transition-[filter] duration-1000"
          style={{
            filter: isNightDimmed ? 'brightness(0.70) contrast(0.95)' : 'none',
          }}
        >
          <CinematicBackground
            photoUrl={photoUrl}
            isCinematicMotionEnabled={isCinematicMotionEnabled}
          />
        </div>

        {/* 左上: 操作コントロール群（設定メニュー & フルスクリーン & ショートカットガイド） */}
        <div
          className={`absolute top-4 left-4 z-30 flex items-center space-x-2 transition-all duration-300 ${
            !isZenHide && (isControlsVisible || isModalOpen || isHelpOpen)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label={t('photoCredit.openSettings')}
            title={t('photoCredit.openSettings')}
            className="w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/60 hover:bg-white/85 text-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          {isFullscreenSupported && (
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? t('photoCredit.fullscreenExit') : t('photoCredit.fullscreenEnter')}
              title={isFullscreen ? t('photoCredit.fullscreenExit') : t('photoCredit.fullscreenEnter')}
              className="w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/60 hover:bg-white/85 text-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => setIsHelpOpen(true)}
            aria-label={t('photoCredit.shortcutsHelp')}
            title={t('photoCredit.shortcutsHelp')}
            className="w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/60 hover:bg-white/85 text-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200"
          >
            <Keyboard className="w-5 h-5" />
          </button>
        </div>

        {/* 右上: 撮影者クレジット & お気に入りボタン */}
        <PhotoCredit
          photo={photo}
          isVisible={!isZenHide && isControlsVisible && !isModalOpen && !isHelpOpen}
          isFavorite={photo ? isFavorite(photo.id) : false}
          onToggleFavorite={
            photo
              ? () => {
                  const willBeFavorite = !isFavorite(photo.id);
                  toggleFavorite(photo);
                  showToast(willBeFavorite ? t('toast.addedToFavorites') : t('toast.removedFromFavorites'));
                }
              : undefined
          }
          language={language}
        />

        {/* 中央: 時計表示 & 禅タイマー（Zen Hide時はフェードアウト、Pixel Shiftによる微小シフト適用） */}
        <main
          className={`relative z-20 flex flex-col items-center transition-all duration-700 ${
            isZenHide ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            transform: `translate3d(${pixelShift.offset.x}px, ${pixelShift.offset.y}px, 0)`,
          }}
        >
          <ClockDisplay clock={clock} typographyStyle={typographyStyle} language={resolvedClockLanguage} />
          <ZenTimerBar
            zenTimer={zenTimer}
            isControlsVisible={isControlsVisible && !isModalOpen && !isHelpOpen}
            language={language}
          />
        </main>
      </div>

      {/* トースト通知フィードバック */}
      {toastMessage && (
        <div className="fixed bottom-8 z-40 flex items-center justify-center pointer-events-none transition-all duration-300">
          <div className="px-4 py-2 bg-stone-900/80 backdrop-blur-md text-stone-100 text-xs font-medium rounded-full shadow-lg border border-white/10">
            {toastMessage}
          </div>
        </div>
      )}

      {/* キーボードショートカットヘルプモーダル */}
      <ShortcutHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} language={language} />

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
        setLanguage={setLanguage}
        resolvedLanguage={resolvedLanguage}
        clockLanguage={clockLanguage}
        setClockLanguage={setClockLanguage}
        resolvedClockLanguage={resolvedClockLanguage}
        updateIntervalTime={updateIntervalTime}
        setUpdateIntervalTime={setUpdateIntervalTime}
        selectedCollection={selectedCollection}
        setSelectedCollection={setSelectedCollection}
        onRefreshPhoto={refreshPhoto}
        isCinematicMotionEnabled={isCinematicMotionEnabled}
        setIsCinematicMotionEnabled={setIsCinematicMotionEnabled}
        timeFormat={timeFormat}
        setTimeFormat={setTimeFormat}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        typographyStyle={typographyStyle}
        setTypographyStyle={setTypographyStyle}
        isGalleryMatteEnabled={isGalleryMatteEnabled}
        setIsGalleryMatteEnabled={setIsGalleryMatteEnabled}
        matteColor={matteColor}
        setMatteColor={setMatteColor}
        isSunMoodEnabled={isSunMoodEnabled}
        setIsSunMoodEnabled={setIsSunMoodEnabled}
        isNightDimmingEnabled={isNightDimmingEnabled}
        setIsNightDimmingEnabled={setIsNightDimmingEnabled}
        isZenTimerEnabled={zenTimer.isEnabled}
        setIsZenTimerEnabled={zenTimer.setIsEnabled}
        isWakeLockEnabled={wakeLock.isEnabled}
        setIsWakeLockEnabled={wakeLock.setIsEnabled}
        isPixelShiftEnabled={pixelShift.isEnabled}
        setIsPixelShiftEnabled={pixelShift.setIsEnabled}
        favorites={favorites}
        history={history}
        onSelectStoredPhoto={applyStoredPhoto}
        onRemoveFavorite={removeFavorite}
        onClearHistory={() => {
          clearHistory();
          showToast(t('toast.historyCleared'));
        }}
      />
    </div>
  );
}
