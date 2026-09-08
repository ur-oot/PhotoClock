import { useState, useEffect } from 'react';
import type { TimeFormat } from './usePhotoSettings';

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

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });

function getOrdinalDay(day: number): string {
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return `${day}st`;
  if (j === 2 && k !== 12) return `${day}nd`;
  if (j === 3 && k !== 13) return `${day}rd`;
  return `${day}th`;
}

function getNowClockState(timeFormat: TimeFormat = '12h'): ClockState {
  const now = new Date();
  const day = now.getDate();
  const rawHours = now.getHours();

  let displayHours: number;
  let meridian = '';

  if (timeFormat === '12h') {
    meridian = rawHours >= 12 ? 'pm' : 'am';
    displayHours = rawHours % 12 || 12;
  } else {
    displayHours = rawHours;
  }

  return {
    year: String(now.getFullYear()),
    month: monthFormatter.format(now),
    day: getOrdinalDay(day),
    dayOfWeek: weekdayFormatter.format(now),
    hours: String(displayHours).padStart(2, '0'),
    minutes: String(now.getMinutes()).padStart(2, '0'),
    seconds: String(now.getSeconds()).padStart(2, '0'),
    meridian,
  };
}

export function useClock(timeFormat: TimeFormat = '12h'): ClockState {
  const [clock, setClock] = useState<ClockState>(() => getNowClockState(timeFormat));

  useEffect(() => {
    // 最初の状態をセット
    setClock(getNowClockState(timeFormat));

    const timer = setInterval(() => {
      setClock(getNowClockState(timeFormat));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timeFormat]);

  return clock;
}
