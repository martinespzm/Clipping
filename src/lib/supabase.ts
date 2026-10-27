import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

/**
 * Conexión con Supabase (cuentas y datos en la nube).
 * La URL y la clave vienen del archivo .env (ver .env.example).
 * Si no están, la app funciona igual pero guarda todo solo en el teléfono.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
// En la versión web, Expo arma las páginas primero en el servidor, donde no hay almacenamiento.
const isServer = Platform.OS === 'web' && typeof window === 'undefined';

export const supabase =
  url && key && !isServer
    ? createClient(url, key, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          lock: processLock,
        },
      })
    : null;

export const AVATAR_BUCKET = 'avatars';

// Renovar la sesión solo mientras la app está abierta.
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
