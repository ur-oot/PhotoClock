import React, { useState, useEffect, useRef } from 'react';

interface CinematicBackgroundProps {
  photoUrl: string;
  isCinematicMotionEnabled: boolean;
  isSpotlightEnabled?: boolean;
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
}) => {
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
        {/* 上部中央からの温白色展示光 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 85% 65% at 50% 0%, rgba(255, 253, 247, 0.24) 0%, rgba(255, 250, 240, 0.12) 38%, rgba(255, 250, 240, 0.02) 68%, transparent 85%)',
          }}
        />
        {/* 周辺および下部コーナーへのフォールオフ陰影 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 95% 80% at 50% 20%, transparent 42%, rgba(0, 0, 0, 0.18) 72%, rgba(0, 0, 0, 0.45) 100%)',
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
