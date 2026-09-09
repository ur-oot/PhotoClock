export type LanguageMode = 'auto' | 'en' | 'ja';
export type ClockLanguageMode = 'sync' | 'en' | 'ja';
export type ResolvedLanguage = 'en' | 'ja';

export interface TranslationDictionary {
  common: {
    enabled: string;
    disabled: string;
    active: string;
    close: string;
    selected: string;
    remove: string;
  };
  clock: {
    am: string;
    pm: string;
  };
  settings: {
    title: string;
    changePhotoNow: string;
    tabs: {
      general: string;
      favorites: string;
      history: string;
    };
    general: {
      languageTitle: string;
      languageDesc: string;
      languageAuto: string;
      languageEn: string;
      languageJa: string;
      clockLanguageTitle: string;
      clockLanguageDesc: string;
      clockLanguageSync: string;
      clockLanguageEn: string;
      clockLanguageJa: string;
      updateIntervalTitle: string;
      updateIntervalDesc: string;
      timeFormatTitle: string;
      timeFormatDesc: string;
      timeFormat12: string;
      timeFormat24: string;
      typographyTitle: string;
      typographyDesc: string;
      typographySans: string;
      typographySansDesc: string;
      typographySerif: string;
      typographySerifDesc: string;
      typographyMono: string;
      typographyMonoDesc: string;
      zenTimerTitle: string;
      zenTimerDesc: string;
      cinematicMotionTitle: string;
      cinematicMotionDesc: string;
      screenAwakeTitle: string;
      screenAwakeDesc: string;
      burnInTitle: string;
      burnInDesc: string;
      galleryMatteTitle: string;
      galleryMatteDesc: string;
      matteAuto: string;
      matteWhite: string;
      matteBlack: string;
      sunMoodTitle: string;
      sunMoodDesc: string;
      nightDimmingTitle: string;
      nightDimmingDesc: string;
    };
    topics: {
      title: string;
      desc: string;
      customActive: string;
      sunAwareActive: string;
      all: string;
      wallpapers: string;
      nature: string;
      travel: string;
      architecture: string;
      street: string;
      textures: string;
      film: string;
      animals: string;
      spirituality: string;
      monochrome: string;
    };
    collections: {
      title: string;
      desc: string;
      randomWallpapers: string;
      randomWallpapersDesc: string;
      loadMore: string;
      photosCount: string;
    };
    favorites: {
      title: string;
      desc: string;
      emptyTitle: string;
      emptyDesc: string;
      apply: string;
      viewOnUnsplash: string;
    };
    history: {
      title: string;
      desc: string;
      clearAll: string;
      emptyTitle: string;
      emptyDesc: string;
      apply: string;
      viewOnUnsplash: string;
    };
  };
  solarPhases: {
    morning: string;
    day: string;
    goldenHour: string;
    night: string;
  };
  shortcuts: {
    title: string;
    space: string;
    h: string;
    l: string;
    t: string;
    f: string;
    help: string;
    esc: string;
  };
  photoCredit: {
    by: string;
    on: string;
    addFavorite: string;
    removeFavorite: string;
    openSettings: string;
    fullscreenEnter: string;
    fullscreenExit: string;
    shortcutsHelp: string;
  };
  zenTimer: {
    focus: string;
    break: string;
    tooltip: string;
    start: string;
    pause: string;
    resume: string;
    reset: string;
    skip: string;
  };
  toast: {
    changingPhoto: string;
    addedToFavorites: string;
    removedFromFavorites: string;
    zenTimerStarted: string;
    zenTimerPaused: string;
    zenTimerResumed: string;
    historyCleared: string;
  };
}

// 辞書オブジェクトからドット区切りのキーパスを型として抽出する再帰型
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

type Leaves<T> = T extends object
  ? { [K in keyof T]-?: Join<K, Leaves<T[K]>> }[keyof T]
  : '';

export type TranslationKey = Leaves<TranslationDictionary>;
