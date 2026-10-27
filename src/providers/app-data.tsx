import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadAscents, newAscentId, saveAscents, sortAscents, type Ascent } from '@/lib/ascents';
import { errorText } from '@/lib/errors';
import { fetchAscents, fetchProfile, upsertAscents, upsertProfile, uploadAvatar } from '@/lib/cloud';
import { DEFAULT_SYSTEMS, type GradeSystems } from '@/lib/grades';
import {
  EMPTY_PROFILE,
  loadGradeSystems,
  loadLocalProfile,
  saveGradeSystems,
  saveLocalProfile,
  type Profile,
} from '@/lib/profile';
import { supabase } from '@/lib/supabase';

/** Foto elegida con expo-image-picker, todavía sin guardar. */
export type PickedImage = { base64: string; mimeType: string };

type AppData = {
  /** true cuando ya se leyeron los datos guardados */
  ready: boolean;
  /** true si la app tiene la URL y la clave de Supabase */
  cloudEnabled: boolean;
  session: Session | null;
  profile: Profile;
  ascents: Ascent[];
  systems: GradeSystems;
  /** Último problema al sincronizar con la nube, para mostrarlo en pantalla */
  syncError: string | null;
  addAscent: (a: Omit<Ascent, 'id'>) => Promise<void>;
  saveProfile: (p: Profile, avatar?: PickedImage | null) => Promise<void>;
  setSystems: (s: GradeSystems) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  /** Devuelve true si Supabase pide confirmar el correo antes de entrar. */
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;
};

const Ctx = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [ascents, setAscents] = useState<Ascent[]>([]);
  const [systems, setSystemsState] = useState<GradeSystems>(DEFAULT_SYSTEMS);
  const [syncError, setSyncError] = useState<string | null>(null);
  // Sin Supabase no hay sesión que revisar.
  const [authChecked, setAuthChecked] = useState(!supabase);
  const userId = session?.user.id ?? null;

  // Sesión guardada + avisos cuando alguien entra o sale.
  useEffect(() => {
    loadGradeSystems().then(setSystemsState);
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setAuthChecked(true));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    setSyncError(null);
    if (!userId) {
      const [p, a] = await Promise.all([loadLocalProfile(), loadAscents()]);
      setProfile(p);
      setAscents(sortAscents(a));
      return;
    }
    try {
      await moveLocalDataToCloud(userId);
      const [p, a] = await Promise.all([fetchProfile(userId), fetchAscents(userId)]);
      setProfile(p ?? EMPTY_PROFILE);
      setAscents(a);
    } catch (e) {
      setSyncError(errorText(e));
    }
  }, [userId]);

  // Esperar a saber si hay sesión guardada antes de cargar los datos.
  useEffect(() => {
    if (authChecked) load().finally(() => setReady(true));
  }, [authChecked, load]);

  const addAscent = useCallback(
    async (input: Omit<Ascent, 'id'>) => {
      const a: Ascent = { ...input, id: newAscentId() };
      if (userId) {
        await upsertAscents(userId, [a]);
        setAscents((prev) => sortAscents([a, ...prev]));
      } else {
        const next = sortAscents([a, ...(await loadAscents())]);
        await saveAscents(next);
        setAscents(next);
      }
    },
    [userId],
  );

  const saveProfile = useCallback(
    async (p: Profile, avatar?: PickedImage | null) => {
      let next = p;
      if (avatar) {
        const url = userId
          ? await uploadAvatar(userId, avatar.base64, avatar.mimeType)
          : `data:${avatar.mimeType};base64,${avatar.base64}`;
        next = { ...p, avatarUrl: url };
      }
      if (userId) await upsertProfile(userId, next);
      else await saveLocalProfile(next);
      setProfile(next);
    },
    [userId],
  );

  const setSystems = useCallback(async (s: GradeSystems) => {
    setSystemsState(s);
    await saveGradeSystems(s);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(authErrorText(error.message));
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) throw new Error(authErrorText(error.message));
    return !data.session;
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const value = useMemo<AppData>(
    () => ({
      ready,
      cloudEnabled: !!supabase,
      session,
      profile,
      ascents,
      systems,
      syncError,
      addAscent,
      saveProfile,
      setSystems,
      signIn,
      signUp,
      signOut,
      reload: load,
    }),
    [ready, session, profile, ascents, systems, syncError, addAscent, saveProfile, setSystems, signIn, signUp, signOut, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppData debe usarse dentro de <AppDataProvider>');
  return v;
}

/**
 * Al iniciar sesión por primera vez, sube lo que guardaste sin cuenta
 * (ascensos y perfil) y lo borra del teléfono para no duplicarlo.
 */
async function moveLocalDataToCloud(userId: string) {
  const local = await loadAscents();
  if (local.length > 0) {
    await upsertAscents(userId, local);
    await saveAscents([]);
  }
  const cloudProfile = await fetchProfile(userId);
  if (cloudProfile) return;
  const p = await loadLocalProfile();
  // La foto local está guardada como texto base64; la subimos a Supabase.
  const m = p.avatarUrl?.match(/^data:(.+?);base64,(.*)$/);
  const avatarUrl = m ? await uploadAvatar(userId, m[2], m[1]).catch(() => null) : p.avatarUrl;
  try {
    await upsertProfile(userId, { ...p, avatarUrl });
  } catch {
    // Si el nombre de usuario ya lo tiene otra persona, guardamos el resto igual.
    await upsertProfile(userId, { ...p, avatarUrl, handle: '' });
  }
}

function authErrorText(msg: string) {
  if (/invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
  if (/email not confirmed/i.test(msg)) return 'Todavía no confirmas tu correo. Revisa tu bandeja de entrada.';
  if (/already registered/i.test(msg)) return 'Ese correo ya tiene una cuenta. Prueba iniciar sesión.';
  if (/password should be at least/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/invalid.*email|email.*invalid/i.test(msg)) return 'Ese correo no parece válido.';
  if (/network|fetch/i.test(msg)) return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
  return msg;
}
