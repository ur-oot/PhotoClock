import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  className = 'w-4 h-4',
}) => {
  // WMO Weather Interpretation Codes (WW)
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, overcast
  // 45, 48: Fog
  // 51, 53, 55: Drizzle
  // 61, 63, 65: Rain (slight, moderate, heavy)
  // 71, 73, 75, 77: Snow
  // 80, 81, 82: Rain showers
  // 85, 86: Snow showers
  // 95, 96, 99: Thunderstorm

  if (code === 0) {
    return <Sun className={`${className} text-amber-500`} />;
  }

  if (code === 1 || code === 2) {
    return <CloudSun className={`${className} text-amber-500/90`} />;
  }

  if (code === 3) {
    return <Cloud className={`${className} text-stone-500`} />;
  }

  if (code === 45 || code === 48) {
    return <CloudFog className={`${className} text-stone-400`} />;
  }

  if (code >= 51 && code <= 55) {
    return <CloudDrizzle className={`${className} text-sky-500`} />;
  }

  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return <CloudRain className={`${className} text-sky-600`} />;
  }

  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <Snowflake className={`${className} text-cyan-400`} />;
  }

  if (code >= 95 && code <= 99) {
    return <CloudLightning className={`${className} text-amber-600`} />;
  }

  return <Sun className={`${className} text-amber-500`} />;
};
