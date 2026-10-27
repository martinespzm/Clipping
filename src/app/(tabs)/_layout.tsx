import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';

import { Fonts } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: 'Inicio', icon: 'home-outline', iconActive: 'home' },
  { name: 'clima', title: 'Clima', icon: 'partly-sunny-outline', iconActive: 'partly-sunny' },
  { name: 'cordada', title: 'Cordada', icon: 'people-outline', iconActive: 'people' },
  { name: 'tienda', title: 'Tienda', icon: 'bag-handle-outline', iconActive: 'bag-handle' },
  { name: 'aprende', title: 'Aprende', icon: 'school-outline', iconActive: 'school' },
  { name: 'perfil', title: 'Perfil', icon: 'person-circle-outline', iconActive: 'person-circle' },
];

export default function TabLayout() {
  const c = usePalette();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
        tabBarLabelStyle: { fontFamily: Fonts.bodySemi, fontSize: 11, lineHeight: 14 },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons name={focused ? t.iconActive : t.icon} size={size - 2} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
