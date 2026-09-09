import React from 'react';
import { useClock, type ClockState } from '../hooks/useClock';
import type { TypographyStyle, TimeFormat } from '../hooks/usePhotoSettings';
import type { ResolvedLanguage } from '../locales';
import type { WeatherData, TemperatureUnit } from '../hooks/useWeather';
import { WeatherIcon } from './WeatherIcon';

interface ClockDisplayProps {
  timeFormat?: TimeFormat;
  clock?: ClockState;
  typographyStyle?: TypographyStyle;
  language?: ResolvedLanguage;
  weather?: WeatherData | null;
  isWeatherEnabled?: boolean;
  temperatureUnit?: TemperatureUnit;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  timeFormat = '12h',
  clock,
  typographyStyle = 'sans',
  language = 'en',
  weather,
  isWeatherEnabled = true,
  temperatureUnit = 'celsius',
}) => {
  const internalClock = useClock(timeFormat, language);
  const activeClock = clock ?? internalClock;
  // フォントスタイル別のクラス設定
  const fontConfig = {
    sans: {
      clock: 'font-sans tracking-tight',
      colon: 'font-sans',
      date: 'font-sans tracking-wide',
    },
    serif: {
      clock: 'font-serif tracking-normal',
      colon: 'font-serif',
      date: 'font-serif tracking-wider',
    },
    mono: {
      clock: 'font-mono tracking-tighter',
      colon: 'font-mono',
      date: 'font-mono tracking-wider',
    },
  }[typographyStyle];

  return (
    <div className="flex flex-col items-center justify-center select-none pointer-events-none transition-all duration-300">
      {/* 日付・気象パネル */}
      <div className="backdrop-blur-md bg-white/50 px-6 py-2 rounded-[18px] shadow-[2px_4px_12px_rgba(0,0,0,0.08)] mb-2.5">
        <div
          className={`flex items-center justify-center uppercase text-[1.5vw] min-text-sm md:text-xl lg:text-2xl font-medium text-stone-800 space-x-3 ${fontConfig.date}`}
        >
          {language === 'ja' ? (
            <>
              <span>
                {activeClock.month}
                {activeClock.day}
              </span>
              <span>{activeClock.dayOfWeek}</span>
            </>
          ) : (
            <>
              <span>{activeClock.dayOfWeek}</span>
              <span>{activeClock.day}</span>
              <span>{activeClock.month}</span>
            </>
          )}

          {/* ミニマル気象インジケーター */}
          {isWeatherEnabled && weather && (
            <>
              <div className="w-px h-3.5 md:h-5 bg-stone-400/40 my-auto" />
              <div className="flex items-center space-x-1.5 normal-case font-medium text-stone-700 tabular-nums">
                <WeatherIcon code={weather.weatherCode} className="w-4 h-4 md:w-5 md:h-5" />
                <span>
                  {weather.temperature}°{temperatureUnit === 'fahrenheit' ? 'F' : 'C'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 時刻パネル */}
      <div className="backdrop-blur-md bg-white/50 px-8 py-4 rounded-[18px] shadow-[2px_4px_12px_rgba(0,0,0,0.08)] min-w-[32vw] flex items-center justify-center">
        <div className="flex items-baseline font-semibold text-stone-900 leading-none tabular-nums">
          {/* 時 */}
          <span className={`text-[7vw] ${fontConfig.clock} w-[8.2vw] text-center`}>
            {activeClock.hours}
          </span>
          {/* コロン */}
          <span className={`text-[6vw] ${fontConfig.colon} mx-1 pb-2 text-stone-700 animate-pulse`}>
            :
          </span>
          {/* 分 */}
          <span className={`text-[7vw] ${fontConfig.clock} w-[8.2vw] text-center`}>
            {activeClock.minutes}
          </span>
          {/* コロン */}
          <span className={`text-[6vw] ${fontConfig.colon} mx-1 pb-2 text-stone-700 animate-pulse`}>
            :
          </span>
          {/* 秒 */}
          <span className={`text-[7vw] ${fontConfig.clock} w-[8.2vw] text-center`}>
            {activeClock.seconds}
          </span>
          {/* AM / PM (12h表示時のみ) */}
          {activeClock.meridian && (
            <span className="text-[2vw] font-sans font-medium uppercase ml-3 text-stone-600">
              {activeClock.meridian}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
