import { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { useClock } from './hooks/useClock';
import { usePhotoSettings } from './hooks/usePhotoSettings';
import { usePhotoManager } from './hooks/usePhotoManager';
import { ClockDisplay } from './components/ClockDisplay';
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
  } = usePhotoSettings();

  const clock = useClock(timeFormat);

  const { photo, photoUrl, refreshPhoto } = usePhotoManager(
    updateIntervalTime,
    selectedCollection,
    selectedTopic
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

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

      {/* 左上: 設定メニューボタン */}
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label="Open settings"
        className={`fixed top-4 left-4 z-30 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/60 hover:bg-white/85 text-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 ${
          isControlsVisible || isModalOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 右上: 撮影者クレジット */}
      <PhotoCredit photo={photo} isVisible={isControlsVisible && !isModalOpen} />

      {/* 中央: 時計表示 */}
      <main className="relative z-20">
        <ClockDisplay clock={clock} />
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
      />
    </div>
  );
}
