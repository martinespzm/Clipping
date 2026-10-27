import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AscentRow } from '@/components/ascent-row';
import { Ridge, Topo } from '@/components/topo';
import { Card, Chip, SectionHeader, T } from '@/components/ui';
import { Fonts, Radius } from '@/constants/theme';
import { useLocalWeather } from '@/hooks/use-local-weather';
import { usePalette } from '@/hooks/use-palette';
import { localDate, MONTH_NAMES } from '@/lib/ascents';
import { displayGrade, gradeRank } from '@/lib/grades';
import { firstName, initials } from '@/lib/profile';
import { useAppData } from '@/providers/app-data';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function InicioScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { state, reload } = useLocalWeather();
  const { ascents, profile, systems } = useAppData();

  const now = new Date();
  const monthPrefix = localDate().slice(0, 7);
  const month = ascents.filter((a) => a.fecha.startsWith(monthPrefix));
  const top = month
    .filter((a) => !a.grado.startsWith('V'))
    .sort((a, b) => gradeRank(b.grado) - gradeRank(a.grado))[0];
  const largos = month.reduce((n, a) => n + (a.largos || 1), 0);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={c.accent} />}>
        <View style={styles.top}>
          <View>
            <T variant="eyebrow" color={c.accent}>
              {DAYS[now.getDay()]} {now.getDate()} de {MONTH_NAMES[now.getMonth()]}
            </T>
            <T variant="title" style={{ marginTop: 2 }}>Hola, {firstName(profile)}</T>
          </View>
          <Pressable
            onPress={() => router.navigate('/perfil')}
            accessibilityLabel="Ir a tu perfil"
            style={[styles.avatar, { backgroundColor: c.accent }]}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
            ) : profile.name ? (
              <T style={{ fontFamily: Fonts.bodyBold }} color={c.onAccent}>{initials(profile)}</T>
            ) : (
              <Ionicons name="person" size={20} color={c.onAccent} />
            )}
          </Pressable>
        </View>

        <WeatherHero state={state} onRetry={reload} />

        <Pressable
          onPress={() => router.push('/nuevo-ascenso')}
          style={({ pressed }) => [styles.cta, { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 }]}>
          <Topo color="#FFFFFF" opacity={0.12} size={300} style={{ left: 120, top: -90 }} />
          <View style={styles.ctaPlus}>
            <Ionicons name="add" size={26} color={c.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <T style={styles.ctaTitle} color="#FFFFFF">Registrar ascenso</T>
            <T variant="small" color="rgba(255,255,255,.85)">Vía, grado y estilo en 20 segundos</T>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>

        <View style={styles.section}>
          <SectionHeader title={`Tu ${MONTH_NAMES[now.getMonth()]}`} />
          <View style={styles.stats}>
            <Stat value={String(month.length)} label="ascensos" />
            <Stat value={String(largos)} label="largos" />
            <Stat value={top ? displayGrade(top.grado, systems) : '–'} label="grado top" mono />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Tus últimos ascensos" />
          {ascents.length === 0 ? (
            <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 22 }}>
              <Ionicons name="trail-sign-outline" size={28} color={c.muted} />
              <T variant="bold">Tu logbook está vacío</T>
              <T variant="small" muted style={{ textAlign: 'center' }}>
                Registra tu primer ascenso y aparecerá aquí.
              </T>
            </Card>
          ) : (
            <Card style={{ paddingVertical: 2 }}>
              {ascents.slice(0, 5).map((a, i) => (
                <AscentRow key={a.id} a={a} first={i === 0} />
              ))}
              {ascents.length > 5 && (
                <Pressable onPress={() => router.navigate('/perfil')} style={{ paddingVertical: 11, borderTopWidth: 1, borderTopColor: c.line }}>
                  <T variant="bold" color={c.accent}>Ver todo tu logbook ({ascents.length}) →</T>
                </Pressable>
              )}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function WeatherHero({
  state,
  onRetry,
}: {
  state: ReturnType<typeof useLocalWeather>['state'];
  onRetry: () => void;
}) {
  const c = usePalette();
  return (
    <View style={[styles.hero, { backgroundColor: c.pine }]}>
      <Topo color={c.pineInk} opacity={0.1} size={380} style={{ left: 60, top: -40 }} />
      <Ridge />

      {state.status === 'loading' && (
        <View style={styles.heroCenter}>
          <ActivityIndicator color={c.pineInk} />
          <T variant="small" color={c.pineMuted}>Buscando el clima donde estás…</T>
        </View>
      )}

      {state.status === 'denied' && (
        <View style={styles.heroCenter}>
          <Ionicons name="location-outline" size={28} color={c.pineInk} />
          <T variant="bold" color={c.pineInk} style={{ textAlign: 'center' }}>
            Activa la ubicación para ver el clima cerca de ti
          </T>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <HeroLink label="Reintentar" onPress={onRetry} />
            <HeroLink label="Abrir ajustes" onPress={() => Linking.openSettings()} />
          </View>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.heroCenter}>
          <Ionicons name="cloud-offline-outline" size={28} color={c.pineInk} />
          <T variant="bold" color={c.pineInk}>No pudimos cargar el clima</T>
          <T variant="small" color={c.pineMuted} style={{ textAlign: 'center' }}>{state.message}</T>
          <HeroLink label="Reintentar" onPress={onRetry} />
        </View>
      )}

      {state.status === 'ready' && (
        <View style={{ gap: 12 }}>
          <View style={styles.rowBetween}>
            <View style={styles.placeChip}>
              <Ionicons name="location" size={12} color={c.pineInk} />
              <T variant="small" color={c.pineInk} numberOfLines={1}>Cerca de ti · {state.place}</T>
            </View>
            <T variant="small" color={c.pineMuted}>
              {state.weather.updatedAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </T>
          </View>

          <View style={[styles.rowBetween, { alignItems: 'flex-end' }]}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <T style={styles.temp} color={c.pineInk}>{state.weather.temp}°</T>
                <Ionicons name={state.weather.icon} size={34} color={c.pineInk} />
              </View>
              <T variant="small" color={c.pineMuted}>
                {state.weather.sky} · sensación {state.weather.feels}°
              </T>
            </View>
            <Chip tone={state.weather.rock.tone}>{state.weather.rock.label}</Chip>
          </View>

          <View style={styles.window}>
            <Ionicons name="time-outline" size={15} color={c.pineMuted} />
            <T variant="small" color={c.pineMuted}>
              {state.weather.window ? 'Mejor ventana para escalar:' : 'Sin ventana seca en las próximas horas'}
            </T>
            {state.weather.window && <T variant="bold" color={c.pineInk}>{state.weather.window}</T>}
          </View>

          <View style={styles.wxStats}>
            <WxStat label={`Viento ${state.weather.windDir}`} value={`${state.weather.wind} km/h`} />
            <WxStat label="Lluvia 12 h" value={`${state.weather.rainChance}%`} />
            <WxStat label="Humedad" value={`${state.weather.humidity}%`} />
          </View>

          <HeroLink label="Ver pronóstico de tus sectores →" onPress={() => router.navigate('/clima')} />
        </View>
      )}
    </View>
  );
}

function HeroLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <T variant="bold" color="#FF9A6A">{label}</T>
    </Pressable>
  );
}

function WxStat({ label, value }: { label: string; value: string }) {
  const c = usePalette();
  return (
    <View style={styles.wxStat}>
      <T variant="small" color={c.pineMuted}>{label}</T>
      <T style={{ fontFamily: Fonts.monoBold, fontSize: 14 }} color={c.pineInk}>{value}</T>
    </View>
  );
}

function Stat({ value, label, mono }: { value: string; label: string; mono?: boolean }) {
  return (
    <Card style={{ flex: 1, paddingVertical: 12 }}>
      <T style={{ fontFamily: mono ? Fonts.monoBold : Fonts.display, fontSize: mono ? 20 : 26, lineHeight: 30 }}>
        {value}
      </T>
      <T variant="small" muted>{label}</T>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 42, height: 42 },
  hero: { borderRadius: Radius.lg, padding: 16, paddingBottom: 72, overflow: 'hidden', minHeight: 230 },
  heroCenter: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234,240,232,.12)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    flexShrink: 1,
  },
  temp: { fontFamily: Fonts.display, fontSize: 60, lineHeight: 60, letterSpacing: -1 },
  window: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  wxStats: { flexDirection: 'row', gap: 8 },
  wxStat: {
    flex: 1,
    backgroundColor: 'rgba(234,240,232,.10)',
    borderColor: 'rgba(234,240,232,.14)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.md,
    padding: 14,
    overflow: 'hidden',
  },
  ctaPlus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: { fontFamily: Fonts.display, fontSize: 21, textTransform: 'uppercase', letterSpacing: 0.4 },
  section: { marginTop: 10 },
  stats: { flexDirection: 'row', gap: 8 },
});
