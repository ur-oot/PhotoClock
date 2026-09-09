import { useState, useEffect, useRef, useCallback } from 'react';
import type { UnsplashPhoto, UnsplashCollection, StoredPhoto } from '../types/unsplash';
import { getSolarMoodInfo } from '../utils/sunCalc';

export function usePhotoManager(
  updateIntervalTime: number,
  selectedCollection: UnsplashCollection | null,
  selectedTopic?: string,
  onPhotoLoaded?: (photo: UnsplashPhoto) => void,
  isSunMoodEnabled: boolean = true
) {
  const [photo, setPhoto] = useState<UnsplashPhoto | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isErrored, setIsErrored] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ダウンロードトラッキング
  const trackDownload = useCallback(async (downloadLocation?: string) => {
    if (!downloadLocation) return;
    try {
      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: downloadLocation }),
      });
    } catch {
      // ignore
    }
  }, []);

  // 写真取得ロジック
  const fetchPhoto = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = '/api/photo-random';
      if (selectedCollection) {
        endpoint = `/api/photo-collection?collectionId=${selectedCollection.id}&totalPhotos=${selectedCollection.total_photos || 10}`;
      } else if (selectedTopic && selectedTopic !== 'all') {
        endpoint = `/api/photo-random?topics=${encodeURIComponent(selectedTopic)}`;
      } else if (isSunMoodEnabled) {
        const mood = getSolarMoodInfo();
        endpoint = `/api/photo-random?query=${encodeURIComponent(mood.query)}`;
      }

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      const data: UnsplashPhoto = await res.json();
      setPhoto(data);
      setPhotoUrl(data.urls.full);
      setIsErrored(false);
      onPhotoLoaded?.(data);

      if (data.links?.download_location) {
        trackDownload(data.links.download_location);
      }
    } catch (err) {
      console.error('Failed to load photo:', err);
      setIsErrored(true);
      // 太陽フェーズに応じた高品質フォールバック画像
      const fallback = isSunMoodEnabled
        ? getSolarMoodInfo().fallbackUrl
        : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80';
      setPhotoUrl(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection, selectedTopic, onPhotoLoaded, trackDownload, isSunMoodEnabled]);

  // タイマー更新のスケジュール
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // コレクション変更時、またはマウント時に即座に取得
    fetchPhoto();

    // 次回更新をスケジュール
    const intervalMs = Math.max(30, updateIntervalTime) * 1000;
    const scheduleNext = () => {
      timerRef.current = setTimeout(async () => {
        await fetchPhoto();
        scheduleNext();
      }, intervalMs);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [fetchPhoto, updateIntervalTime]);

  const applyStoredPhoto = useCallback(
    (stored: StoredPhoto) => {
      const pseudoPhoto: UnsplashPhoto = {
        id: stored.id,
        width: 1920,
        height: 1080,
        description: stored.description,
        urls: {
          raw: stored.url,
          full: stored.url,
          regular: stored.url,
          small: stored.thumbUrl,
          thumb: stored.thumbUrl,
        },
        links: {
          html: stored.user.html,
          download_location: stored.downloadLocation || '',
        },
        user: {
          id: stored.user.username,
          name: stored.user.name,
          username: stored.user.username,
          profile_image: { small: '' },
          links: { html: stored.user.html },
        },
      };
      setPhoto(pseudoPhoto);
      setPhotoUrl(stored.url);
      setIsErrored(false);
      if (stored.downloadLocation) {
        trackDownload(stored.downloadLocation);
      }
    },
    [trackDownload]
  );

  return {
    photo,
    photoUrl,
    isLoading,
    isErrored,
    refreshPhoto: fetchPhoto,
    applyStoredPhoto,
  };
}
