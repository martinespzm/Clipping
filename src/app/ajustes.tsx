import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, formStyles } from '@/components/form';
import { Card, T } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import {
  BOULDER_SYSTEMS,
  displayGrade,
  ROUTE_SYSTEMS,
  type BoulderSystem,
  type RouteSystem,
} from '@/lib/grades';
import { useAppData } from '@/providers/app-data';

const ROUTE_SAMPLE = ['6a', '6b+', '7a', '7c'];
const BOULDER_SAMPLE = ['V2', 'V4', 'V6', 'V8'];

export default function AjustesScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { systems, setSystems, cloudEnabled, session } = useAppData();

  return (
    <ScrollView
      style={{ backgroundColor: c.screen }}
      contentContainerStyle={[formStyles.content, { paddingBottom: insets.bottom + 24 }]}>
      <T muted>
        Elige cómo quieres ver los grados. Tus ascensos se convierten solos: puedes cambiar de sistema cuando
        quieras sin perder nada.
      </T>

      <Field label="Vías (deportiva, trad, multilargo)">
        <Card style={{ paddingVertical: 4 }}>
          {(Object.keys(ROUTE_SYSTEMS) as RouteSystem[]).map((k, i) => (
            <SystemRow
              key={k}
              first={i === 0}
              label={ROUTE_SYSTEMS[k].label}
              sample={ROUTE_SAMPLE.map((g) => displayGrade(g, { ...systems, route: k })).join(' · ')}
              selected={systems.route === k}
              onPress={() => setSystems({ ...systems, route: k })}
            />
          ))}
        </Card>
      </Field>

      <Field label="Boulder">
        <Card style={{ paddingVertical: 4 }}>
          {(Object.keys(BOULDER_SYSTEMS) as BoulderSystem[]).map((k, i) => (
            <SystemRow
              key={k}
              first={i === 0}
              label={BOULDER_SYSTEMS[k].label}
              sample={BOULDER_SAMPLE.map((g) => displayGrade(g, { ...systems, boulder: k })).join(' · ')}
              selected={systems.boulder === k}
              onPress={() => setSystems({ ...systems, boulder: k })}
            />
          ))}
        </Card>
      </Field>

      <T variant="small" muted>
        Las equivalencias entre sistemas son aproximadas, como en cualquier tabla de grados.
      </T>

      {cloudEnabled && (
        <Field label="Cuenta">
          <Pressable onPress={() => router.push('/cuenta')}>
            <Card style={styles.accountRow}>
              <Ionicons name={session ? 'cloud-done-outline' : 'cloud-upload-outline'} size={22} color={c.accent} />
              <View style={{ flex: 1 }}>
                <T variant="bold">{session ? 'Sesión iniciada' : 'Iniciar sesión o crear cuenta'}</T>
                <T variant="small" muted numberOfLines={1}>
                  {session ? session.user.email : 'Guarda tu perfil y logbook en la nube'}
                </T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.muted} />
            </Card>
          </Pressable>
        </Field>
      )}
    </ScrollView>
  );
}

function SystemRow({
  label,
  sample,
  selected,
  onPress,
  first,
}: {
  label: string;
  sample: string;
  selected: boolean;
  onPress: () => void;
  first: boolean;
}) {
  const c = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[styles.row, !first && { borderTopWidth: 1, borderTopColor: c.line }]}>
      <View style={{ flex: 1 }}>
        <T variant="bold">{label}</T>
        <T style={{ fontFamily: Fonts.mono, fontSize: 13 }} muted>{sample}</T>
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? c.accent : c.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
