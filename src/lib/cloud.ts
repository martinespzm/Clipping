import { decode } from 'base64-arraybuffer';

import type { Ascent, ClimbStyle, RouteType } from '@/lib/ascents';
import type { Profile } from '@/lib/profile';
import { AVATAR_BUCKET, supabase } from '@/lib/supabase';

/**
 * Lectura y escritura en Supabase. Las tablas se crean con supabase/schema.sql.
 * Todas las funciones asumen que hay una sesión iniciada.
 */

type ProfileRow = {
  id: string;
  name: string | null;
  handle: string | null;
  bio: string | null;
  climbing_since: number | null;
  max_route: string | null;
  max_boulder: string | null;
  sectors: string[] | null;
  location: string | null;
  avatar_url: string | null;
};

type AscentRow = {
  id: string;
  user_id: string;
  route: string;
  sector: string;
  type: string;
  grade: string;
  style: string;
  date: string;
  pitches: number;
  notes: string | null;
};

function db() {
  if (!supabase) throw new Error('Supabase no está configurado');
  return supabase;
}

function rowToProfile(r: ProfileRow): Profile {
  return {
    name: r.name ?? '',
    handle: r.handle ?? '',
    bio: r.bio ?? '',
    climbingSince: r.climbing_since,
    maxRoute: r.max_route,
    maxBoulder: r.max_boulder,
    sectors: r.sectors ?? [],
    location: r.location ?? '',
    avatarUrl: r.avatar_url,
  };
}

function profileToRow(userId: string, p: Profile): ProfileRow {
  return {
    id: userId,
    name: p.name || null,
    handle: p.handle || null,
    bio: p.bio || null,
    climbing_since: p.climbingSince,
    max_route: p.maxRoute,
    max_boulder: p.maxBoulder,
    sectors: p.sectors,
    location: p.location || null,
    avatar_url: p.avatarUrl,
  };
}

function rowToAscent(r: AscentRow): Ascent {
  return {
    id: r.id,
    ruta: r.route,
    sector: r.sector,
    tipo: r.type as RouteType,
    grado: r.grade,
    estilo: r.style as ClimbStyle,
    fecha: r.date,
    largos: r.pitches,
    notas: r.notes ?? undefined,
  };
}

function ascentToRow(userId: string, a: Ascent): AscentRow {
  return {
    id: a.id,
    user_id: userId,
    route: a.ruta,
    sector: a.sector,
    type: a.tipo,
    grade: a.grado,
    style: a.estilo,
    date: a.fecha,
    pitches: a.largos,
    notes: a.notas ?? null,
  };
}

/** Devuelve el perfil de la nube, o null si todavía no existe. */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await db().from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data ? rowToProfile(data as ProfileRow) : null;
}

export async function upsertProfile(userId: string, p: Profile) {
  const { error } = await db().from('profiles').upsert(profileToRow(userId, p));
  if (error) {
    if (error.code === '23505') throw new Error('Ese nombre de usuario ya está ocupado. Prueba con otro.');
    throw error;
  }
}

export async function fetchAscents(userId: string): Promise<Ascent[]> {
  const { data, error } = await db()
    .from('ascents')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as AscentRow[]).map(rowToAscent);
}

export async function upsertAscents(userId: string, ascents: Ascent[]) {
  if (ascents.length === 0) return;
  const { error } = await db().from('ascents').upsert(ascents.map((a) => ascentToRow(userId, a)));
  if (error) throw error;
}

/** Sube la foto de perfil y devuelve su URL pública. */
export async function uploadAvatar(userId: string, base64: string, mimeType = 'image/jpeg') {
  const ext = mimeType.split('/')[1] ?? 'jpg';
  // Nombre nuevo en cada subida para que el teléfono no muestre la foto vieja guardada en caché.
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await db().storage.from(AVATAR_BUCKET).upload(path, decode(base64), {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw error;
  return db().storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}
