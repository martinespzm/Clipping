import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, formStyles, GradePicker, Input, Pill, PrimaryButton } from '@/components/form';
import { T } from '@/components/ui';
import { usePalette } from '@/hooks/use-palette';
import { SECTORS } from '@/lib/ascents';
import { errorText } from '@/lib/errors';
import { goBack } from '@/lib/navigation';
import { BOULDER_SYSTEMS, displayGrade, FRENCH, ROUTE_SYSTEMS, VSCALE } from '@/lib/grades';
import { initials } from '@/lib/profile';
import { useAppData, type PickedImage } from '@/providers/app-data';

const THIS_YEAR = new Date().getFullYear();

export default function EditarPerfilScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { profile, saveProfile, systems } = useAppData();
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [since, setSince] = useState(profile.climbingSince ? String(profile.climbingSince) : '');
  const [maxRoute, setMaxRoute] = useState(profile.maxRoute);
  const [maxBoulder, setMaxBoulder] = useState(profile.maxBoulder);
  const [sectors, setSectors] = useState(profile.sectors);
  const [newSector, setNewSector] = useState('');
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
  const [saving, setSaving] = useState(false);

  // Sectores conocidos + los que la persona agregó a mano.
  const sectorOptions = [...new Set([...SECTORS.filter((s) => s !== 'Otro'), ...sectors])];
  const avatarUri = avatar ? `data:${avatar.mimeType};base64,${avatar.base64}` : profile.avatarUrl;

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    const asset = res.canceled ? null : res.assets[0];
    if (asset?.base64) setAvatar({ base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' });
  }

  function toggleSector(s: string) {
    setSectors((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function addSector() {
    const s = newSector.trim();
    if (s && !sectors.includes(s)) setSectors((prev) => [...prev, s]);
    setNewSector('');
  }

  async function save() {
    const year = Number(since);
    if (since && (!Number.isInteger(year) || year < 1950 || year > THIS_YEAR)) {
      Alert.alert('Año no válido', `Escribe un año entre 1950 y ${THIS_YEAR}.`);
      return;
    }
    setSaving(true);
    try {
      await saveProfile(
        {
          ...profile,
          name: name.trim(),
          handle: handle.trim().replace(/^@/, '').toLowerCase(),
          bio: bio.trim(),
          location: location.trim(),
          climbingSince: since ? year : null,
          maxRoute,
          maxBoulder,
          sectors,
        },
        avatar,
      );
      goBack();
    } catch (e) {
      setSaving(false);
      Alert.alert('No se pudo guardar', errorText(e));
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.screen }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[formStyles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable onPress={pickPhoto} style={styles.avatarRow} accessibilityLabel="Cambiar foto de perfil">
          <View style={[styles.avatar, { backgroundColor: c.accent }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <T variant="title" color={c.onAccent}>{initials({ ...profile, name })}</T>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="camera-outline" size={18} color={c.accent} />
            <T variant="bold" color={c.accent}>Cambiar foto</T>
          </View>
        </Pressable>

        <Field label="Nombre">
          <Input value={name} onChangeText={setName} placeholder="Tu nombre" autoComplete="name" />
        </Field>

        <Field label="Usuario">
          <Input value={handle} onChangeText={setHandle} placeholder="ej. martin.clips" autoCapitalize="none" autoCorrect={false} />
        </Field>

        <Field label="Descripción">
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Qué escalas, dónde, qué estás proyectando…"
            maxLength={160}
            multiline
          />
        </Field>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="Escalo desde">
              <Input value={since} onChangeText={setSince} placeholder={String(THIS_YEAR - 3)} keyboardType="number-pad" maxLength={4} />
            </Field>
          </View>
          <View style={{ flex: 2 }}>
            <Field label="Ubicación">
              <Input value={location} onChangeText={setLocation} placeholder="Puerto Varas, Los Lagos" />
            </Field>
          </View>
        </View>

        <Field label={`Grado máximo en vía · ${ROUTE_SYSTEMS[systems.route].label}`}>
          <GradePicker grades={FRENCH} value={maxRoute} onChange={setMaxRoute} display={(g) => displayGrade(g, systems)} allowNone />
        </Field>

        <Field label={`Grado máximo en boulder · ${BOULDER_SYSTEMS[systems.boulder].label}`}>
          <GradePicker grades={VSCALE} value={maxBoulder} onChange={setMaxBoulder} display={(g) => displayGrade(g, systems)} allowNone />
        </Field>

        <Field label="Sectores que frecuentas">
          <View style={formStyles.wrap}>
            {sectorOptions.map((s) => (
              <Pill key={s} label={s} selected={sectors.includes(s)} onPress={() => toggleSector(s)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Input
              value={newSector}
              onChangeText={setNewSector}
              placeholder="Agregar otro sector"
              onSubmitEditing={addSector}
              returnKeyType="done"
              style={{ flex: 1 }}
            />
            <Pressable onPress={addSector} style={[styles.addBtn, { borderColor: c.line, backgroundColor: c.surface }]}>
              <Ionicons name="add" size={22} color={c.fg} />
            </Pressable>
          </View>
        </Field>

        <PrimaryButton label={saving ? 'Guardando…' : 'Guardar perfil'} onPress={save} busy={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avatarRow: { alignItems: 'center', gap: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  addBtn: { width: 46, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
