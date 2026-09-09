import { useState, useEffect, useRef } from 'react';
import { Menu, Maximize, Minimize } from 'lucide-react';
import { useClock } from './hooks/useClock';
import { usePhotoSettings } from './hooks/usePhotoSettings';
import { usePhotoManager } from './hooks/usePhotoManager';
import { usePhotoFavorites } from './hooks/usePhotoFavorites';
import { useFullscreen } from './hooks/useFullscreen';
import { useZenTimer } from './hooks/useZenTimer';
import { ClockDisplay } from './components/ClockDisplay';
import { ZenTimerBar } from './components/ZenTimerBar';
import { PhotoCredit } from './components/PhotoCredit';
import { SettingsModal } from './components/SettingsModal';
import { CinematicBackground } from './components/CinematicBackground';

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
  } = usePhotoSettings();

  const {
    favorites,
    history,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    addToHistory,
    clearHistory,
  } = usePhotoFavorites();

  const clock = useClock(timeFormat);
  const { isFullscreen, isSupported: isFullscreenSupported, toggleFullscreen } = useFullscreen();
  const zenTimer = useZenTimer();

  const { photo, photoUrl, refreshPhoto, applyStoredPhoto } = usePhotoManager(
    updateIntervalTime,
    selectedCollection,
    selectedTopic,
    addToHistory
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('modal') === 'true';
    } catch {
      return false;
    }
  });
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fキーによる全画面切り替えショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isModalOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, toggleFullscreen]);

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
    };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-stone-950 select-none"
    >
      {/* シネマティック背景レイヤー (Ken Burns & ダブルバッファクロスフェード) */}
      <CinematicBackground
        photoUrl={photoUrl}
        isCinematicMotionEnabled={isCinematicMotionEnabled}
      />

      {/* 左上: 操作コントロール群（設定メニュー & フルスクリーン） */}
      <div
        className={`fixed top-4 left-4 z-30 flex items-center space-x-2 transition-all duration-300 ${
          isControlsVisible || isModalOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Open settings"
          title="Settings"
          className="w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/60 hover:bg-white/85 text-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isFullscreenSupported && (
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
            className="w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/60 hover:bg-white/85 text-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* 右上: 撮影者クレジット & お気に入りボタン */}
      <PhotoCredit
        photo={photo}
        isVisible={isControlsVisible && !isModalOpen}
        isFavorite={photo ? isFavorite(photo.id) : false}
        onToggleFavorite={photo ? () => toggleFavorite(photo) : undefined}
      />

      {/* 中央: 時計表示 & 禅タイマー */}
      <main className="relative z-20 flex flex-col items-center">
        <ClockDisplay clock={clock} typographyStyle={typographyStyle} />
        <ZenTimerBar
          zenTimer={zenTimer}
          isControlsVisible={isControlsVisible && !isModalOpen}
        />
      </main>

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
        isZenTimerEnabled={zenTimer.isEnabled}
        setIsZenTimerEnabled={zenTimer.setIsEnabled}
        favorites={favorites}
        history={history}
        onSelectStoredPhoto={applyStoredPhoto}
        onRemoveFavorite={removeFavorite}
        onClearHistory={clearHistory}
      />
    </div>
  );
}
