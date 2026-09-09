import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, Shuffle } from 'lucide-react';
import type { UnsplashCollection } from '../../types/unsplash';
import { PHOTO_TOPICS } from '../../types/unsplash';
import { INTERVAL_OPTIONS, type LanguageMode } from '../../hooks/usePhotoSettings';
import { getSolarMoodInfo } from '../../utils/sunCalc';
import { useTranslation } from '../../hooks/useTranslation';
import { ToggleSwitch } from './ToggleSwitch';

const TOPIC_TRANSLATION_KEYS: Record<string, string> = {
  all: 'settings.topics.all',
  wallpapers: 'settings.topics.wallpapers',
  nature: 'settings.topics.nature',
  travel: 'settings.topics.travel',
  'architecture-interior': 'settings.topics.architecture',
  'street-photography': 'settings.topics.street',
  'textures-patterns': 'settings.topics.textures',
  film: 'settings.topics.film',
  animals: 'settings.topics.animals',
  spirituality: 'settings.topics.spirituality',
  monochrome: 'settings.topics.monochrome',
};

interface PhotoSettingsTabProps {
  language: LanguageMode;
  updateIntervalTime: number;
  setUpdateIntervalTime: (seconds: number) => void;
  isSunMoodEnabled: boolean;
  setIsSunMoodEnabled: (enabled: boolean) => void;
  isNightDimmingEnabled: boolean;
  setIsNightDimmingEnabled: (enabled: boolean) => void;
  isCinematicMotionEnabled: boolean;
  setIsCinematicMotionEnabled: (enabled: boolean) => void;
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  selectedCollection: UnsplashCollection | null;
  setSelectedCollection: (collection: UnsplashCollection | null) => void;
  onRefreshPhoto: () => void;
  onClose: () => void;
}

export const PhotoSettingsTab: React.FC<PhotoSettingsTabProps> = ({
  language,
  updateIntervalTime,
  setUpdateIntervalTime,
  isSunMoodEnabled,
  setIsSunMoodEnabled,
  isNightDimmingEnabled,
  setIsNightDimmingEnabled,
  isCinematicMotionEnabled,
  setIsCinematicMotionEnabled,
  selectedTopic,
  setSelectedTopic,
  selectedCollection,
  setSelectedCollection,
  onRefreshPhoto,
  onClose,
}) => {
  const { t } = useTranslation(language);
  const solarMood = getSolarMoodInfo();

  const [collections, setCollections] = useState<UnsplashCollection[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState<boolean>(false);

  useEffect(() => {
    if (!hasLoadedInitial) {
      fetchCollections(1);
      setHasLoadedInitial(true);
    }
  }, [hasLoadedInitial]);

  const fetchCollections = async (pageToFetch: number) => {
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/collections?page=${pageToFetch}&perPage=12`);
      if (res.ok) {
        const data: UnsplashCollection[] = await res.json();
        if (Array.isArray(data)) {
          setCollections((prev) => (pageToFetch === 1 ? data : [...prev, ...data]));
          setPage(pageToFetch);
        }
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchCollections(page + 1);
  };

  return (
    <div className="space-y-5">
      {/* 再生と演出 */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
          {language === 'ja' ? '再生と演出' : 'Playback & Effects'}
        </span>
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {/* 更新間隔 */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.updateIntervalTitle')}
              </div>
              <div className="text-[11px] text-stone-500">
                {t('settings.general.updateIntervalDesc')}
              </div>
            </div>
            <select
              value={updateIntervalTime}
              onChange={(e) => setUpdateIntervalTime(Number(e.target.value))}
              className="text-xs font-semibold bg-stone-100 border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 outline-none cursor-pointer focus:ring-1 focus:ring-stone-400 shrink-0"
            >
              {INTERVAL_OPTIONS.map((opt) => {
                const mins = Math.round(opt.code / 60);
                const label =
                  language === 'ja'
                    ? opt.code === 300
                      ? `${mins}分ごと（標準）`
                      : `${mins}分ごと`
                    : opt.code === 300
                    ? 'Every 5 minutes (default)'
                    : `Every ${mins} minutes`;
                return (
                  <option key={opt.code} value={opt.code}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 太陽光連動ムード */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-stone-900">
                  {t('settings.general.sunMoodTitle')}
                </span>
                {isSunMoodEnabled && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                    {t(`solarPhases.${solarMood.phase}`)}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-500">
                {t('settings.general.sunMoodDesc')}
              </div>
            </div>
            <ToggleSwitch
              checked={isSunMoodEnabled}
              onChange={setIsSunMoodEnabled}
              ariaLabel="Toggle sun mood"
            />
          </div>

          {/* 夜間自動減光 */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.nightDimmingTitle')}
              </div>
              <div className="text-[11px] text-stone-500">
                {t('settings.general.nightDimmingDesc')}
              </div>
            </div>
            <ToggleSwitch
              checked={isNightDimmingEnabled}
              onChange={setIsNightDimmingEnabled}
              ariaLabel="Toggle night dimming"
            />
          </div>

          {/* シネマティック演出 */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                {t('settings.general.cinematicMotionTitle')}
              </div>
              <div className="text-[11px] text-stone-500">
                {t('settings.general.cinematicMotionDesc')}
              </div>
            </div>
            <ToggleSwitch
              checked={isCinematicMotionEnabled}
              onChange={setIsCinematicMotionEnabled}
              ariaLabel="Toggle cinematic motion"
            />
          </div>
        </div>
      </div>

      {/* 写真テーマ・ムード */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
          {t('settings.topics.title')}
        </span>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-[11px] text-stone-500">
              {t('settings.topics.desc')}
            </p>
            {selectedCollection ? (
              <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md inline-block self-start sm:self-auto shrink-0">
                {t('settings.topics.customActive')}
              </span>
            ) : isSunMoodEnabled ? (
              <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md inline-flex items-center space-x-1.5 self-start sm:self-auto shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {t('settings.topics.sunAwareActive', {
                    phase: t(`solarPhases.${solarMood.phase}`),
                  })}
                </span>
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PHOTO_TOPICS.map((topic) => {
              const isSelected = !selectedCollection && selectedTopic === topic.id;
              const topicKey = TOPIC_TRANSLATION_KEYS[topic.id];
              const topicName = topicKey ? t(topicKey) : topic.name;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    onRefreshPhoto();
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-2xs ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs font-semibold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{topic.emoji}</span>
                  <span>{topicName}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Unsplashコレクション */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {t('settings.collections.title')}
          </span>
          {selectedCollection && (
            <button
              type="button"
              onClick={() => {
                setSelectedCollection(null);
                onRefreshPhoto();
              }}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-200/70 hover:bg-stone-300 rounded-lg transition-colors"
            >
              <Shuffle className="w-3 h-3" />
              <span>
                {language === 'ja' ? 'コレクション解除' : 'Clear Collection'}
              </span>
            </button>
          )}
        </div>
        <p className="text-[11px] text-stone-500 px-1">
          {t('settings.collections.desc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {collections.map((item) => {
            const isSelected = selectedCollection?.id === item.id;
            const previews = item.preview_photos || [];

            return (
              <div
                key={item.id}
                className={`group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all border-2 ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                {/* 3分割プレビューサムネイル */}
                <a
                  href={`https://unsplash.com/collections/${item.id}?utm_source=photoclock&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-[16/10] bg-stone-100 flex overflow-hidden group/thumb"
                >
                  {previews[0]?.urls?.small && (
                    <div className="w-[70%] h-full relative">
                      <img
                        src={previews[0].urls.small}
                        alt=""
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="w-[30%] h-full flex flex-col pl-0.5 space-y-0.5">
                    {previews[1]?.urls?.small && (
                      <div className="h-1/2 relative overflow-hidden">
                        <img
                          src={previews[1].urls.small}
                          alt=""
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {previews[2]?.urls?.small && (
                      <div className="h-1/2 relative overflow-hidden">
                        <img
                          src={previews[2].urls.small}
                          alt=""
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center space-x-1">
                    <span>{t('settings.favorites.viewOnUnsplash')}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </a>

                {/* タイトルと選択ボタン */}
                <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-stone-900 text-xs line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {t('settings.collections.photosCount', { count: item.total_photos })}
                    </p>
                  </div>

                  <div>
                    {isSelected ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-1.5 px-3 bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-default"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('common.selected')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCollection(item);
                          onClose();
                        }}
                        className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        {language === 'ja' ? 'このコレクションを適用' : 'Select this collection'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* もっと読み込むボタン */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-5 py-2 bg-white border border-stone-300 text-stone-800 font-medium text-xs rounded-lg hover:bg-stone-50 shadow-xs transition-all disabled:opacity-50"
          >
            {isLoadingMore
              ? language === 'ja'
                ? '読み込み中...'
                : 'Loading collections...'
              : t('settings.collections.loadMore')}
          </button>
        </div>
      </div>
    </div>
  );
};
