import React from 'react';
import type { UnsplashPhoto } from '../types/unsplash';

interface PhotoCreditProps {
  photo: UnsplashPhoto | null;
  isVisible: boolean;
}

export const PhotoCredit: React.FC<PhotoCreditProps> = ({ photo, isVisible }) => {
  if (!photo) return null;

  const user = photo.user;
  const utmSuffix = '?utm_source=photoclock&utm_medium=referral';
  const userProfileUrl = `https://unsplash.com/@${user.username}${utmSuffix}`;
  const unsplashHomeUrl = `https://unsplash.com/${utmSuffix}`;

  return (
    <aside
      aria-label="Photo attribution"
      className={`fixed top-4 right-4 z-20 backdrop-blur-md bg-white/60 hover:bg-white/80 transition-all duration-300 rounded-full px-3.5 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center space-x-2 text-xs text-stone-700 ${
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
    </aside>
  );
};
