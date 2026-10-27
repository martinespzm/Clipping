import { StyleSheet, View } from 'react-native';

import { Chip, Grade, T } from '@/components/ui';
import { usePalette } from '@/hooks/use-palette';
import { shortDate, type Ascent } from '@/lib/ascents';
import { displayGrade } from '@/lib/grades';
import { useAppData } from '@/providers/app-data';

/** Una fila del logbook: grado, vía, sector, estilo y fecha. */
export function AscentRow({ a, first }: { a: Ascent; first: boolean }) {
  const c = usePalette();
  const { systems } = useAppData();
  const tone = a.estilo === 'Flash' || a.estilo === 'A vista' ? 'ok' : a.estilo === 'Proyecto' ? 'warn' : 'neutral';
  return (
    <View style={[styles.row, !first && { borderTopWidth: 1, borderTopColor: c.line }]}>
      <Grade>{displayGrade(a.grado, systems)}</Grade>
      <View style={{ flex: 1 }}>
        <T variant="bold" numberOfLines={1}>{a.ruta}</T>
        <T variant="small" muted numberOfLines={1}>
          {a.sector} · {a.tipo}
          {a.largos > 1 ? ` · ${a.largos} largos` : ''}
        </T>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 3 }}>
        <Chip tone={tone}>{a.estilo}</Chip>
        <T variant="mono" muted style={{ fontSize: 12 }}>{shortDate(a.fecha)}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
});
