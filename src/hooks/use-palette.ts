import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

/** Devuelve la paleta clara u oscura según el modo del teléfono. */
export function usePalette() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
