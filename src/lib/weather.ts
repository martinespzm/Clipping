/**
 * Clima desde Open-Meteo (https://open-meteo.com): gratis y sin clave de API.
 */

export type RockCondition = { tone: 'ok' | 'warn' | 'bad'; label: string };

export type Weather = {
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  windDir: string;
  rainChance: number;
  sky: string;
  icon: WeatherIcon;
  rock: RockCondition;
  window: string | null;
  updatedAt: Date;
};

export type WeatherIcon =
  | 'sunny'
  | 'partly-sunny'
  | 'cloudy'
  | 'cloud'
  | 'rainy'
  | 'snow'
  | 'thunderstorm'
  | 'moon'
  | 'cloudy-night';

type OpenMeteoResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    precipitation: number[];
    precipitation_probability: (number | null)[];
  };
};

export async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day',
    hourly: 'precipitation,precipitation_probability',
    past_days: '1',
    forecast_days: '2',
    timezone: 'auto',
    wind_speed_unit: 'kmh',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const data: OpenMeteoResponse = await res.json();
  const c = data.current;

  // Las horas vienen en hora local del lugar ("2026-10-27T14:00"), así que
  // comparamos como texto con la hora actual que también entrega la API.
  const nowHour = c.time.slice(0, 13);
  const nowIdx = Math.max(0, data.hourly.time.findIndex((t) => t.slice(0, 13) === nowHour));
  const past24 = data.hourly.precipitation.slice(Math.max(0, nowIdx - 24), nowIdx);
  const rainedMm = past24.reduce((sum, mm) => sum + (mm ?? 0), 0);
  const next12 = data.hourly.precipitation_probability.slice(nowIdx, nowIdx + 12);
  const rainChance = Math.max(0, ...next12.map((p) => p ?? 0));
  const { sky, icon } = describeCode(c.weather_code, c.is_day === 1);

  return {
    temp: Math.round(c.temperature_2m),
    feels: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    wind: Math.round(c.wind_speed_10m),
    windDir: compass(c.wind_direction_10m),
    rainChance: Math.round(rainChance),
    sky,
    icon,
    rock: rockCondition(c.precipitation, rainedMm, c.relative_humidity_2m),
    window: bestWindow(data.hourly.time, data.hourly.precipitation_probability, nowIdx),
    updatedAt: new Date(),
  };
}

/** Estimación simple del estado de la roca según la lluvia reciente. */
function rockCondition(nowMm: number, last24Mm: number, humidity: number): RockCondition {
  if (nowMm > 0 || last24Mm >= 2) return { tone: 'bad', label: 'Roca mojada' };
  if (last24Mm >= 0.3 || humidity >= 85) return { tone: 'warn', label: 'Roca húmeda' };
  return { tone: 'ok', label: 'Roca seca' };
}

/** Bloque más largo de horas de día (8 a 20 h) con menos de 30 % de lluvia. */
function bestWindow(times: string[], probs: (number | null)[], from: number): string | null {
  let best: [number, number] | null = null;
  let start = -1;
  const end = Math.min(times.length, from + 24);
  for (let i = from; i <= end; i++) {
    const hour = i < end ? Number(times[i].slice(11, 13)) : -1;
    const good = i < end && hour >= 8 && hour < 20 && (probs[i] ?? 0) < 30;
    if (good && start < 0) start = i;
    if (!good && start >= 0) {
      if (!best || i - start > best[1] - best[0]) best = [start, i];
      start = -1;
    }
    // Solo buscamos la próxima ventana: si ya encontramos una y pasamos a otro día, paramos.
    if (best && hour === 20) break;
  }
  if (!best || best[1] - best[0] < 2) return null;
  const fmt = (i: number) => (i < times.length ? times[i].slice(11, 16) : '20:00');
  const isToday = times[best[0]].slice(0, 10) === times[from].slice(0, 10);
  return `${isToday ? '' : 'mañana '}${fmt(best[0])}–${fmt(best[1])}`;
}

function compass(deg: number) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(deg / 45) % 8];
}

/** Códigos WMO que usa Open-Meteo, en español. */
function describeCode(code: number, isDay: boolean): { sky: string; icon: WeatherIcon } {
  if (code === 0) return { sky: 'Despejado', icon: isDay ? 'sunny' : 'moon' };
  if (code <= 2) return { sky: 'Parcial nublado', icon: isDay ? 'partly-sunny' : 'cloudy-night' };
  if (code === 3) return { sky: 'Nublado', icon: 'cloudy' };
  if (code <= 48) return { sky: 'Neblina', icon: 'cloud' };
  if (code <= 57) return { sky: 'Llovizna', icon: 'rainy' };
  if (code <= 67) return { sky: 'Lluvia', icon: 'rainy' };
  if (code <= 77) return { sky: 'Nieve', icon: 'snow' };
  if (code <= 82) return { sky: 'Chubascos', icon: 'rainy' };
  if (code <= 86) return { sky: 'Chubascos de nieve', icon: 'snow' };
  return { sky: 'Tormenta', icon: 'thunderstorm' };
}
