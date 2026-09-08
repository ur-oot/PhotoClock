import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Check, Shuffle, RefreshCw, Heart, History, Trash2, ArrowUpRight } from 'lucide-react';
import type { UnsplashCollection, StoredPhoto } from '../types/unsplash';
import { INTERVAL_OPTIONS, type TimeFormat } from '../hooks/usePhotoSettings';

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
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  favorites: StoredPhoto[];
  history: StoredPhoto[];
  onSelectStoredPhoto: (photo: StoredPhoto) => void;
  onRemoveFavorite: (photoId: string) => void;
  onClearHistory: () => void;
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
  timeFormat,
  setTimeFormat,
  favorites,
  history,
  onSelectStoredPhoto,
  onRemoveFavorite,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'favorites' | 'history'>('general');
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
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-white/85 backdrop-blur-lg border-b border-stone-200/80">
        <div className="flex items-center space-x-6">
          <h2 className="text-lg font-bold tracking-tight text-stone-900 hidden sm:block">PhotoClock</h2>

          {/* ナビゲーションタブ */}
          <nav className="flex items-center space-x-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'general'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Settings & Collections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'favorites'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>Favorites</span>
              {favorites.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-rose-100 text-rose-700 rounded-full font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-stone-200 text-stone-700 rounded-full font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </nav>
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
        {activeTab === 'general' && (
          <>
            {/* ディスプレイ & アニメーション設定 */}
        <section className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Update Interval
            </h3>
            <div className="max-w-xs">
              <select
                value={updateIntervalTime}
                onChange={(e) => setUpdateIntervalTime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              Time between background updates.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Time Format
            </h3>
            <div className="flex items-center max-w-xs bg-stone-200/70 p-1 rounded-lg border border-stone-300">
              <button
                type="button"
                onClick={() => setTimeFormat('12h')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                  timeFormat === '12h'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                12-hour (AM/PM)
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat('24h')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                  timeFormat === '24h'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                24-hour
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              Choose 12-hour or 24-hour clock.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Cinematic Motion
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
              Smooth zoom and pan Ken Burns effect.
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
      </>
    )}

        {/* お気に入りタブ */}
        {activeTab === 'favorites' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Favorite Photos</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Photos you have saved. Click &ldquo;Apply as Background&rdquo; to instantly display any photo.
                </p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-md rounded-2xl border border-stone-200/80">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-stone-700">No favorite photos yet</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Click the heart icon on the photo attribution bar in the top-right corner to save photos you love.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-stone-200/80 flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                      <img
                        src={item.thumbUrl}
                        alt={item.description || `Photo by ${item.user.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-medium truncate max-w-[180px]">
                          By {item.user.name}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-stone-700 flex items-center space-x-0.5"
                          title="View high-res photo"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStoredPhoto(item);
                            onClose();
                          }}
                          className="flex-1 py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Apply as Background
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveFavorite(item.id)}
                          title="Remove from favorites"
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 履歴タブ */}
        {activeTab === 'history' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                  <History className="w-4 h-4 text-stone-700" />
                  <span>Recent History</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Recently displayed background photos. Click &ldquo;Apply as Background&rdquo; to re-show past photos.
                </p>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-stone-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-md rounded-2xl border border-stone-200/80">
                <History className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-stone-700">No history recorded yet</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Photos displayed on PhotoClock are automatically saved here for quick re-display.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div
                    key={`${item.id}-${item.savedAt}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-stone-200/80 flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                      <img
                        src={item.thumbUrl}
                        alt={item.description || `Photo by ${item.user.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-medium truncate max-w-[180px]">
                          By {item.user.name}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-stone-700 flex items-center space-x-0.5"
                          title="View high-res photo"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStoredPhoto(item);
                            onClose();
                          }}
                          className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Apply as Background
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* フッター */}
      <footer className="py-4 text-center text-xs text-stone-500 bg-white/50 border-t border-stone-200/50">
        PhotoClock | Built with React, Vite & Unsplash API
      </footer>
    </div>
  );
};
