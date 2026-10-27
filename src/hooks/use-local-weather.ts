import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { fetchWeather, type Weather } from '@/lib/weather';

type State =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error'; message: string }
  | { status: 'ready'; weather: Weather; place: string };

/** Pide permiso de ubicación y trae el clima del lugar donde estás. */
export function useLocalWeather() {
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ status: 'denied' });
        return;
      }
      // La última ubicación conocida es instantánea; si no hay, pedimos una nueva.
      const pos =
        (await Location.getLastKnownPositionAsync({ maxAge: 30 * 60 * 1000 })) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      const { latitude, longitude } = pos.coords;

      const [weather, place] = await Promise.all([
        fetchWeather(latitude, longitude),
        placeName(latitude, longitude),
      ]);
      setState({ status: 'ready', weather, place });
    } catch {
      setState({ status: 'error', message: 'Revisa tu conexión a internet e intenta de nuevo.' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { state, reload: load };
}

async function placeName(latitude: number, longitude: number) {
  try {
    const [addr] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return addr?.city || addr?.subregion || addr?.district || addr?.region || 'Tu ubicación';
  } catch {
    return 'Tu ubicación';
  }
}
