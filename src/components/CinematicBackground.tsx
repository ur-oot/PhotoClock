import React, { useState, useEffect, useRef } from 'react';

interface CinematicBackgroundProps {
  photoUrl: string;
  isCinematicMotionEnabled: boolean;
  isSpotlightEnabled?: boolean;
  spotlightIntensity?: number;
}

const ANIMATION_VARIANTS = [
  'animate-kenburns-zoom-in',
  'animate-kenburns-zoom-out',
  'animate-kenburns-pan-right',
  'animate-kenburns-pan-left',
];

function getRandomAnimation(previousAnimation?: string): string {
  const filtered = ANIMATION_VARIANTS.filter((v) => v !== previousAnimation);
  return filtered[Math.floor(Math.random() * filtered.length)] || ANIMATION_VARIANTS[0];
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({
  photoUrl,
  isCinematicMotionEnabled,
  isSpotlightEnabled = false,
  spotlightIntensity = 70,
}) => {
  const intensity = Math.max(10, Math.min(100, spotlightIntensity));
  const factor = intensity / 100;
  // レイヤーAとBでダブルバッファリング
  const [layerA, setLayerA] = useState<{ url: string; animation: string }>({
    url: photoUrl,
    animation: getRandomAnimation(),
  });
  const [layerB, setLayerB] = useState<{ url: string; animation: string }>({
    url: '',
    animation: getRandomAnimation(),
  });

  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const isInitialMount = useRef<boolean>(true);
  const currentLoadedUrl = useRef<string>(photoUrl);

  useEffect(() => {
    if (!photoUrl) return;

    // 初回マウント時は即座にLayer Aにセット
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLayerA({
        url: photoUrl,
        animation: getRandomAnimation(),
      });
      currentLoadedUrl.current = photoUrl;
      return;
    }

    // すでにロード済みのURLならスキップ
    if (photoUrl === currentLoadedUrl.current) return;

    // 新画像のバックグラウンドプリロード
    const img = new Image();
    img.src = photoUrl;

    img.onload = () => {
      currentLoadedUrl.current = photoUrl;

      if (activeLayer === 'A') {
        const nextAnimation = getRandomAnimation(layerA.animation);
        setLayerB({ url: photoUrl, animation: nextAnimation });
        // 次の描画フレームでLayer Bをフェードイン
        requestAnimationFrame(() => {
          setActiveLayer('B');
        });
      } else {
        const nextAnimation = getRandomAnimation(layerB.animation);
        setLayerA({ url: photoUrl, animation: nextAnimation });
        requestAnimationFrame(() => {
          setActiveLayer('A');
        });
      }
    };

    img.onerror = () => {
      console.warn('Failed to preload image, fallback will be used');
    };
  }, [photoUrl, activeLayer, layerA.animation, layerB.animation]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-stone-950 select-none">
      {/* レイヤー A */}
      {layerA.url && (
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[2000ms] ease-in-out ${
            activeLayer === 'A' ? 'opacity-100 z-10' : 'opacity-0 z-0'
          } ${isCinematicMotionEnabled ? layerA.animation : 'transform-none'}`}
          style={{
            backgroundImage: `url(${layerA.url})`,
          }}
        />
      )}

      {/* レイヤー B */}
      {layerB.url && (
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[2000ms] ease-in-out ${
            activeLayer === 'B' ? 'opacity-100 z-10' : 'opacity-0 z-0'
          } ${isCinematicMotionEnabled ? layerB.animation : 'transform-none'}`}
          style={{
            backgroundImage: `url(${layerB.url})`,
          }}
        />
      )}

      {/* ギャラリースポットライト照明演出レイヤー */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-in-out ${
          isSpotlightEnabled ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 上部中央からの指向性展示光 (Soft-lightブレンドによる自然な発光感) */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `radial-gradient(ellipse 75% 55% at 50% -5%, rgba(255, 250, 235, ${(0.65 * factor).toFixed(2)}) 0%, rgba(255, 245, 220, ${(0.30 * factor).toFixed(2)}) 45%, rgba(255, 240, 215, ${(0.08 * factor).toFixed(2)}) 70%, transparent 90%)`,
            mixBlendMode: 'soft-light',
          }}
        />

        {/* 中央〜時計周辺のブライトニングハイライト (Screenブレンド) */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `radial-gradient(ellipse 65% 50% at 50% 25%, rgba(255, 255, 255, ${(0.22 * factor).toFixed(2)}) 0%, transparent 80%)`,
            mixBlendMode: 'screen',
          }}
        />

        {/* 周辺および下部コーナーへの明瞭なフォールオフ陰影 (展示室の暗がり効果) */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `radial-gradient(ellipse 85% 75% at 50% 20%, transparent 25%, rgba(0, 0, 0, ${(0.40 * factor).toFixed(2)}) 62%, rgba(0, 0, 0, ${(0.78 * factor).toFixed(2)}) 100%)`,
          }}
        />
      </div>

      {/* シネマティック・ビネット & コントラスト保護オーバーレイ */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.38) 100%)',
        }}
      />
    </div>
  );
};
