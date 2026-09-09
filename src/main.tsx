import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { initGA } from './utils/analytics';

import { SettingsProvider } from './contexts/SettingsContext';

// Google Analytics (GA4) の初期化
initGA();

// PWA サービスワーカーの自動登録
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);
