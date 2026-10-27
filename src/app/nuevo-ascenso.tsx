import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, formStyles, GradePicker, Input, Options, Pill, PrimaryButton, StepButton } from '@/components/form';
import { T } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import { localDate, ROUTE_TYPES, SECTORS, shortDate, STYLES, type ClimbStyle, type RouteType } from '@/lib/ascents';
import { errorText } from '@/lib/errors';
import { goBack } from '@/lib/navigation';
import { BOULDER_SYSTEMS, baseGrades, displayGrade, ROUTE_SYSTEMS } from '@/lib/grades';
import { useAppData } from '@/providers/app-data';

function recentDates() {
  return [0, 1, 2, 3].map((n) => ({
    label: n === 0 ? 'Hoy' : n === 1 ? 'Ayer' : shortDate(localDate(n)),
    value: localDate(n),
  }));
}

export default function NuevoAscensoScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { addAscent, systems, profile } = useAppData();
  const [DATES] = useState(recentDates);
  // Primero los sectores del perfil, después los conocidos.
  const [sectors] = useState(() => [...new Set([...profile.sectors, ...SECTORS.filter((s) => s !== 'Otro'), 'Otro'])]);
  const [ruta, setRuta] = useState('');
  const [sector, setSector] = useState(sectors[0]);
  const [otroSector, setOtroSector] = useState('');
  const [tipo, setTipo] = useState<RouteType>('Deportiva');
  const [grado, setGrado] = useState('6b+');
  const [largos, setLargos] = useState(1);
  const [estilo, setEstilo] = useState<ClimbStyle>('Encadene');
  const [fecha, setFecha] = useState(DATES[0].value);
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const boulder = tipo === 'Boulder';

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
        largos: boulder ? 1 : largos,
        notas: notas.trim() || undefined,
      });
      goBack();
    } catch (e) {
      setSaving(false);
      Alert.alert('No se pudo guardar', errorText(e));
    }
  }

  const systemLabel = boulder ? BOULDER_SYSTEMS[systems.boulder].label : ROUTE_SYSTEMS[systems.route].label;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.screen }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[formStyles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Field label="Nombre de la vía">
          <Input value={ruta} onChangeText={setRuta} placeholder="Ej. Fisura del Cóndor" autoFocus returnKeyType="done" />
        </Field>

        <Field label="Sector">
          <Options options={sectors} value={sector} onChange={setSector} />
          {sector === 'Otro' && (
            <Input value={otroSector} onChangeText={setOtroSector} placeholder="Nombre del sector" style={{ marginTop: 8 }} />
          )}
        </Field>

        <Field label="Tipo">
          <Options options={ROUTE_TYPES} value={tipo} onChange={changeTipo} />
        </Field>

        <Field
          label="Grado"
          hint={
            <Link href="/ajustes" asChild>
              <T variant="small" color={c.accent} suppressHighlighting>
                {systemLabel} · cambiar
              </T>
            </Link>
          }>
          <GradePicker
            grades={baseGrades(boulder)}
            value={grado}
            onChange={(g) => g && setGrado(g)}
            display={(g) => displayGrade(g, systems)}
          />
        </Field>

        {!boulder && (
          <Field label="Largos">
            <View style={formStyles.stepper}>
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
          <View style={formStyles.wrap}>
            {DATES.map((d) => (
              <Pill key={d.value} label={d.label} selected={d.value === fecha} onPress={() => setFecha(d.value)} />
            ))}
          </View>
        </Field>

        <Field label="Notas (opcional)">
          <Input value={notas} onChangeText={setNotas} placeholder="Beta, condiciones de la roca, con quién fuiste…" multiline />
        </Field>

        <PrimaryButton label={saving ? 'Guardando…' : 'Guardar ascenso'} onPress={save} busy={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
