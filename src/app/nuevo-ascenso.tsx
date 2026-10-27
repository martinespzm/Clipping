import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T } from '@/components/ui';
import { Fonts, Radius } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import {
  addAscent,
  gradesFor,
  localDate,
  ROUTE_TYPES,
  SECTORS,
  shortDate,
  STYLES,
  type ClimbStyle,
  type RouteType,
} from '@/lib/ascents';

function recentDates() {
  return [0, 1, 2, 3].map((n) => ({
    label: n === 0 ? 'Hoy' : n === 1 ? 'Ayer' : shortDate(localDate(n)),
    value: localDate(n),
  }));
}

export default function NuevoAscensoScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const [DATES] = useState(recentDates);
  const [ruta, setRuta] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [otroSector, setOtroSector] = useState('');
  const [tipo, setTipo] = useState<RouteType>('Deportiva');
  const [grado, setGrado] = useState('6b+');
  const [largos, setLargos] = useState(1);
  const [estilo, setEstilo] = useState<ClimbStyle>('Encadene');
  const [fecha, setFecha] = useState(DATES[0].value);
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  function changeTipo(t: RouteType) {
    setTipo(t);
    setGrado(t === 'Boulder' ? 'V3' : '6b+');
    setLargos(t === 'Multilargo' ? 4 : 1);
  }

  async function save() {
    const nombre = ruta.trim();
    if (!nombre) {
      Alert.alert('Falta el nombre de la vía', 'Escribe cómo se llama la vía que escalaste.');
      return;
    }
    setSaving(true);
    try {
      await addAscent({
        ruta: nombre,
        sector: sector === 'Otro' ? otroSector.trim() || 'Otro' : sector,
        tipo,
        grado,
        estilo,
        fecha,
        largos,
        notas: notas.trim() || undefined,
      });
      router.back();
    } catch (e) {
      setSaving(false);
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : String(e));
    }
  }

  const input = [styles.input, { backgroundColor: c.surface, borderColor: c.line, color: c.fg }];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.screen }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Field label="Nombre de la vía">
          <TextInput
            value={ruta}
            onChangeText={setRuta}
            placeholder="Ej. Fisura del Cóndor"
            placeholderTextColor={c.muted}
            style={input}
            autoFocus
            returnKeyType="done"
          />
        </Field>

        <Field label="Sector">
          <Options options={SECTORS} value={sector} onChange={setSector} />
          {sector === 'Otro' && (
            <TextInput
              value={otroSector}
              onChangeText={setOtroSector}
              placeholder="Nombre del sector"
              placeholderTextColor={c.muted}
              style={[input, { marginTop: 8 }]}
            />
          )}
        </Field>

        <Field label="Tipo">
          <Options options={ROUTE_TYPES} value={tipo} onChange={changeTipo} />
        </Field>

        <Field label="Grado">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {gradesFor(tipo).map((g) => (
              <Pill key={g} label={g} selected={g === grado} onPress={() => setGrado(g)} mono />
            ))}
          </ScrollView>
        </Field>

        {tipo !== 'Boulder' && (
          <Field label="Largos">
            <View style={styles.stepper}>
              <StepButton label="−" onPress={() => setLargos((n) => Math.max(1, n - 1))} />
              <T style={{ fontFamily: Fonts.monoBold, fontSize: 20, minWidth: 40, textAlign: 'center' }}>{largos}</T>
              <StepButton label="+" onPress={() => setLargos((n) => Math.min(40, n + 1))} />
            </View>
          </Field>
        )}

        <Field label="Estilo">
          <Options options={STYLES} value={estilo} onChange={setEstilo} />
        </Field>

        <Field label="Fecha">
          <View style={styles.wrap}>
            {DATES.map((d) => (
              <Pill key={d.value} label={d.label} selected={d.value === fecha} onPress={() => setFecha(d.value)} />
            ))}
          </View>
        </Field>

        <Field label="Notas (opcional)">
          <TextInput
            value={notas}
            onChangeText={setNotas}
            placeholder="Beta, condiciones de la roca, con quién fuiste…"
            placeholderTextColor={c.muted}
            style={[input, { minHeight: 80, textAlignVertical: 'top' }]}
            multiline
          />
        </Field>

        <Pressable
          onPress={save}
          disabled={saving}
          style={({ pressed }) => [styles.save, { backgroundColor: c.accent, opacity: pressed || saving ? 0.8 : 1 }]}>
          <T style={styles.saveText} color={c.onAccent}>{saving ? 'Guardando…' : 'Guardar ascenso'}</T>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <T variant="eyebrow" muted>{label}</T>
      {children}
    </View>
  );
}

function Options<V extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly V[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => (
        <Pill key={o} label={o} selected={o === value} onPress={() => onChange(o)} />
      ))}
    </View>
  );
}

function Pill({ label, selected, onPress, mono }: { label: string; selected: boolean; onPress: () => void; mono?: boolean }) {
  const c = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.pill,
        { backgroundColor: selected ? c.fg : c.surface, borderColor: selected ? c.fg : c.line },
      ]}>
      <T
        style={{ fontFamily: mono ? Fonts.monoBold : Fonts.bodySemi, fontSize: 14 }}
        color={selected ? c.screen : c.fg}>
        {label}
      </T>
    </Pressable>
  );
}

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  const c = usePalette();
  return (
    <Pressable onPress={onPress} style={[styles.stepBtn, { backgroundColor: c.surface, borderColor: c.line }]}>
      <T style={{ fontSize: 22, lineHeight: 24 }}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 18 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm + 2,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  save: { borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  saveText: { fontFamily: Fonts.display, fontSize: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
});
