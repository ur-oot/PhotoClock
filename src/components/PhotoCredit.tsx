import React from 'react';
import { Heart, Download } from 'lucide-react';
import type { UnsplashPhoto } from '../types/unsplash';

interface PhotoCreditProps {
  photo: UnsplashPhoto | null;
  isVisible: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const PhotoCredit: React.FC<PhotoCreditProps> = ({
  photo,
  isVisible,
  isFavorite = false,
  onToggleFavorite,
}) => {
  if (!photo) return null;

  const user = photo.user;
  const utmSuffix = '?utm_source=photoclock&utm_medium=referral';
  const userProfileUrl = `https://unsplash.com/@${user.username}${utmSuffix}`;
  const unsplashHomeUrl = `https://unsplash.com/${utmSuffix}`;

  return (
    <aside
      aria-label="Photo attribution"
      className={`absolute top-4 right-4 z-20 backdrop-blur-md bg-white/70 hover:bg-white/90 transition-all duration-300 rounded-full pl-3.5 pr-2 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center space-x-2.5 text-xs text-stone-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      <span className="text-stone-500">Photo by</span>

      {user.profile_image?.small && (
        <a href={userProfileUrl} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={user.profile_image.small}
            alt={user.name}
            className="w-6 h-6 rounded-full object-cover shadow-sm hover:ring-2 hover:ring-stone-400 transition-all"
          />
        </a>
      )}

      <div className="flex items-center space-x-1 font-medium">
        <a
          href={userProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-stone-900 font-semibold"
        >
          {user.name}
        </a>
        <span className="text-stone-400">on</span>
        <a
          href={unsplashHomeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-stone-900 font-semibold"
        >
          Unsplash
        </a>
      </div>

      <div className="flex items-center space-x-1 pl-1 border-l border-stone-300/80">
        {/* お気に入り（Like）ボタン */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className="p-1 rounded-full hover:bg-stone-200/70 transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500 scale-110'
                  : 'text-stone-500 hover:text-rose-500'
              }`}
            />
          </button>
        )}

        {/* 元画像ダウンロード/表示リンク */}
        <a
          href={photo.urls.full}
          target="_blank"
          rel="noopener noreferrer"
          download
          title="Open original high-res photo"
          aria-label="Open original high-res photo"
          className="p-1 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/70 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
