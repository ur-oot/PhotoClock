import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import type { useZenTimer } from '../hooks/useZenTimer';

interface ZenTimerBarProps {
  zenTimer: ReturnType<typeof useZenTimer>;
  isControlsVisible: boolean;
}

export const ZenTimerBar: React.FC<ZenTimerBarProps> = ({
  zenTimer,
  isControlsVisible,
}) => {
  if (!zenTimer.isEnabled) return null;

  const isWork = zenTimer.phase === 'work';
  const progressPercent = Math.round(zenTimer.progress * 100);

  return (
    <div className="mt-4 flex flex-col items-center select-none transition-all duration-300">
      {/* 極細プログレスインジケーター */}
      <div
        className={`w-48 sm:w-64 h-1 rounded-full bg-white/20 backdrop-blur-md overflow-hidden relative shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all ${
          zenTimer.isCompletedPulse ? 'ring-2 ring-white animate-pulse' : ''
        }`}
        title={`Zen Timer: ${isWork ? 'Focus' : 'Break'} (${progressPercent}%)`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isWork
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              : 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
          }`}
          style={{ width: `${zenTimer.progress * 100}%` }}
        />
      </div>

      {/* 控えめな操作コントロール群（マウス動作時にのみフェードイン） */}
      <div
        className={`flex items-center space-x-2.5 mt-2.5 px-3.5 py-1 rounded-full backdrop-blur-md bg-white/40 shadow-sm border border-white/30 text-stone-800 text-xs transition-all duration-300 ${
          isControlsVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        {/* フェーズ & 残り時間ラベル */}
        <span
          className={`font-semibold tracking-wider text-[11px] uppercase ${
            isWork ? 'text-amber-800' : 'text-emerald-800'
          }`}
        >
          {isWork ? 'Focus' : 'Break'}
        </span>

        <span className="font-mono font-medium text-[11px] text-stone-700">
          {zenTimer.formattedRemaining}
        </span>

        <div className="w-px h-3 bg-stone-400/50 my-auto" />

        {/* 再生 / 一時停止ボタン */}
        <button
          onClick={zenTimer.togglePlay}
          aria-label={zenTimer.isRunning ? 'Pause timer' : 'Start timer'}
          title={zenTimer.isRunning ? 'Pause' : 'Start'}
          className="p-1 rounded-full hover:bg-white/60 transition-colors text-stone-800"
        >
          {zenTimer.isRunning ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>

        {/* フェーズスキップボタン */}
        <button
          onClick={() => zenTimer.switchPhase(isWork ? 'break' : 'work')}
          aria-label="Skip to next phase"
          title={isWork ? 'Skip to break' : 'Skip to focus'}
          className="p-1 rounded-full hover:bg-white/60 transition-colors text-stone-600 hover:text-stone-900"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* リセットボタン */}
        <button
          onClick={zenTimer.reset}
          aria-label="Reset timer"
          title="Reset timer"
          className="p-1 rounded-full hover:bg-white/60 transition-colors text-stone-600 hover:text-stone-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
