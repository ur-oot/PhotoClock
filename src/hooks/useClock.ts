import { useState, useEffect } from 'react';
import type { TimeFormat } from './usePhotoSettings';
import type { ResolvedLanguage } from '../locales';

export interface ClockState {
  year: string;
  month: string;
  day: string;
  dayOfWeek: string;
  hours: string;
  minutes: string;
  seconds: string;
  meridian: string;
}

function getOrdinalDay(day: number): string {
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return `${day}st`;
  if (j === 2 && k !== 12) return `${day}nd`;
  if (j === 3 && k !== 13) return `${day}rd`;
  return `${day}th`;
}

function getNowClockState(
  timeFormat: TimeFormat = '12h',
  language: ResolvedLanguage = 'en'
): ClockState {
  const now = new Date();
  const day = now.getDate();
  const rawHours = now.getHours();
  const localeCode = language === 'ja' ? 'ja-JP' : 'en-US';

  const monthFormatter = new Intl.DateTimeFormat(localeCode, { month: 'long' });
  const weekdayFormatter = new Intl.DateTimeFormat(localeCode, { weekday: 'long' });

  let displayHours: number;
  let meridian = '';

  if (timeFormat === '12h') {
    meridian = rawHours >= 12 ? 'pm' : 'am';
    displayHours = rawHours % 12 || 12;
  } else {
    displayHours = rawHours;
  }

  const formattedDay = language === 'ja' ? `${day}日` : getOrdinalDay(day);

  return {
    year: String(now.getFullYear()),
    month: monthFormatter.format(now),
    day: formattedDay,
    dayOfWeek: weekdayFormatter.format(now),
    hours: String(displayHours).padStart(2, '0'),
    minutes: String(now.getMinutes()).padStart(2, '0'),
    seconds: String(now.getSeconds()).padStart(2, '0'),
    meridian,
  };
}

export function useClock(
  timeFormat: TimeFormat = '12h',
  language: ResolvedLanguage = 'en'
): ClockState {
  const [clock, setClock] = useState<ClockState>(() => getNowClockState(timeFormat, language));

  useEffect(() => {
    let timerId: number | undefined;

    const tick = () => {
      setClock(getNowClockState(timeFormat, language));

      // 次の正秒（ミリ秒が0になるタイミング）までの残り時間を計算
      // 早期発火による同一秒の重複更新を防止するため、数msの安全マージン(+4ms)を加算
      const now = Date.now();
      const delay = 1000 - (now % 1000) + 4;
      timerId = window.setTimeout(tick, delay);
    };

    tick();

    // バックグラウンド復帰時の即時同期
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeFormat, language]);

  return clock;
}
