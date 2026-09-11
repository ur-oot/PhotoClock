import { useState } from 'react';
import { getSafeStorageItem, setSafeStorageItem } from '../../utils/storage';

export type TimeFormat = '12h' | '24h';
export type TypographyStyle = 'sans' | 'serif' | 'mono';

export interface TypographyOption {
  id: TypographyStyle;
  label: string;
  description: string;
  fontClass: string;
  sample: string;
}

export const TYPOGRAPHY_OPTIONS: TypographyOption[] = [
  {
    id: 'sans',
    label: 'Modern Sans',
    description: 'Clean and contemporary',
    fontClass: 'font-sans',
    sample: '12:45',
  },
  {
    id: 'serif',
    label: 'Classic Serif',
    description: 'Elegant and editorial',
    fontClass: 'font-serif',
    sample: '12:45',
  },
  {
    id: 'mono',
    label: 'Monospace',
    description: 'Minimal and structured',
    fontClass: 'font-mono',
    sample: '12:45',
  },
];

const STORAGE_KEY_TIME_FORMAT = 'photoclock_time_format';
const STORAGE_KEY_TYPOGRAPHY = 'photoclock_typography_style';

/**
 * 時計の時刻形式およびフォントタイポグラフィの設定フック
 */
export function useClockSettings() {
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_TIME_FORMAT);
    if (saved === '12h' || saved === '24h') {
      return saved;
    }
    return '12h';
  });

  const [typographyStyle, setTypographyStyleState] = useState<TypographyStyle>(() => {
    const saved = getSafeStorageItem(STORAGE_KEY_TYPOGRAPHY);
    if (saved === 'sans' || saved === 'serif' || saved === 'mono') {
      return saved;
    }
    return 'sans';
  });

  const setTimeFormat = (format: TimeFormat) => {
    setTimeFormatState(format);
    setSafeStorageItem(STORAGE_KEY_TIME_FORMAT, format);
  };

  const setTypographyStyle = (style: TypographyStyle) => {
    setTypographyStyleState(style);
    setSafeStorageItem(STORAGE_KEY_TYPOGRAPHY, style);
  };

  return {
    timeFormat,
    setTimeFormat,
    typographyStyle,
    setTypographyStyle,
  };
}
