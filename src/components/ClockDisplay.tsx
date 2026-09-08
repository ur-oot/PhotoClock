import React from 'react';
import type { ClockState } from '../hooks/useClock';

interface ClockDisplayProps {
  clock: ClockState;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ clock }) => {
  return (
    <div className="flex flex-col items-center justify-center select-none pointer-events-none transition-all duration-300">
      {/* 日付パネル */}
      <div className="backdrop-blur-md bg-white/50 px-6 py-2 rounded-[18px] shadow-[2px_4px_12px_rgba(0,0,0,0.08)] mb-2.5">
        <div className="flex items-center justify-end uppercase text-[1.5vw] min-text-sm md:text-xl lg:text-2xl font-medium tracking-wide text-stone-800 space-x-3">
          <span>{clock.dayOfWeek}</span>
          <span>{clock.day}</span>
          <span>{clock.month}</span>
        </div>
      </div>

      {/* 時刻パネル */}
      <div className="backdrop-blur-md bg-white/50 px-8 py-4 rounded-[18px] shadow-[2px_4px_12px_rgba(0,0,0,0.08)] min-w-[32vw] flex items-center justify-center">
        <div className="flex items-baseline font-semibold text-stone-900 leading-none">
          {/* 時 */}
          <span className="text-[7vw] font-mono tracking-tighter w-[8vw] text-center">
            {clock.hours}
          </span>
          {/* コロン */}
          <span className="text-[6vw] font-mono mx-1 pb-2 text-stone-700 animate-pulse">
            :
          </span>
          {/* 分 */}
          <span className="text-[7vw] font-mono tracking-tighter w-[8vw] text-center">
            {clock.minutes}
          </span>
          {/* コロン */}
          <span className="text-[6vw] font-mono mx-1 pb-2 text-stone-700 animate-pulse">
            :
          </span>
          {/* 秒 */}
          <span className="text-[7vw] font-mono tracking-tighter w-[8vw] text-center">
            {clock.seconds}
          </span>
          {/* AM / PM */}
          <span className="text-[2vw] font-sans font-medium uppercase ml-3 text-stone-600">
            {clock.meridian}
          </span>
        </div>
      </div>
    </div>
  );
};
