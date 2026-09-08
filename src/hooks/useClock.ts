import { useState, useEffect } from 'react';

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

function getNowClockState(): ClockState {
  const now = new Date();
  const day = now.getDate();

  let rawHours = now.getHours();
  const meridian = rawHours >= 12 ? 'pm' : 'am';
  rawHours = rawHours % 12 || 12;

  return {
    year: String(now.getFullYear()),
    month: monthFormatter.format(now),
    day: getOrdinalDay(day),
    dayOfWeek: weekdayFormatter.format(now),
    hours: String(rawHours).padStart(2, '0'),
    minutes: String(now.getMinutes()).padStart(2, '0'),
    seconds: String(now.getSeconds()).padStart(2, '0'),
    meridian,
  };
}

export function useClock(): ClockState {
  const [clock, setClock] = useState<ClockState>(getNowClockState);

  useEffect(() => {
    // 最初の状態をセット
    setClock(getNowClockState());

    const timer = setInterval(() => {
      setClock(getNowClockState());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return clock;
}
