/**
 * 太陽の位置および日出・日没時刻の計算ユーティリティ (NOAA標準計算アルゴリズム準拠)
 * 外部通信を行わず端末内で完全オフライン計算を実行
 */

export type SolarPhase = 'morning' | 'day' | 'goldenHour' | 'night';

export interface SolarTimes {
  sunrise: Date;
  sunset: Date;
  goldenHourStart: Date;
  dusk: Date;
}

export interface SolarMoodInfo {
  phase: SolarPhase;
  label: string;
  emoji: string;
  query: string;
  isDimmed: boolean;
  sunrise: Date;
  sunset: Date;
  fallbackUrl: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// 代表的なタイムゾーンの座標マッピング
const TIMEZONE_COORDINATES: Record<string, Coordinates> = {
  'Asia/Tokyo': { lat: 35.6895, lng: 139.6917 },
  'America/New_York': { lat: 40.7128, lng: -74.006 },
  'America/Los_Angeles': { lat: 34.0522, lng: -118.2437 },
  'America/Chicago': { lat: 41.8781, lng: -87.6298 },
  'Europe/London': { lat: 51.5074, lng: -0.1278 },
  'Europe/Paris': { lat: 48.8566, lng: 2.3522 },
  'Europe/Berlin': { lat: 52.52, lng: 13.405 },
  'Asia/Singapore': { lat: 1.3521, lng: 103.8198 },
  'Asia/Seoul': { lat: 37.5665, lng: 126.978 },
  'Asia/Shanghai': { lat: 31.2304, lng: 121.4737 },
  'Australia/Sydney': { lat: -33.8688, lng: 151.2093 },
};

/**
 * タイムゾーンから推定座標を取得する
 */
export function getEstimatedCoordinates(): Coordinates {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COORDINATES[tz]) {
      return TIMEZONE_COORDINATES[tz];
    }
  } catch {
    // ignore
  }
  // 日本標準時またはデフォルト
  return { lat: 35.6895, lng: 139.6917 };
}

/**
 * 度をラジアンに変換
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * ラジアンを度に変換
 */
function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * NOAAアルゴリズムに基づいて特定日の日出・日没・薄明時刻を算出する
 */
export function calculateSolarTimes(date: Date = new Date(), coords?: Coordinates): SolarTimes {
  const { lat, lng } = coords || getEstimatedCoordinates();

  const year = date.getFullYear();

  // 1年の通算日 (Day of the Year)
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 太陽の平均近点角 (M)
  const M = (357.5291 + 0.98560028 * dayOfYear) % 360;

  // 太陽の中心差 (C)
  const C = 1.9148 * Math.sin(degToRad(M)) + 0.02 * Math.sin(degToRad(2 * M));

  // 太陽の真黄経 (L)
  const L = (M + C + 180 + 102.9372) % 360;

  // 太陽赤緯 (delta)
  const sinDelta = Math.sin(degToRad(L)) * Math.sin(degToRad(23.44));
  const delta = radToDeg(Math.asin(sinDelta));

  // 均時差 (EoT: Equation of Time) を概算（分単位）
  const B = (360 / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(degToRad(2 * B)) - 7.53 * Math.cos(degToRad(B)) - 1.5 * Math.sin(degToRad(B));

  // タイムゾーンのオフセット（時間単位）
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;

  // 正午 (Solar Noon) のローカル時間 (分単位)
  const solarNoonMinutes = 720 - 4 * lng - eot + timezoneOffsetHours * 60;

  // 特定の天頂角 (zenith) に対する時角 (Hour Angle) を計算
  const calculateHourAngleMinutes = (zenithAngle: number): number => {
    const latRad = degToRad(lat);
    const deltaRad = degToRad(delta);
    const cosZenith = Math.cos(degToRad(zenithAngle));

    const cosH = (cosZenith - Math.sin(latRad) * Math.sin(deltaRad)) / (Math.cos(latRad) * Math.cos(deltaRad));

    if (cosH > 1) return 0; // 極夜
    if (cosH < -1) return 720; // 白夜

    const hDeg = radToDeg(Math.acos(cosH));
    return hDeg * 4; // 1度あたり4分
  };

  // 標準日出没天頂角: 90.833度（大気差34分＋太陽半径16分）
  const haStandard = calculateHourAngleMinutes(90.833);

  // ゴールデンアワー開始（太陽高度約6度、天頂角84度）
  const haGoldenHour = calculateHourAngleMinutes(84);

  // 市民薄明（太陽高度-6度、天頂角96度）
  const haDusk = calculateHourAngleMinutes(96);

  const makeDate = (minutesFromMidnight: number): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setMinutes(Math.round(minutesFromMidnight));
    return d;
  };

  return {
    sunrise: makeDate(solarNoonMinutes - haStandard),
    sunset: makeDate(solarNoonMinutes + haStandard),
    goldenHourStart: makeDate(solarNoonMinutes + haGoldenHour),
    dusk: makeDate(solarNoonMinutes + haDusk),
  };
}

/**
 * 現在の太陽フェーズを判定する
 */
export function getSolarPhase(now: Date = new Date(), times?: SolarTimes): SolarPhase {
  const solar = times || calculateSolarTimes(now);

  const currentTime = now.getTime();
  const sunriseTime = solar.sunrise.getTime();
  const goldenHourStartTime = solar.goldenHourStart.getTime();
  const duskTime = solar.dusk.getTime();

  // 午前中（日の出後3.5時間）の境界
  const morningEndTime = sunriseTime + 3.5 * 60 * 60 * 1000;

  if (currentTime >= sunriseTime && currentTime < morningEndTime) {
    return 'morning';
  }

  if (currentTime >= morningEndTime && currentTime < goldenHourStartTime) {
    return 'day';
  }

  if (currentTime >= goldenHourStartTime && currentTime < duskTime) {
    return 'goldenHour';
  }

  return 'night';
}

/**
 * 太陽フェーズに応じたムード情報、検索キーワード、減光フラグ、フォールバック画像を取得
 */
export function getSolarMoodInfo(now: Date = new Date(), times?: SolarTimes): SolarMoodInfo {
  const solarTimes = times || calculateSolarTimes(now);
  const phase = getSolarPhase(now, solarTimes);

  switch (phase) {
    case 'morning':
      return {
        phase: 'morning',
        label: 'Morning',
        emoji: '🌿',
        query: 'morning nature,sunrise,misty morning,fog landscape',
        isDimmed: false,
        sunrise: solarTimes.sunrise,
        sunset: solarTimes.sunset,
        fallbackUrl:
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
      };
    case 'day':
      return {
        phase: 'day',
        label: 'Daylight',
        emoji: '☀️',
        query: 'daylight landscape,bright architecture,clear sky nature',
        isDimmed: false,
        sunrise: solarTimes.sunrise,
        sunset: solarTimes.sunset,
        fallbackUrl:
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=80',
      };
    case 'goldenHour':
      return {
        phase: 'goldenHour',
        label: 'Golden Hour',
        emoji: '🌅',
        query: 'golden hour,sunset,dusk,twilight,warm glow',
        isDimmed: false,
        sunrise: solarTimes.sunrise,
        sunset: solarTimes.sunset,
        fallbackUrl:
          'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=2000&q=80',
      };
    case 'night':
    default:
      return {
        phase: 'night',
        label: 'Night',
        emoji: '🌙',
        query: 'night sky,stars,astrophotography,city night,dark calm',
        isDimmed: true,
        sunrise: solarTimes.sunrise,
        sunset: solarTimes.sunset,
        fallbackUrl:
          'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?auto=format&fit=crop&w=2000&q=80',
      };
  }
}
