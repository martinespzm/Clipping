import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Logbook guardado en el teléfono (AsyncStorage).
 * Más adelante esto se puede sincronizar con un servidor.
 */

export const ROUTE_TYPES = ['Deportiva', 'Trad', 'Multilargo', 'Boulder'] as const;
export const STYLES = ['A vista', 'Flash', 'Encadene', 'Top rope', 'Proyecto'] as const;
export const FRENCH = ['5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b'];
export const VSCALE = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];
export const SECTORS = ['Petrohué', 'Cochamó', 'El Manzano', 'Las Chilcas', 'Otro'];

export type RouteType = (typeof ROUTE_TYPES)[number];
export type ClimbStyle = (typeof STYLES)[number];

export type Ascent = {
  id: string;
  ruta: string;
  sector: string;
  tipo: RouteType;
  grado: string;
  estilo: ClimbStyle;
  /** Fecha local en formato AAAA-MM-DD */
  fecha: string;
  largos: number;
  notas?: string;
};

const KEY = 'clipping/ascents/v1';

export async function loadAscents(): Promise<Ascent[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Ascent[]) : [];
  } catch {
    return [];
  }
}

export async function addAscent(input: Omit<Ascent, 'id'>): Promise<Ascent> {
  const ascent: Ascent = { ...input, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  const all = await loadAscents();
  all.unshift(ascent);
  all.sort((a, b) => b.fecha.localeCompare(a.fecha));
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
  return ascent;
}

export function gradesFor(tipo: RouteType) {
  return tipo === 'Boulder' ? VSCALE : FRENCH;
}

/** Posición del grado en su escala; los boulder (V) no compiten con los franceses. */
export function gradeRank(g: string) {
  return g.startsWith('V') ? -1 : FRENCH.indexOf(g);
}

/** Fecha local AAAA-MM-DD, con días hacia atrás opcionales. */
export function localDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function shortDate(fecha: string) {
  const [, m, d] = fecha.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}
