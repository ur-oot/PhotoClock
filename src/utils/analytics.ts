/**
 * Google Analytics (GA4) 初期化 & 計測ユーティリティ
 * 外部ライブラリを使用せず、ネイティブな gtag.js 動的ロード方式を採用
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

let isInitialized = false;

export function initGA(): void {
  if (typeof window === 'undefined' || isInitialized) {
    return;
  }

  const gaId = import.meta.env.VITE_GA_ID;

  // 環境変数が設定されていない場合（ローカル開発等）はスクリプトをロードしない
  if (!gaId || !gaId.trim()) {
    return;
  }

  try {
    // gtag.js スクリプトタグの動的挿入
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);

    // dataLayer と gtag 関数の初期化
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      send_page_view: true,
    });

    isInitialized = true;
  } catch (error) {
    console.warn('[Analytics] Failed to initialize Google Analytics:', error);
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
