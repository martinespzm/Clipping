import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, formStyles, Input, Options, PrimaryButton } from '@/components/form';
import { Card, T } from '@/components/ui';
import { usePalette } from '@/hooks/use-palette';
import { errorText } from '@/lib/errors';
import { goBack } from '@/lib/navigation';
import { useAppData } from '@/providers/app-data';

const MODES = ['Iniciar sesión', 'Crear cuenta'] as const;
type Mode = (typeof MODES)[number];

export default function CuentaScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { cloudEnabled, session, signIn, signUp, signOut, ascents } = useAppData();
  const [mode, setMode] = useState<Mode>('Iniciar sesión');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      Alert.alert('Faltan datos', 'Escribe tu correo y tu contraseña.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'Crear cuenta') {
        const needsConfirmation = await signUp(email, password);
        if (needsConfirmation) {
          Alert.alert('Revisa tu correo', 'Te enviamos un enlace para confirmar tu cuenta. Después vuelve e inicia sesión.');
          setMode('Iniciar sesión');
          return;
        }
      } else {
        await signIn(email, password);
      }
      goBack();
    } catch (e) {
      Alert.alert('No se pudo', errorText(e));
    } finally {
      setBusy(false);
    }
  }

  if (!cloudEnabled) {
    return (
      <View style={[styles.center, { backgroundColor: c.screen }]}>
        <Ionicons name="cloud-offline-outline" size={32} color={c.muted} />
        <T variant="bold">Las cuentas todavía no están activadas</T>
        <T muted style={{ textAlign: 'center' }}>
          Falta conectar la app con Supabase (archivo .env). Mientras tanto, todo se guarda en este teléfono.
        </T>
      </View>
    );
  }

  if (session) {
    return (
      <ScrollView style={{ backgroundColor: c.screen }} contentContainerStyle={formStyles.content}>
        <Card style={{ gap: 6 }}>
          <Ionicons name="cloud-done-outline" size={26} color={c.ok} />
          <T variant="bold">Sesión iniciada</T>
          <T muted>{session.user.email}</T>
          <T variant="small" muted>
            Tu perfil y tus {ascents.length} ascensos están guardados en la nube.
          </T>
        </Card>
        <PrimaryButton
          variant="outline"
          label="Cerrar sesión"
          onPress={async () => {
            await signOut();
            goBack();
          }}
        />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.screen }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[formStyles.content, { paddingBottom: insets.bottom + 24 }]}>
        <T muted>
          Con una cuenta, tu perfil y tu logbook quedan guardados en la nube y no se pierden si cambias de
          teléfono. Lo que ya registraste en este teléfono se sube solo al entrar.
        </T>

        <Options options={MODES} value={mode} onChange={setMode} />

        <Field label="Correo">
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.cl"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </Field>

        <Field label="Contraseña">
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'Crear cuenta' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
            secureTextEntry
            autoCapitalize="none"
            textContentType={mode === 'Crear cuenta' ? 'newPassword' : 'password'}
            onSubmitEditing={submit}
          />
        </Field>

        <PrimaryButton label={busy ? 'Un momento…' : mode} onPress={submit} busy={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
});
