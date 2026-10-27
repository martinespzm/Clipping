import { router } from 'expo-router';

/** Cierra la pantalla actual; si no hay a dónde volver, va al Inicio. */
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
