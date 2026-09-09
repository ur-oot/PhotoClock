import { useState, useEffect, useRef, useCallback } from 'react';

export type PomodoroPhase = 'work' | 'break';
export type ZenTimerPhase = PomodoroPhase;

export interface PomodoroTimerState {
  isEnabled: boolean;
  phase: PomodoroPhase;
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number; // 0.0 〜 1.0
  isCompletedPulse: boolean;
  formattedRemaining: string;
}
export type ZenTimerState = PomodoroTimerState;

const STORAGE_KEY_POMODORO_ENABLED = 'photoclock_pomodoro_timer_enabled';
const LEGACY_STORAGE_KEY_ZEN_ENABLED = 'photoclock_zen_timer_enabled';

const WORK_DURATION = 25 * 60; // 25分 (1500秒)
const BREAK_DURATION = 5 * 60;  // 5分 (300秒)

export function usePomodoroTimer() {
  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POMODORO_ENABLED);
      if (saved !== null) {
        return saved === 'true';
      }
      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY_ZEN_ENABLED);
      if (legacySaved !== null) {
        return legacySaved === 'true';
      }
    } catch {
      // ignore
    }
    return false; // デフォルトはOFF（アンビエント時計としての初期状態を尊重）
  });

  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(WORK_DURATION);
  const [isCompletedPulse, setIsCompletedPulse] = useState<boolean>(false);

  // 正確な時間経過を計測するためのタイムスタンプ参照
  const targetTimeRef = useRef<number | null>(null);
  const timerIdRef = useRef<number | null>(null);

  const totalSeconds = phase === 'work' ? WORK_DURATION : BREAK_DURATION;
  const progress = Math.min(1, Math.max(0, 1 - remainingSeconds / totalSeconds));

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedRemaining = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const setIsEnabled = (enabled: boolean) => {
    setIsEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_POMODORO_ENABLED, String(enabled));
    } catch {
      // ignore
    }
    if (!enabled) {
      setIsRunning(false);
      targetTimeRef.current = null;
    }
  };

  const start = useCallback(() => {
    if (!isRunning) {
      targetTimeRef.current = Date.now() + remainingSeconds * 1000;
      setIsRunning(true);
    }
  }, [isRunning, remainingSeconds]);

  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      targetTimeRef.current = null;
    }
  }, [isRunning]);

  const togglePlay = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  const reset = useCallback(() => {
    setIsRunning(false);
    targetTimeRef.current = null;
    setRemainingSeconds(phase === 'work' ? WORK_DURATION : BREAK_DURATION);
    setIsCompletedPulse(false);
  }, [phase]);

  const switchPhase = useCallback((nextPhase: PomodoroPhase) => {
    setPhase(nextPhase);
    const newDuration = nextPhase === 'work' ? WORK_DURATION : BREAK_DURATION;
    setRemainingSeconds(newDuration);
    if (isRunning) {
      targetTimeRef.current = Date.now() + newDuration * 1000;
    } else {
      targetTimeRef.current = null;
    }
    setIsCompletedPulse(true);
    setTimeout(() => {
      setIsCompletedPulse(false);
    }, 3000);
  }, [isRunning]);

  // カウントダウンタイマーの更新ループ
  useEffect(() => {
    if (!isRunning || !isEnabled) {
      if (timerIdRef.current) {
        window.clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }

    const tick = () => {
      if (!targetTimeRef.current) return;

      const now = Date.now();
      const diffMs = targetTimeRef.current - now;
      const leftSec = Math.max(0, Math.ceil(diffMs / 1000));

      setRemainingSeconds(leftSec);

      if (leftSec <= 0) {
        // フェーズ完了: 次のフェーズへ移行
        const next = phase === 'work' ? 'break' : 'work';
        switchPhase(next);
      } else {
        // 次の1秒間隔までのミリ秒を計算して正確に同期
        const delay = (diffMs % 1000) || 1000;
        timerIdRef.current = window.setTimeout(tick, delay);
      }
    };

    tick();

    return () => {
      if (timerIdRef.current) {
        window.clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [isRunning, isEnabled, phase, switchPhase]);

  return {
    isEnabled,
    setIsEnabled,
    phase,
    isRunning,
    remainingSeconds,
    totalSeconds,
    progress,
    isCompletedPulse,
    formattedRemaining,
    start,
    pause,
    togglePlay,
    reset,
    switchPhase,
  };
}
