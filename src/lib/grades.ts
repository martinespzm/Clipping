/**
 * Sistemas de graduación.
 *
 * Los ascensos se guardan siempre en una escala "base" (francesa para vías,
 * V/Hueco para boulder) y se muestran en el sistema que elija cada escalador.
 * Así se puede cambiar de sistema sin tocar los datos guardados.
 */

export const FRENCH = ['5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b'];
export const VSCALE = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];

/** Equivalencias aproximadas, una por cada grado de FRENCH. */
const YDS = ['5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d', '5.13a', '5.13b', '5.13c', '5.13d'];
const UIAA = ['5', '5+', '6-', '6', '6+', '7-', '7', '7+', '7+/8-', '8-', '8', '8+', '8+/9-', '9-', '9', '9+', '9+/10-', '10-'];
/** Una por cada grado de VSCALE. */
const FONT = ['4', '5', '5+', '6A', '6B', '6C', '7A', '7A+', '7B', '7C', '7C+'];

export const ROUTE_SYSTEMS = {
  french: { label: 'Francesa', example: '6b+', grades: FRENCH },
  yds: { label: 'Yosemite (YDS)', example: '5.10d', grades: YDS },
  uiaa: { label: 'UIAA', example: '7', grades: UIAA },
} as const;

export const BOULDER_SYSTEMS = {
  v: { label: 'Hueco (V)', example: 'V4', grades: VSCALE },
  font: { label: 'Fontainebleau', example: '6B', grades: FONT },
} as const;

export type RouteSystem = keyof typeof ROUTE_SYSTEMS;
export type BoulderSystem = keyof typeof BOULDER_SYSTEMS;
export type GradeSystems = { route: RouteSystem; boulder: BoulderSystem };

export const DEFAULT_SYSTEMS: GradeSystems = { route: 'french', boulder: 'v' };

export function isBoulderGrade(base: string) {
  return base.startsWith('V');
}

/** Lista de grados base (para guardar) según el tipo de vía. */
export function baseGrades(boulder: boolean) {
  return boulder ? VSCALE : FRENCH;
}

/** Convierte un grado base ("6b+", "V3") al sistema elegido. */
export function displayGrade(base: string, s: GradeSystems) {
  if (isBoulderGrade(base)) {
    const i = VSCALE.indexOf(base);
    return i < 0 ? base : BOULDER_SYSTEMS[s.boulder].grades[i];
  }
  const i = FRENCH.indexOf(base);
  return i < 0 ? base : ROUTE_SYSTEMS[s.route].grades[i];
}

/** Posición del grado en su escala; los boulder no compiten con las vías. */
export function gradeRank(base: string) {
  return isBoulderGrade(base) ? -1 : FRENCH.indexOf(base);
}
