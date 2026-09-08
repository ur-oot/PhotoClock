import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Check, Shuffle, RefreshCw } from 'lucide-react';
import type { UnsplashCollection } from '../types/unsplash';
import { INTERVAL_OPTIONS } from '../hooks/usePhotoSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateIntervalTime: number;
  setUpdateIntervalTime: (seconds: number) => void;
  selectedCollection: UnsplashCollection | null;
  setSelectedCollection: (collection: UnsplashCollection | null) => void;
  onRefreshPhoto: () => void;
  isCinematicMotionEnabled: boolean;
  setIsCinematicMotionEnabled: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  updateIntervalTime,
  setUpdateIntervalTime,
  selectedCollection,
  setSelectedCollection,
  onRefreshPhoto,
  isCinematicMotionEnabled,
  setIsCinematicMotionEnabled,
}) => {
  const [collections, setCollections] = useState<UnsplashCollection[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState<boolean>(false);

  // 初回表示時にコレクション一覧を取得
  useEffect(() => {
    if (isOpen && !hasLoadedInitial) {
      fetchCollections(1);
      setHasLoadedInitial(true);
    }
  }, [isOpen, hasLoadedInitial]);

  const fetchCollections = async (pageToFetch: number) => {
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/collections?page=${pageToFetch}&perPage=12`);
      if (res.ok) {
        const data: UnsplashCollection[] = await res.json();
        if (Array.isArray(data)) {
          setCollections((prev) => (pageToFetch === 1 ? data : [...prev, ...data]));
          setPage(pageToFetch);
        }
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchCollections(page + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex flex-col transition-all">
      {/* モーダルヘッダー */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-lg border-b border-stone-200/80">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold tracking-tight text-stone-900">PhotoClock Settings</h2>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              onRefreshPhoto();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
            title="Update background image now"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change photo now</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
        {/* ディスプレイ & アニメーション設定 */}
        <section className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Update Interval
            </h3>
            <div className="max-w-xs">
              <select
                value={updateIntervalTime}
                onChange={(e) => setUpdateIntervalTime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              Time between automatic background wallpaper updates.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Cinematic Motion (Ken Burns)
            </h3>
            <div className="flex items-center justify-between max-w-xs bg-white px-4 py-2 border border-stone-300 rounded-lg shadow-sm">
              <span className="text-sm text-stone-800 font-medium">
                {isCinematicMotionEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                type="button"
                onClick={() => setIsCinematicMotionEnabled(!isCinematicMotionEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isCinematicMotionEnabled ? 'bg-blue-600' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={isCinematicMotionEnabled}
                aria-label="Toggle cinematic motion"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isCinematicMotionEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              Slowly zooms and pans images like Apple TV screensavers.
            </p>
          </div>
        </section>

        {/* コレクション選択 */}
        <section className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                Choose Collection
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Select a collection to only show photos from it, or select random wallpapers.
              </p>
            </div>

            {selectedCollection && (
              <button
                onClick={() => setSelectedCollection(null)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Reset to Random Wallpapers</span>
              </button>
            )}
          </div>

          {/* グリッドレイアウト */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((item) => {
              const isSelected = selectedCollection?.id === item.id;
              const previews = item.preview_photos || [];

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border-2 ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  {/* 3分割プレビューサムネイル */}
                  <a
                    href={`https://unsplash.com/collections/${item.id}?utm_source=photoclock&utm_medium=referral`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-[16/10] bg-stone-100 flex overflow-hidden group/thumb"
                  >
                    {previews[0]?.urls?.small && (
                      <div className="w-[70%] h-full relative">
                        <img
                          src={previews[0].urls.small}
                          alt=""
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="w-[30%] h-full flex flex-col pl-0.5 space-y-0.5">
                      {previews[1]?.urls?.small && (
                        <div className="h-1/2 relative overflow-hidden">
                          <img
                            src={previews[1].urls.small}
                            alt=""
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      {previews[2]?.urls?.small && (
                        <div className="h-1/2 relative overflow-hidden">
                          <img
                            src={previews[2].urls.small}
                            alt=""
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center space-x-1">
                      <span>View on Unsplash</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  </a>

                  {/* タイトルと選択ボタン */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.total_photos} photos
                      </p>
                    </div>

                    <div className="mt-4">
                      {isSelected ? (
                        <button
                          disabled
                          className="w-full py-1.5 px-3 bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-default"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCollection(item);
                            onClose();
                          }}
                          className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Select this collection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* もっと読み込むボタン */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2.5 bg-white border border-stone-300 text-stone-800 font-medium text-sm rounded-lg hover:bg-stone-50 shadow-sm transition-all disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading collections...' : 'Load more collections'}
            </button>
          </div>
        </section>
      </div>

      {/* フッター */}
      <footer className="py-4 text-center text-xs text-stone-500 bg-white/50 border-t border-stone-200/50">
        PhotoClock | Built with React, Vite & Unsplash API
      </footer>
    </div>
  );
};
