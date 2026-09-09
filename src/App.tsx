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
    isGalleryMatteEnabled,
    setIsGalleryMatteEnabled,
    matteColor,
    setMatteColor,
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

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
      className={`relative w-screen h-screen overflow-hidden flex items-center justify-center select-none transition-all duration-700 ${
        isGalleryMatteEnabled
          ? 'p-2 sm:p-4 md:p-6 lg:p-8'
          : 'p-0'
      }`}
      style={{
        backgroundColor: isGalleryMatteEnabled ? '#141210' : '#0c0a09',
        backgroundImage: isGalleryMatteEnabled
          ? 'radial-gradient(ellipse 90% 70% at 50% 15%, rgba(55, 48, 42, 0.45) 0%, rgba(20, 18, 16, 0.95) 75%, #0d0b0a 100%)'
          : 'none',
      }}
    >
      {/* 1層目: 木のフレーム（外枠） */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${
          isGalleryMatteEnabled
            ? 'p-2.5 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_10px_25px_-5px_rgba(0,0,0,0.7)]'
            : 'p-0'
        }`}
        style={
          isGalleryMatteEnabled
            ? {
                background:
                  'linear-gradient(135deg, #3f2f25 0%, #2b1f18 35%, #382920 70%, #1f1611 100%)',
                borderTop: '1px solid rgba(130, 100, 75, 0.35)',
                borderLeft: '1px solid rgba(130, 100, 75, 0.25)',
                borderRight: '1px solid rgba(15, 10, 8, 0.7)',
                borderBottom: '1px solid rgba(15, 10, 8, 0.8)',
                boxShadow:
                  '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 10px 25px -5px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.15), inset 0 -1px 3px rgba(0, 0, 0, 0.6)',
              }
            : undefined
        }
      >
        {/* 2層目: 台紙（白系 または 黒系） */}
        <div
          className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${
            isGalleryMatteEnabled
              ? 'p-3 sm:p-6 md:p-10 lg:p-14 rounded-sm'
              : 'p-0'
          }`}
          style={
            isGalleryMatteEnabled
              ? {
                  backgroundColor: matteColor === 'white' ? '#ede9e2' : '#1c1a19',
                  boxShadow:
                    matteColor === 'white'
                      ? 'inset 0 3px 12px rgba(0, 0, 0, 0.35), inset 0 0 3px rgba(0, 0, 0, 0.15)'
                      : 'inset 0 3px 12px rgba(0, 0, 0, 0.65), inset 0 0 3px rgba(0, 0, 0, 0.4)',
                }
              : undefined
          }
        >
          {/* 3層目: 画像・写真（白い境界線なし、台紙の厚みによる陰影のみ） */}
          <div
            className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-700 ${
              isGalleryMatteEnabled ? 'rounded-[2px]' : ''
            }`}
            style={
              isGalleryMatteEnabled
                ? {
                    boxShadow:
                      'inset 0 3px 10px rgba(0, 0, 0, 0.45), inset 0 1px 3px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)',
                  }
                : undefined
            }
          >
            {/* シネマティック背景レイヤー (Ken Burns & ダブルバッファクロスフェード) */}
            <CinematicBackground
              photoUrl={photoUrl}
              isCinematicMotionEnabled={isCinematicMotionEnabled}
            />

            {/* 左上: 操作コントロール群（設定メニュー & フルスクリーン） */}
            <div
              className={`absolute top-4 left-4 z-30 flex items-center space-x-2 transition-all duration-300 ${
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
          </div>
        </div>
      </div>

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
        isGalleryMatteEnabled={isGalleryMatteEnabled}
        setIsGalleryMatteEnabled={setIsGalleryMatteEnabled}
        matteColor={matteColor}
        setMatteColor={setMatteColor}
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
