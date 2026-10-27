import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Logbook guardado en el teléfono (AsyncStorage) cuando no has iniciado sesión.
 * Con sesión iniciada, los ascensos viven en Supabase (ver src/lib/cloud.ts).
 */

export const ROUTE_TYPES = ['Deportiva', 'Trad', 'Multilargo', 'Boulder'] as const;
export const STYLES = ['A vista', 'Flash', 'Encadene', 'Top rope', 'Proyecto'] as const;
export const SECTORS = ['Petrohué', 'Cochamó', 'El Manzano', 'Las Chilcas', 'Otro'];

export type RouteType = (typeof ROUTE_TYPES)[number];
export type ClimbStyle = (typeof STYLES)[number];

export type Ascent = {
  id: string;
  ruta: string;
  sector: string;
  tipo: RouteType;
  /** Grado en escala base: francesa para vías, V para boulder (ver src/lib/grades.ts) */
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

export async function saveAscents(all: Ascent[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export function newAscentId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function sortAscents(all: Ascent[]) {
  return [...all].sort((a, b) => b.fecha.localeCompare(a.fecha));
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
