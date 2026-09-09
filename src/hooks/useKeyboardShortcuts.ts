import { useEffect } from 'react';
import type { UnsplashPhoto } from '../types/unsplash';
import type { usePomodoroTimer } from './usePomodoroTimer';

interface KeyboardShortcutsOptions {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isHelpOpen: boolean;
  setIsHelpOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isZenHide: boolean;
  setIsZenHide: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFullscreen: () => void;
  refreshPhoto: () => void;
  photo: UnsplashPhoto | null;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (photo: UnsplashPhoto) => void;
  pomodoroTimer: ReturnType<typeof usePomodoroTimer>;
  showToast: (message: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function useKeyboardShortcuts({
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
}: KeyboardShortcutsOptions) {
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
          showToast(
            willBeFavorite
              ? t('toast.addedToFavorites')
              : t('toast.removedFromFavorites')
          );
        }
        return;
      }

      // Tキー: ポモドーロタイマーの開始/一時停止
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        if (!pomodoroTimer.isEnabled) {
          pomodoroTimer.setIsEnabled(true);
          pomodoroTimer.start();
          showToast(t('toast.pomodoroTimerStarted'));
        } else {
          const nextRunning = !pomodoroTimer.isRunning;
          pomodoroTimer.togglePlay();
          showToast(
            nextRunning
              ? t('toast.pomodoroTimerResumed')
              : t('toast.pomodoroTimerPaused')
          );
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
  ]);
}
