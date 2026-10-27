import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SYSTEMS, type GradeSystems } from '@/lib/grades';

export type Profile = {
  name: string;
  handle: string;
  bio: string;
  /** Año en que empezaste a escalar */
  climbingSince: number | null;
  /** Grado máximo en escala base (francesa / V) */
  maxRoute: string | null;
  maxBoulder: string | null;
  sectors: string[];
  location: string;
  /** URL pública (Supabase) o imagen en base64 (solo en el teléfono) */
  avatarUrl: string | null;
};

export const EMPTY_PROFILE: Profile = {
  name: '',
  handle: '',
  bio: '',
  climbingSince: null,
  maxRoute: null,
  maxBoulder: null,
  sectors: [],
  location: '',
  avatarUrl: null,
};

const PROFILE_KEY = 'clipping/profile/v1';
const SYSTEMS_KEY = 'clipping/grade-systems/v1';

export async function loadLocalProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : EMPTY_PROFILE;
  } catch {
    return EMPTY_PROFILE;
  }
}

export async function saveLocalProfile(p: Profile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export async function loadGradeSystems(): Promise<GradeSystems> {
  try {
    const raw = await AsyncStorage.getItem(SYSTEMS_KEY);
    return raw ? { ...DEFAULT_SYSTEMS, ...JSON.parse(raw) } : DEFAULT_SYSTEMS;
  } catch {
    return DEFAULT_SYSTEMS;
  }
}

export async function saveGradeSystems(s: GradeSystems) {
  await AsyncStorage.setItem(SYSTEMS_KEY, JSON.stringify(s));
}

/** Nombre corto para saludar ("Hola, Martín"). */
export function firstName(p: Profile) {
  return p.name.trim().split(/\s+/)[0] || 'escalador';
}

export function initials(p: Profile) {
  const parts = p.name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
}
