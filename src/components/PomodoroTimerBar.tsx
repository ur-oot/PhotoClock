import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import type { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useTranslation } from '../hooks/useTranslation';
import type { LanguageMode } from '../locales';

interface PomodoroTimerBarProps {
  pomodoroTimer: ReturnType<typeof usePomodoroTimer>;
  isControlsVisible: boolean;
  language?: LanguageMode;
}

export const PomodoroTimerBar: React.FC<PomodoroTimerBarProps> = ({
  pomodoroTimer,
  isControlsVisible,
  language = 'auto',
}) => {
  const { t } = useTranslation(language);

  if (!pomodoroTimer.isEnabled) return null;

  const isWork = pomodoroTimer.phase === 'work';
  const progressPercent = Math.round(pomodoroTimer.progress * 100);
  const phaseLabel = isWork ? t('pomodoroTimer.focus') : t('pomodoroTimer.break');

  return (
    <div className="mt-4 flex flex-col items-center select-none transition-all duration-300">
      {/* 極細プログレスインジケーター */}
      <div
        className={`w-48 sm:w-64 h-1 rounded-full bg-white/20 backdrop-blur-md overflow-hidden relative shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all ${
          pomodoroTimer.isCompletedPulse ? 'ring-2 ring-white animate-pulse' : ''
        }`}
        title={t('pomodoroTimer.tooltip', {
          phase: phaseLabel,
          percent: progressPercent,
        })}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isWork
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              : 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
          }`}
          style={{ width: `${pomodoroTimer.progress * 100}%` }}
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
          {phaseLabel}
        </span>

        <span className="font-mono font-medium text-[11px] text-stone-700">
          {pomodoroTimer.formattedRemaining}
        </span>

        <div className="w-px h-3 bg-stone-400/50 my-auto" />

        {/* 再生 / 一時停止ボタン */}
        <button
          onClick={pomodoroTimer.togglePlay}
          aria-label={pomodoroTimer.isRunning ? t('pomodoroTimer.pause') : t('pomodoroTimer.start')}
          title={pomodoroTimer.isRunning ? t('pomodoroTimer.pause') : t('pomodoroTimer.start')}
          className="p-1 rounded-full hover:bg-white/60 transition-colors text-stone-800 cursor-pointer"
        >
          {pomodoroTimer.isRunning ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>

        {/* フェーズスキップボタン */}
        <button
          onClick={() => pomodoroTimer.switchPhase(isWork ? 'break' : 'work')}
          aria-label={t('pomodoroTimer.skip')}
          title={t('pomodoroTimer.skip')}
          className="p-1 rounded-full hover:bg-white/60 transition-colors text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* リセットボタン */}
        <button
          onClick={pomodoroTimer.reset}
          aria-label={t('pomodoroTimer.reset')}
          title={t('pomodoroTimer.reset')}
          className="p-1 rounded-full hover:bg-white/60 transition-colors text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export { PomodoroTimerBar as ZenTimerBar };
