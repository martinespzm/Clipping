import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AscentRow } from '@/components/ascent-row';
import { Options } from '@/components/form';
import { Topo } from '@/components/topo';
import { Card, Chip, SectionHeader, T } from '@/components/ui';
import { Fonts, Radius } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import { displayGrade, gradeRank, isBoulderGrade } from '@/lib/grades';
import { initials } from '@/lib/profile';
import { useAppData } from '@/providers/app-data';

const FILTERS = ['Todos', 'Vías', 'Boulder'] as const;

export default function PerfilScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { profile, ascents, systems, session, cloudEnabled, syncError, reload } = useAppData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todos');
  const [refreshing, setRefreshing] = useState(false);

  const years = profile.climbingSince ? Math.max(0, new Date().getFullYear() - profile.climbingSince) : null;
  // Si no pusiste grado máximo, usamos el más alto de tu logbook.
  const bestLogged = ascents
    .filter((a) => !isBoulderGrade(a.grado))
    .sort((a, b) => gradeRank(b.grado) - gradeRank(a.grado))[0]?.grado;
  const maxRoute = profile.maxRoute ?? bestLogged ?? null;
  const shown = ascents.filter((a) =>
    filter === 'Todos' ? true : filter === 'Boulder' ? a.tipo === 'Boulder' : a.tipo !== 'Boulder',
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <Topo color={c.topo} opacity={c.topoOpacity} size={520} style={{ top: -120, left: 60 }} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={c.accent}
            onRefresh={async () => {
              setRefreshing(true);
              await reload();
              setRefreshing(false);
            }}
          />
        }>
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <T variant="eyebrow" color={c.accent}>{profile.handle ? `@${profile.handle}` : 'Tu perfil'}</T>
            <T variant="title" numberOfLines={1} style={{ marginTop: 2 }}>Perfil</T>
          </View>
          <Pressable
            onPress={() => router.push('/ajustes')}
            accessibilityLabel="Ajustes"
            style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.line }]}>
            <Ionicons name="settings-outline" size={20} color={c.fg} />
          </Pressable>
        </View>

        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: c.accent }]}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : profile.name ? (
              <T variant="title" color={c.onAccent}>{initials(profile)}</T>
            ) : (
              <Ionicons name="person" size={38} color={c.onAccent} />
            )}
          </View>
          <View style={styles.stats}>
            <Stat value={String(ascents.length)} label="ascensos" />
            <Stat value={years === null ? '–' : String(years)} label={years === 1 ? 'año' : 'años'} />
            <Stat value={maxRoute ? displayGrade(maxRoute, systems) : '–'} label="grado máx." mono />
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <T variant="bold" style={{ fontSize: 17 }}>{profile.name || 'Escalador sin nombre'}</T>
          {!!profile.location && (
            <View style={styles.inline}>
              <Ionicons name="location-outline" size={14} color={c.muted} />
              <T variant="small" muted>{profile.location}</T>
            </View>
          )}
          {!!profile.bio && <T style={{ marginTop: 4 }}>{profile.bio}</T>}
          <View style={[styles.inline, { marginTop: 6, flexWrap: 'wrap' }]}>
            {profile.climbingSince && <Chip tone="sky">Escala desde {profile.climbingSince}</Chip>}
            {profile.maxRoute && <Chip tone="gold">Vía {displayGrade(profile.maxRoute, systems)}</Chip>}
            {profile.maxBoulder && <Chip tone="gold">Boulder {displayGrade(profile.maxBoulder, systems)}</Chip>}
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable
            onPress={() => router.push('/editar-perfil')}
            style={({ pressed }) => [styles.btn, { backgroundColor: c.surface, borderColor: c.line, opacity: pressed ? 0.8 : 1 }]}>
            <T variant="bold">Editar perfil</T>
          </Pressable>
          {cloudEnabled && (
            <Pressable
              onPress={() => router.push('/cuenta')}
              style={({ pressed }) => [
                styles.btn,
                session
                  ? { backgroundColor: c.surface, borderColor: c.line }
                  : { backgroundColor: c.accent, borderColor: c.accent },
                { opacity: pressed ? 0.8 : 1 },
              ]}>
              <Ionicons
                name={session ? 'cloud-done-outline' : 'cloud-upload-outline'}
                size={16}
                color={session ? c.ok : c.onAccent}
              />
              <T variant="bold" color={session ? c.fg : c.onAccent}>{session ? 'En la nube' : 'Crear cuenta'}</T>
            </Pressable>
          )}
        </View>

        {!!syncError && (
          <Card style={{ backgroundColor: c.badSoft, borderColor: c.badSoft, gap: 4 }}>
            <T variant="bold" color={c.bad}>No pudimos sincronizar con la nube</T>
            <T variant="small" color={c.bad}>{syncError}</T>
            <T variant="small" muted>Desliza hacia abajo para reintentar.</T>
          </Card>
        )}

        {!profile.name && (
          <Pressable onPress={() => router.push('/editar-perfil')}>
            <Card style={[styles.inline, { gap: 12 }]}>
              <Ionicons name="sparkles-outline" size={22} color={c.accent} />
              <View style={{ flex: 1 }}>
                <T variant="bold">Completa tu perfil</T>
                <T variant="small" muted>Foto, descripción, años escalando y tus sectores.</T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.muted} />
            </Card>
          </Pressable>
        )}

        {profile.sectors.length > 0 && (
          <View>
            <SectionHeader title="Sectores" />
            <View style={[styles.inline, { flexWrap: 'wrap', gap: 6 }]}>
              {profile.sectors.map((s) => (
                <View key={s} style={[styles.sector, { backgroundColor: c.surface, borderColor: c.line }]}>
                  <Ionicons name="flag-outline" size={13} color={c.accent} />
                  <T variant="small">{s}</T>
                </View>
              ))}
            </View>
          </View>
        )}

        <View>
          <SectionHeader title="Logbook" right={<T variant="mono" muted>{shown.length}</T>} />
          <Options options={FILTERS} value={filter} onChange={setFilter} />
          {shown.length === 0 ? (
            <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 22, marginTop: 10 }}>
              <Ionicons name="trail-sign-outline" size={28} color={c.muted} />
              <T variant="bold">Nada por aquí todavía</T>
              <Pressable onPress={() => router.push('/nuevo-ascenso')}>
                <T variant="bold" color={c.accent}>Registrar un ascenso</T>
              </Pressable>
            </Card>
          ) : (
            <Card style={{ paddingVertical: 2, marginTop: 10 }}>
              {shown.map((a, i) => (
                <AscentRow key={a.id} a={a} first={i === 0} />
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, mono }: { value: string; label: string; mono?: boolean }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <T style={{ fontFamily: mono ? Fonts.monoBold : Fonts.display, fontSize: mono ? 19 : 24, lineHeight: 28 }}>
        {value}
      </T>
      <T variant="small" muted>{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stats: { flex: 1, flexDirection: 'row' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  buttons: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm + 2,
    paddingVertical: 10,
  },
  sector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
