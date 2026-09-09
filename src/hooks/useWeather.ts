import { useState, useEffect, useCallback, useRef } from 'react';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
}

interface WeatherCache {
  data: WeatherData;
  timestamp: number;
  unit: TemperatureUnit;
  lat: number;
  lon: number;
}

const STORAGE_KEY_WEATHER_ENABLED = 'photoclock_weather_enabled';
const STORAGE_KEY_WEATHER_UNIT = 'photoclock_weather_unit';
const STORAGE_KEY_WEATHER_CACHE = 'photoclock_weather_cache';
const STORAGE_KEY_WEATHER_COORDS = 'photoclock_weather_coords';

// デフォルト位置（東京）
const DEFAULT_COORDS = { lat: 35.6895, lon: 139.6917 };
// キャッシュ有効期間: 30分 (ミリ秒)
const CACHE_TTL_MS = 30 * 60 * 1000;

export function useWeather() {
  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEATHER_ENABLED);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // デフォルトで有効
  });

  const [unit, setUnitState] = useState<TemperatureUnit>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEATHER_UNIT);
      if (saved === 'celsius' || saved === 'fahrenheit') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'celsius';
  });

  const [weather, setWeather] = useState<WeatherData | null>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_WEATHER_CACHE);
      if (cached) {
        const parsed: WeatherCache = JSON.parse(cached);
        // キャッシュが有効期限内かつ同じ単位なら初期値として即座に使用
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const setIsEnabled = (enabled: boolean) => {
    setIsEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_WEATHER_ENABLED, String(enabled));
    } catch {
      // ignore
    }
  };

  const setUnit = (newUnit: TemperatureUnit) => {
    setUnitState(newUnit);
    try {
      localStorage.setItem(STORAGE_KEY_WEATHER_UNIT, newUnit);
    } catch {
      // ignore
    }

    // 既存の天気データがあれば単位を即座にローカル換算してUIをスムーズに更新
    setWeather((prev) => {
      if (!prev) return null;
      if (newUnit === 'fahrenheit') {
        return {
          ...prev,
          temperature: Math.round((prev.temperature * 9) / 5 + 32),
        };
      } else {
        return {
          ...prev,
          temperature: Math.round(((prev.temperature - 32) * 5) / 9),
        };
      }
    });
  };

  // 天気データフェッチ関数
  const fetchWeather = useCallback(async (lat: number, lon: number, currentUnit: TemperatureUnit, force = false) => {
    if (isFetchingRef.current) return;

    // キャッシュチェック（force でなければ30分以内のキャッシュを再利用）
    try {
      const cached = localStorage.getItem(STORAGE_KEY_WEATHER_CACHE);
      if (cached && !force) {
        const parsed: WeatherCache = JSON.parse(cached);
        if (
          Date.now() - parsed.timestamp < CACHE_TTL_MS &&
          parsed.unit === currentUnit &&
          Math.abs(parsed.lat - lat) < 0.05 &&
          Math.abs(parsed.lon - lon) < 0.05
        ) {
          setWeather(parsed.data);
          return;
        }
      }
    } catch {
      // ignore
    }

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=${currentUnit}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.current && typeof json.current.temperature_2m === 'number') {
          const newWeather: WeatherData = {
            temperature: Math.round(json.current.temperature_2m),
            weatherCode: json.current.weather_code ?? 0,
          };
          setWeather(newWeather);

          // キャッシュ保存
          const cacheData: WeatherCache = {
            data: newWeather,
            timestamp: Date.now(),
            unit: currentUnit,
            lat,
            lon,
          };
          try {
            localStorage.setItem(STORAGE_KEY_WEATHER_CACHE, JSON.stringify(cacheData));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch weather from Open-Meteo:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // 位置情報の解決とデータ取得
  const updateWeatherData = useCallback((force = false) => {
    if (!isEnabled) return;

    // 保存済みの座標があればまずそれを使用
    let savedCoords = DEFAULT_COORDS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WEATHER_COORDS);
      if (stored) {
        savedCoords = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // ブラウザの位置情報APIを試行
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: Number(pos.coords.latitude.toFixed(4)),
            lon: Number(pos.coords.longitude.toFixed(4)),
          };
          try {
            localStorage.setItem(STORAGE_KEY_WEATHER_COORDS, JSON.stringify(coords));
          } catch {
            // ignore
          }
          fetchWeather(coords.lat, coords.lon, unit, force);
        },
        (_err) => {
          // 拒否または取得失敗時は保存済み座標またはデフォルト位置を使用
          fetchWeather(savedCoords.lat, savedCoords.lon, unit, force);
        },
        { timeout: 5000, maximumAge: 600000 }
      );
    } else {
      fetchWeather(savedCoords.lat, savedCoords.lon, unit, force);
    }
  }, [isEnabled, unit, fetchWeather]);

  // 初期化および定期更新（30分ごと）
  useEffect(() => {
    if (!isEnabled) return;

    updateWeatherData();

    const intervalId = window.setInterval(() => {
      updateWeatherData();
    }, CACHE_TTL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isEnabled, unit, updateWeatherData]);

  return {
    weather,
    isEnabled,
    setIsEnabled,
    unit,
    setUnit,
    isLoading,
    refreshWeather: () => updateWeatherData(true),
  };
}
