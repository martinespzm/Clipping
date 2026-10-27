import { useRef, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, type ScrollViewInstance, type TextInputProps, type ViewProps } from 'react-native';

import { T } from '@/components/ui';
import { Fonts, Radius } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

/** Piezas de formulario compartidas (nuevo ascenso, editar perfil, cuenta, ajustes). */

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.labelRow}>
        <T variant="eyebrow" muted>{label}</T>
        {hint}
      </View>
      {children}
    </View>
  );
}

export function Input({ style, ...rest }: TextInputProps) {
  const c = usePalette();
  return (
    <TextInput
      placeholderTextColor={c.muted}
      {...rest}
      style={[
        styles.input,
        { backgroundColor: c.surface, borderColor: c.line, color: c.fg },
        rest.multiline && { minHeight: 80, textAlignVertical: 'top' },
        style,
      ]}
    />
  );
}

export function Options<V extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly V[];
  value: V;
  onChange: (v: V) => void;
  /** Texto que se muestra para cada opción (por defecto, la opción misma) */
  label?: (v: V) => string;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => (
        <Pill key={o} label={label ? label(o) : o} selected={o === value} onPress={() => onChange(o)} />
      ))}
    </View>
  );
}

/** Fila deslizable de grados: guarda el grado base, muestra el del sistema elegido. */
export function GradePicker({
  grades,
  value,
  onChange,
  display,
  allowNone,
}: {
  grades: readonly string[];
  value: string | null;
  onChange: (g: string | null) => void;
  display: (g: string) => string;
  allowNone?: boolean;
}) {
  const scroll = useRef<ScrollViewInstance>(null);
  const scrolled = useRef(false);
  return (
    <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {allowNone && <Pill label="–" selected={value === null} onPress={() => onChange(null)} mono />}
      {grades.map((g) => (
        <Pill
          key={g}
          label={display(g)}
          selected={g === value}
          onPress={() => onChange(g)}
          mono
          // Al abrir, mover la fila para que se vea el grado elegido.
          onLayout={
            g === value
              ? (e) => {
                  if (scrolled.current) return;
                  scrolled.current = true;
                  scroll.current?.scrollTo({ x: Math.max(0, e.nativeEvent.layout.x - 80), animated: false });
                }
              : undefined
          }
        />
      ))}
    </ScrollView>
  );
}

export function Pill({
  label,
  selected,
  onPress,
  mono,
  onLayout,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  mono?: boolean;
  onLayout?: ViewProps['onLayout'];
}) {
  const c = usePalette();
  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.pill, { backgroundColor: selected ? c.fg : c.surface, borderColor: selected ? c.fg : c.line }]}>
      <T style={{ fontFamily: mono ? Fonts.monoBold : Fonts.bodySemi, fontSize: 14 }} color={selected ? c.screen : c.fg}>
        {label}
      </T>
    </Pressable>
  );
}

export function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  const c = usePalette();
  return (
    <Pressable onPress={onPress} style={[styles.stepBtn, { backgroundColor: c.surface, borderColor: c.line }]}>
      <T style={{ fontSize: 22, lineHeight: 24 }}>{label}</T>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  busy,
  variant = 'accent',
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  variant?: 'accent' | 'outline';
}) {
  const c = usePalette();
  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.button,
        outline
          ? { borderWidth: 1, borderColor: c.line, backgroundColor: c.surface }
          : { backgroundColor: c.accent },
        { opacity: pressed || busy ? 0.8 : 1 },
      ]}>
      <T style={styles.buttonText} color={outline ? c.fg : c.onAccent}>{label}</T>
    </Pressable>
  );
}

export const formStyles = StyleSheet.create({
  content: { padding: 16, gap: 18 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm + 2,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  wrap: formStyles.wrap,
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  stepBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  button: { borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  buttonText: { fontFamily: Fonts.display, fontSize: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
});
