import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Topo } from '@/components/topo';
import { Card, Chip, T } from '@/components/ui';
import { usePalette } from '@/hooks/use-palette';

/** Pantalla provisoria para las pestañas que todavía no están construidas. */
export function ComingSoon({
  eyebrow,
  title,
  icon,
  intro,
  bullets,
  premium,
}: {
  eyebrow: string;
  title: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  intro: string;
  bullets: string[];
  premium?: boolean;
}) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <Topo color={c.topo} opacity={c.topoOpacity} size={520} style={{ top: -60, left: 40 }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
        <T variant="eyebrow" color={c.accent}>{eyebrow}</T>
        <T variant="title" style={{ marginTop: 4 }}>{title}</T>

        <Card style={{ marginTop: 22, gap: 14 }}>
          <View style={[styles.iconWrap, { backgroundColor: premium ? c.goldSoft : c.accentSoft }]}>
            <Ionicons name={icon} size={26} color={premium ? c.gold : c.accent} />
          </View>
          <Chip tone={premium ? 'gold' : 'sky'}>{premium ? 'Clipping Premium · próximamente' : 'Próximamente'}</Chip>
          <T>{intro}</T>
          <View style={{ gap: 8 }}>
            {bullets.map((b) => (
              <View key={b} style={styles.bullet}>
                <Ionicons name="checkmark-circle" size={18} color={c.ok} />
                <T style={{ flex: 1 }}>{b}</T>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  iconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bullet: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
