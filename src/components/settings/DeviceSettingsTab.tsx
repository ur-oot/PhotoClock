import React from 'react';
import type { LanguageMode } from '../../hooks/usePhotoSettings';
import { useTranslation } from '../../hooks/useTranslation';
import { ToggleSwitch } from './ToggleSwitch';

interface DeviceSettingsTabProps {
  language: LanguageMode;
  isPomodoroTimerEnabled: boolean;
  setIsPomodoroTimerEnabled: (enabled: boolean) => void;
  isWakeLockEnabled: boolean;
  setIsWakeLockEnabled: (enabled: boolean) => void;
  isPixelShiftEnabled: boolean;
  setIsPixelShiftEnabled: (enabled: boolean) => void;
}

export const DeviceSettingsTab: React.FC<DeviceSettingsTabProps> = ({
  language,
  isPomodoroTimerEnabled,
  setIsPomodoroTimerEnabled,
  isWakeLockEnabled,
  setIsWakeLockEnabled,
  isPixelShiftEnabled,
  setIsPixelShiftEnabled,
}) => {
  const { t } = useTranslation(language);

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
          {language === 'ja' ? 'デバイス維持 & 集中' : 'Device & Focus'}
        </span>
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {/* ポモドーロタイマー */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.pomodoroTimerTitle')}
              </div>
              <div className="text-[11px] text-stone-500">
                {t('settings.general.pomodoroTimerDesc')}
              </div>
            </div>
            <ToggleSwitch
              checked={isPomodoroTimerEnabled}
              onChange={setIsPomodoroTimerEnabled}
              ariaLabel="Toggle Pomodoro timer"
            />
          </div>

          {/* 画面スリープ防止 */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.screenAwakeTitle')}
              </div>
              <div className="text-[11px] text-stone-500">
                {t('settings.general.screenAwakeDesc')}
              </div>
            </div>
            <ToggleSwitch
              checked={isWakeLockEnabled}
              onChange={setIsWakeLockEnabled}
              ariaLabel="Toggle keep screen awake"
            />
          </div>

          {/* 焼き付き防止 */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.burnInTitle')}
              </div>
              <div className="text-[11px] text-stone-500">
                {t('settings.general.burnInDesc')}
              </div>
            </div>
            <ToggleSwitch
              checked={isPixelShiftEnabled}
              onChange={setIsPixelShiftEnabled}
              ariaLabel="Toggle burn-in protection"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
