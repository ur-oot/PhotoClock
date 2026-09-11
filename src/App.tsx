import { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, Maximize, Minimize, Keyboard } from 'lucide-react';
import { useSettings } from './contexts/SettingsContext';
import { usePhotoManager } from './hooks/usePhotoManager';
import { usePhotoFavorites } from './hooks/usePhotoFavorites';
import { useFullscreen } from './hooks/useFullscreen';
import { ClockDisplay } from './components/ClockDisplay';
import { PomodoroTimerBar } from './components/PomodoroTimerBar';
import { PhotoCredit } from './components/PhotoCredit';
import { SettingsModal } from './components/SettingsModal';
import { CinematicBackground } from './components/CinematicBackground';
import { ShortcutHelpModal } from './components/ShortcutHelpModal';
import { useTranslation } from './hooks/useTranslation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  detectImageLuminance,
  getAutoMatteColor,
  getLuminanceFromHex,
} from './utils/photoColor';
import { getSolarMoodInfo } from './utils/sunCalc';

export default function App() {
  const {
    updateIntervalTime,
    selectedCollection,
    isCinematicMotionEnabled,
    timeFormat,
    selectedTopic,
    typographyStyle,
    isGalleryMatteEnabled,
    matteColor,
    photoFitMode,
    isSunMoodEnabled,
    isNightDimmingEnabled,
    language,
    resolvedClockLanguage,
    weather,
    pixelShift,
    pomodoroTimer,
  } = useSettings();

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

  const { isFullscreen, isSupported: isFullscreenSupported, toggleFullscreen } = useFullscreen();

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

  // 写真のアスペクト比管理（メタデータまたは画像ロード時に判定）
  const [photoAspectRatio, setPhotoAspectRatio] = useState<number | null>(() => {
    if (photo?.width && photo?.height && photo.width !== 1920 && photo.height !== 1080) {
      return photo.width / photo.height;
    }
    return null;
  });

  useEffect(() => {
    if (!photoUrl) return;

    if (photo?.width && photo?.height && photo.width !== 1920 && photo.height !== 1080) {
      setPhotoAspectRatio(photo.width / photo.height);
      return;
    }

    const img = new Image();
    img.src = photoUrl;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setPhotoAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
  }, [photoUrl, photo?.width, photo?.height]);

  // 利用可能なフレーム領域の計測
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isContain = photoFitMode === 'contain';

  const frameStyle = useMemo<React.CSSProperties>(() => {
    if (!isContain || !photoAspectRatio || !containerSize.width || !containerSize.height) {
      return {
        width: '100%',
        height: '100%',
      };
    }

    const containerRatio = containerSize.width / (containerSize.height || 1);

    if (photoAspectRatio > containerRatio) {
      // 写真が横長（幅にフィットさせ、上下に帯/余白を配置）
      return {
        width: '100%',
        height: 'auto',
        aspectRatio: `${photoAspectRatio}`,
        maxHeight: '100%',
        maxWidth: '100%',
      };
    } else {
      // 写真が縦長または正方形（高さにフィットさせ、左右に帯/余白を配置）
      return {
        height: '100%',
        width: 'auto',
        aspectRatio: `${photoAspectRatio}`,
        maxWidth: '100%',
        maxHeight: '100%',
      };
    }
  }, [isContain, photoAspectRatio, containerSize]);

  // キーボードショートカット体系
  useKeyboardShortcuts({
    isModalOpen,
    setIsModalOpen,
    isHelpOpen,
    setIsHelpOpen,
    isZenHide,
    setIsZenHide,
    toggleFullscreen,
    refreshPhoto,
    photo,
    isFavorite,
    toggleFavorite,
    pomodoroTimer,
    showToast,
    t,
  });

  // マウス動作時にコントローラーを表示し、3.5秒無操作でフェードアウト
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (!isModalOpen && !isHelpOpen) {
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

  // 無操作時または純粋アート鑑賞モード（Zen Hide）時にマウスポインターを非表示化（モーダル表示中は維持）
  const shouldHideCursor = isZenHide || (!isControlsVisible && !isModalOpen && !isHelpOpen);

  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (isZenHide) {
          setIsZenHide(false);
        }
      }}
      className={`relative w-screen h-screen overflow-hidden flex items-center justify-center select-none transition-all duration-700 ${
        shouldHideCursor ? 'cursor-none [&_*]:!cursor-none' : ''
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
      {/* メインビューポート（額装マットの内側領域） */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        {/* 写真・画像エリア（台紙の中央開口部。白い境界線なし、台紙の厚みによる陰影のみ） */}
        <div
          className={`relative flex items-center justify-center overflow-hidden transition-all duration-700 ${
            isGalleryMatteEnabled ? 'rounded-[2px]' : ''
          }`}
          style={{
            ...frameStyle,
            boxShadow: isGalleryMatteEnabled
              ? activeMatteColor === 'white'
                ? 'inset 0 2px 6px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15)'
                : 'inset 0 2px 6px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.35)'
              : undefined,
          }}
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
              onImageDimensionsLoaded={({ aspectRatio }) => {
                setPhotoAspectRatio(aspectRatio);
              }}
            />
          </div>

          {/* 中央: 時計表示 & 禅タイマー（設定オープン時は右側中央へスムーズにリバランス） */}
          <div
            className={`relative z-20 flex flex-col items-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isModalOpen ? 'md:translate-x-[220px] -translate-y-[14vh] md:translate-y-0' : 'translate-x-0 translate-y-0'
            } ${isZenHide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <main
              className="flex flex-col items-center"
              style={{
                transform: `translate3d(${pixelShift.offset.x}px, ${pixelShift.offset.y}px, 0)`,
              }}
            >
              <ClockDisplay
                timeFormat={timeFormat}
                typographyStyle={typographyStyle}
                language={resolvedClockLanguage}
                weather={weather.weather}
                isWeatherEnabled={weather.isEnabled}
                temperatureUnit={weather.unit}
              />
              <PomodoroTimerBar
                pomodoroTimer={pomodoroTimer}
                isControlsVisible={isControlsVisible && !isModalOpen && !isHelpOpen}
                language={language}
              />
            </main>
          </div>
        </div>
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
          onClick={() => setIsModalOpen((prev) => !prev)}
          aria-label={t('photoCredit.openSettings')}
          title={t('photoCredit.openSettings')}
          className={`w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md text-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200 ${
            isModalOpen ? 'bg-white text-stone-950 ring-2 ring-stone-400/50' : 'bg-white/60 hover:bg-white/85'
          }`}
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
        onRefreshPhoto={refreshPhoto}
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
