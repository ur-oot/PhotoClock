import { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { useClock } from './hooks/useClock';
import { usePhotoSettings } from './hooks/usePhotoSettings';
import { usePhotoManager } from './hooks/usePhotoManager';
import { ClockDisplay } from './components/ClockDisplay';
import { PhotoCredit } from './components/PhotoCredit';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const clock = useClock();
  const {
    updateIntervalTime,
    setUpdateIntervalTime,
    selectedCollection,
    setSelectedCollection,
  } = usePhotoSettings();

  const { photo, photoUrl, refreshPhoto } = usePhotoManager(
    updateIntervalTime,
    selectedCollection
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // マウス動作時にコントローラーを表示し、3秒無操作でフェードアウト
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
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-stone-900 select-none"
    >
      {/* 背景画像レイヤー */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-100"
        style={{
          backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
        }}
      >
        {/* コントラストを高めるための微小なオーバーレイ */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* 左上: 設定メニューボタン */}
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label="Open settings"
        className={`fixed top-4 left-4 z-20 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/60 hover:bg-white/85 text-stone-800 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 ${
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
      <main className="relative z-10">
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
      />
    </div>
  );
}
