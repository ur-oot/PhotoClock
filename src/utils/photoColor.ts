/**
 * HEXカラーコードから相対輝度 (0.0〜1.0) を算出する
 */
export function getLuminanceFromHex(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) {
    return 0.4;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 写真の輝度に基づいて最適な台紙色 ('white' | 'black') を決定する
 * 暗い写真には白系台紙（輪郭を際立たせる）、明るい写真には黒系台紙（全体を引き締める）
 */
export function getAutoMatteColor(luminance: number): 'white' | 'black' {
  return luminance < 0.45 ? 'white' : 'black';
}

/**
 * 画像URLから平均輝度を検出する
 * Canvasサンプリングを試み、CORS制限などで失敗した場合はHEXまたはデフォルト値へ安全にフォールバック
 */
export function detectImageLuminance(
  imageUrl: string,
  fallbackHex?: string
): Promise<number> {
  return new Promise((resolve) => {
    const fallback = fallbackHex ? getLuminanceFromHex(fallbackHex) : 0.4;

    if (!imageUrl) {
      resolve(fallback);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // タイムアウト保護（1.5秒でフォールバック）
    const timer = setTimeout(() => {
      resolve(fallback);
    }, 1500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(fallback);
          return;
        }

        ctx.drawImage(img, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16);
        const data = imgData.data;
        let totalLuminance = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          totalLuminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }

        resolve(totalLuminance / pixelCount);
      } catch {
        resolve(fallback);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(fallback);
    };

    img.src = imageUrl;
  });
}
