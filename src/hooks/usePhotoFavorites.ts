import { useState, useCallback } from 'react';
import type { UnsplashPhoto, StoredPhoto } from '../types/unsplash';

const STORAGE_KEY_FAVORITES = 'photoclock_favorites';
const STORAGE_KEY_HISTORY = 'photoclock_history';
const MAX_HISTORY_COUNT = 30;

function convertToStoredPhoto(photo: UnsplashPhoto): StoredPhoto {
  return {
    id: photo.id,
    url: photo.urls.full,
    thumbUrl: photo.urls.small || photo.urls.thumb,
    description: photo.description || photo.alt_description,
    downloadLocation: photo.links?.download_location,
    user: {
      name: photo.user.name,
      username: photo.user.username,
      html: photo.user.links?.html || `https://unsplash.com/@${photo.user.username}`,
    },
    savedAt: Date.now(),
  };
}

export function usePhotoFavorites() {
  const [favorites, setFavorites] = useState<StoredPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [history, setHistory] = useState<StoredPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // お気に入りかどうかの判定
  const isFavorite = useCallback(
    (photoId: string): boolean => {
      return favorites.some((p) => p.id === photoId);
    },
    [favorites]
  );

  // お気に入りのトグル
  const toggleFavorite = useCallback(
    (photo: UnsplashPhoto | StoredPhoto) => {
      setFavorites((prev) => {
        const exists = prev.some((p) => p.id === photo.id);
        let updated: StoredPhoto[];
        if (exists) {
          updated = prev.filter((p) => p.id !== photo.id);
        } else {
          const stored: StoredPhoto =
            'urls' in photo
              ? convertToStoredPhoto(photo as UnsplashPhoto)
              : { ...(photo as StoredPhoto), savedAt: Date.now() };
          updated = [stored, ...prev];
        }
        try {
          localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  // お気に入りからの削除
  const removeFavorite = useCallback((photoId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((p) => p.id !== photoId);
      try {
        localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // 閲覧履歴への追加
  const addToHistory = useCallback((photo: UnsplashPhoto) => {
    if (!photo || !photo.id) return;
    setHistory((prev) => {
      // 重複を除去して先頭に追加
      const filtered = prev.filter((p) => p.id !== photo.id);
      const updated = [convertToStoredPhoto(photo), ...filtered].slice(0, MAX_HISTORY_COUNT);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // 履歴の全消去
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {
      // ignore
    }
  }, []);

  return {
    favorites,
    history,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    addToHistory,
    clearHistory,
  };
}
