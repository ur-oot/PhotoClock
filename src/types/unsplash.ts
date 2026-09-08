export interface UnsplashUser {
  id: string;
  name: string;
  username: string;
  profile_image: {
    small: string;
    medium?: string;
    large?: string;
  };
  links?: {
    html: string;
  };
}

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  description?: string | null;
  alt_description?: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    html: string;
    download_location: string;
  };
  user: UnsplashUser;
}

export interface UnsplashCollection {
  id: string | number;
  title: string;
  description?: string | null;
  total_photos: number;
  cover_photo?: {
    urls: {
      small: string;
      regular: string;
    };
  };
  preview_photos: Array<{
    id: string;
    urls: {
      small: string;
      regular?: string;
    };
  }>;
}

export interface PhotoSettings {
  updateIntervalTime: number; // in seconds
  selectedCollection: UnsplashCollection | null;
}

export interface PhotoTopic {
  id: string;
  name: string;
  emoji: string;
}

export const PHOTO_TOPICS: PhotoTopic[] = [
  { id: 'all', name: 'Random All', emoji: '✨' },
  { id: 'wallpapers', name: 'Wallpapers', emoji: '🖼️' },
  { id: 'nature', name: 'Nature', emoji: '🌿' },
  { id: 'travel', name: 'Travel', emoji: '✈️' },
  { id: 'architecture-interior', name: 'Architecture', emoji: '🏛️' },
  { id: 'street-photography', name: 'Street', emoji: '📸' },
  { id: 'textures-patterns', name: 'Textures', emoji: '🎨' },
  { id: 'film', name: 'Film & Vintage', emoji: '🎞️' },
  { id: 'animals', name: 'Animals', emoji: '🐾' },
  { id: 'spirituality', name: 'Zen & Calm', emoji: '🧘' },
  { id: 'monochrome', name: 'Monochrome', emoji: '🖤' },
];
