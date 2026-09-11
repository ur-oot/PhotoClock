import React from 'react';
import { TYPOGRAPHY_OPTIONS } from '../../hooks/usePhotoSettings';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettings } from '../../contexts/SettingsContext';
import { ToggleSwitch } from './ToggleSwitch';

export const ClockSettingsTab: React.FC = () => {
  const {
    language,
    setLanguage,
    clockLanguage,
    setClockLanguage,
    typographyStyle,
    setTypographyStyle,
    timeFormat,
    setTimeFormat,
    weather,
  } = useSettings();

  const isWeatherEnabled = weather.isEnabled;
  const setIsWeatherEnabled = weather.setIsEnabled;
  const temperatureUnit = weather.unit;
  const setTemperatureUnit = weather.setUnit;

  const { t } = useTranslation(language);

  return (
    <div className="space-y-5">
      {/* 言語と地域 */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
          {language === 'ja' ? '言語と地域' : 'Language & Region'}
        </span>
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {/* 表示言語 */}
          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.languageTitle')}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {t('settings.general.languageDesc')}
              </div>
            </div>
            <div className="w-full grid grid-cols-3 bg-stone-100 p-1 rounded-xl border border-stone-200/70 gap-1">
              <button
                type="button"
                onClick={() => setLanguage('auto')}
                className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  language === 'auto'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.languageAuto')}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  language === 'en'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.languageEn')}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ja')}
                className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  language === 'ja'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.languageJa')}
              </button>
            </div>
          </div>

          {/* 時計の日時表記 */}
          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.clockLanguageTitle')}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {t('settings.general.clockLanguageDesc')}
              </div>
            </div>
            <div className="w-full grid grid-cols-3 bg-stone-100 p-1 rounded-xl border border-stone-200/70 gap-1">
              <button
                type="button"
                onClick={() => setClockLanguage('sync')}
                className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  clockLanguage === 'sync'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.clockLanguageSync')}
              </button>
              <button
                type="button"
                onClick={() => setClockLanguage('en')}
                className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  clockLanguage === 'en'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.clockLanguageEn')}
              </button>
              <button
                type="button"
                onClick={() => setClockLanguage('ja')}
                className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  clockLanguage === 'ja'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.clockLanguageJa')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 時計スタイル */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
          {language === 'ja' ? '時計スタイル' : 'Clock Style'}
        </span>
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {/* 時計フォント (ビジュアルセレクター) */}
          <div className="p-4 space-y-2.5">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.typographyTitle')}
              </div>
              <div className="text-[11px] text-stone-500">
                {t('settings.general.typographyDesc')}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TYPOGRAPHY_OPTIONS.map((opt) => {
                const isSelected = typographyStyle === opt.id;
                const info =
                  opt.id === 'sans'
                    ? { label: t('settings.general.typographySans'), desc: t('settings.general.typographySansDesc') }
                    : opt.id === 'serif'
                    ? { label: t('settings.general.typographySerif'), desc: t('settings.general.typographySerifDesc') }
                    : { label: t('settings.general.typographyMono'), desc: t('settings.general.typographyMonoDesc') };

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTypographyStyle(opt.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900/10'
                        : 'border-stone-200/80 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div className={`text-lg font-bold leading-tight ${opt.fontClass} ${isSelected ? 'text-stone-900' : 'text-stone-700'}`}>
                      {opt.sample}
                    </div>
                    <div className="text-xs font-semibold text-stone-800 mt-1">
                      {info.label}
                    </div>
                    <div className="text-[10px] text-stone-400 line-clamp-1">
                      {info.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 時刻形式 */}
          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.timeFormatTitle')}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {t('settings.general.timeFormatDesc')}
              </div>
            </div>
            <div className="w-full grid grid-cols-2 bg-stone-100 p-1 rounded-xl border border-stone-200/70 gap-1">
              <button
                type="button"
                onClick={() => setTimeFormat('12h')}
                className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  timeFormat === '12h'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.timeFormat12')}
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat('24h')}
                className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  timeFormat === '24h'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('settings.general.timeFormat24')}
              </button>
            </div>
          </div>

          {/* 現在の天気と気温 */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-stone-900">
                  {t('settings.general.weatherTitle')}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {t('settings.general.weatherDesc')}
                </div>
              </div>
              <ToggleSwitch
                checked={isWeatherEnabled}
                onChange={setIsWeatherEnabled}
                ariaLabel="Toggle weather"
              />
            </div>

            {isWeatherEnabled && (
              <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between transition-all duration-300">
                <div className="text-[11px] font-medium text-stone-600">
                  {t('settings.general.temperatureUnit')}
                </div>
                <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200/70 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTemperatureUnit('celsius')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      temperatureUnit === 'celsius'
                        ? 'bg-white text-stone-900 font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t('settings.general.temperatureUnitCelsius')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemperatureUnit('fahrenheit')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      temperatureUnit === 'fahrenheit'
                        ? 'bg-white text-stone-900 font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t('settings.general.temperatureUnitFahrenheit')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
