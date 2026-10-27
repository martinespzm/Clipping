import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type TextProps, type ViewProps } from 'react-native';

import { Fonts, Radius, type Palette } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

type Variant = 'body' | 'small' | 'eyebrow' | 'title' | 'h3' | 'mono' | 'bold';

/** Texto con las fuentes y colores de Clipping. */
export function T({
  variant = 'body',
  muted,
  color,
  style,
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean; color?: string }) {
  const c = usePalette();
  return (
    <Text
      {...rest}
      style={[styles[variant], { color: color ?? (muted ? c.muted : c.fg) }, style]}
    />
  );
}

export function Card({ style, ...rest }: ViewProps) {
  const c = usePalette();
  return (
    <View
      {...rest}
      style={[
        { backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: Radius.lg, padding: 14 },
        style,
      ]}
    />
  );
}

export type Tone = 'ok' | 'warn' | 'bad' | 'sky' | 'gold' | 'neutral';

export function Chip({ tone = 'neutral', children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  const c = usePalette();
  const [bg, fg] = toneColors(c, tone);
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      {icon}
      <Text style={[styles.chipText, { color: fg }]}>{children}</Text>
    </View>
  );
}

/** Etiqueta de grado tipo marca de equipo (fondo oscuro, letra mono). */
export function Grade({ children }: { children: string }) {
  const c = usePalette();
  return (
    <View style={[styles.grade, { backgroundColor: c.fg }]}>
      <Text style={[styles.gradeText, { color: c.screen }]}>{children}</Text>
    </View>
  );
}

export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <T variant="h3">{title}</T>
      {right}
    </View>
  );
}

export function toneColors(c: Palette, tone: Tone): [string, string] {
  switch (tone) {
    case 'ok': return [c.okSoft, c.ok];
    case 'warn': return [c.warnSoft, c.warn];
    case 'bad': return [c.badSoft, c.bad];
    case 'sky': return [c.skySoft, c.sky];
    case 'gold': return [c.goldSoft, c.gold];
    default: return [c.surface2, c.muted];
  }
}

const styles = StyleSheet.create({
  body: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 21 },
  bold: { fontFamily: Fonts.bodySemi, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18 },
  eyebrow: {
    fontFamily: Fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { fontFamily: Fonts.displayBlack, fontSize: 34, lineHeight: 36, textTransform: 'uppercase' },
  h3: { fontFamily: Fonts.display, fontSize: 20, letterSpacing: 0.6, textTransform: 'uppercase' },
  mono: { fontFamily: Fonts.mono, fontSize: 13 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  chipText: { fontFamily: Fonts.bodySemi, fontSize: 12 },
  grade: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2, minWidth: 38, alignItems: 'center' },
  gradeText: { fontFamily: Fonts.monoBold, fontSize: 13 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});
