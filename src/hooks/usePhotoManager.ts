import { useState, useEffect, useRef, useCallback } from 'react';
import type { UnsplashPhoto, UnsplashCollection } from '../types/unsplash';

export function usePhotoManager(
  updateIntervalTime: number,
  selectedCollection: UnsplashCollection | null
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

      if (data.links?.download_location) {
        trackDownload(data.links.download_location);
      }
    } catch (err) {
      console.error('Failed to load photo:', err);
      setIsErrored(true);
      // フォールバック用の高品質壁紙画像
      setPhotoUrl('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection, trackDownload]);

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

  return {
    photo,
    photoUrl,
    isLoading,
    isErrored,
    refreshPhoto: fetchPhoto,
  };
}
