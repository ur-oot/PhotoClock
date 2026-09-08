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
