import React, { useState } from 'react';
import { Heart, History, Trash2, ArrowUpRight } from 'lucide-react';
import type { StoredPhoto } from '../../types/unsplash';
import type { LanguageMode } from '../../hooks/usePhotoSettings';
import { useTranslation } from '../../hooks/useTranslation';

interface LibrarySettingsTabProps {
  language: LanguageMode;
  favorites: StoredPhoto[];
  history: StoredPhoto[];
  onSelectStoredPhoto: (photo: StoredPhoto) => void;
  onRemoveFavorite: (photoId: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const LibrarySettingsTab: React.FC<LibrarySettingsTabProps> = ({
  language,
  favorites,
  history,
  onSelectStoredPhoto,
  onRemoveFavorite,
  onClearHistory,
  onClose,
}) => {
  const { t } = useTranslation(language);
  const [librarySubTab, setLibrarySubTab] = useState<'favorites' | 'history'>('favorites');

  return (
    <div className="space-y-4">
      {/* サブタブ切り替え & アクション */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-stone-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setLibrarySubTab('favorites')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              librarySubTab === 'favorites'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{t('settings.tabs.favorites')}</span>
            {favorites.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-rose-100 text-rose-700 rounded-full font-bold">
                {favorites.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setLibrarySubTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              librarySubTab === 'history'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('settings.tabs.history')}</span>
            {history.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-stone-200 text-stone-700 rounded-full font-bold">
                {history.length}
              </span>
            )}
          </button>
        </div>

        {librarySubTab === 'history' && history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-stone-200/80 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('settings.history.clearAll')}</span>
          </button>
        )}
      </div>

      {/* サブタブコンテンツ */}
      {librarySubTab === 'favorites' ? (
        favorites.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/80 rounded-2xl border border-stone-200/80">
            <Heart className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
            <h4 className="text-sm font-semibold text-stone-700">
              {t('settings.favorites.emptyTitle')}
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {t('settings.favorites.emptyDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all border border-stone-200/80 flex flex-col"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.thumbUrl}
                    alt={item.description || `Photo by ${item.user.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-700 font-medium truncate max-w-[160px]">
                      {language === 'ja' ? `撮影: ${item.user.name}` : `By ${item.user.name}`}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-stone-700 flex items-center space-x-0.5"
                      title={t('settings.favorites.viewOnUnsplash')}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectStoredPhoto(item);
                        onClose();
                      }}
                      className="flex-1 py-1 px-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {t('settings.favorites.apply')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFavorite(item.id)}
                      title={t('common.remove')}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : history.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/80 rounded-2xl border border-stone-200/80">
          <History className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
          <h4 className="text-sm font-semibold text-stone-700">
            {t('settings.history.emptyTitle')}
          </h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {t('settings.history.emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {history.map((item) => (
            <div
              key={`${item.id}-${item.savedAt}`}
              className="group bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all border border-stone-200/80 flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                <img
                  src={item.thumbUrl}
                  alt={item.description || `Photo by ${item.user.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-700 font-medium truncate max-w-[160px]">
                    {language === 'ja' ? `撮影: ${item.user.name}` : `By ${item.user.name}`}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-stone-700 flex items-center space-x-0.5"
                    title={t('settings.history.viewOnUnsplash')}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectStoredPhoto(item);
                      onClose();
                    }}
                    className="w-full py-1 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {t('settings.history.apply')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
