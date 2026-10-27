import { Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold, Barlow_700Bold } from '@expo-google-fonts/barlow';
import { BigShouldersDisplay_800ExtraBold, BigShouldersDisplay_900Black } from '@expo-google-fonts/big-shoulders-display';
import { IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { AppDataProvider } from '@/providers/app-data';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [loaded, error] = useFonts({
    BigShouldersDisplay_800ExtraBold,
    BigShouldersDisplay_900Black,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: c.accent, background: c.screen, card: c.surface, text: c.fg, border: c.line },
  };

  const modal = (title: string) => ({
    presentation: 'modal' as const,
    headerShown: true,
    title,
    headerTitleStyle: { fontFamily: Fonts.display, fontSize: 20 },
    headerStyle: { backgroundColor: c.surface },
    headerTintColor: c.fg,
  });

  return (
    <AppDataProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="nuevo-ascenso" options={modal('Nuevo ascenso')} />
          <Stack.Screen name="editar-perfil" options={modal('Editar perfil')} />
          <Stack.Screen name="cuenta" options={modal('Tu cuenta')} />
          <Stack.Screen name="ajustes" options={modal('Ajustes')} />
        </Stack>
      </ThemeProvider>
    </AppDataProvider>
  );
}
