# Clipping

App de escalada todo en uno: clima de tus sectores, logbook, perfil, cordada, tienda de equipo y escuela Premium.

Hecha con [Expo](https://expo.dev) SDK 58, Expo Router y TypeScript. Corre en **Expo Go**.

## Cómo correrla

```bash
npm install
npx expo start
```

Escanea el código QR con la cámara del iPhone (o con Expo Go en Android).

## Qué hay hoy

| Pestaña | Estado |
| --- | --- |
| **Inicio** | Clima según tu ubicación (Open-Meteo, sin clave), estado de la roca, mejor ventana para escalar y botón para registrar un ascenso. |
| **Perfil** | Foto, nombre, usuario, descripción, años escalando, grado máximo, sectores y logbook completo. Botón de ajustes y de cuenta. |
| **Ajustes** | Sistema de graduación: Francesa, Yosemite (YDS) o UIAA para vías; Hueco (V) o Fontainebleau para boulder. |
| Clima, Cordada, Tienda, Aprende | Pantallas "próximamente" con lo que tendrá cada una. |

## Cuentas en la nube (Supabase)

Sin configurar nada, la app guarda todo en el teléfono. Para tener cuentas:

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor → New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y presiona **Run**.
3. En **Authentication → Sign In / Providers → Email**, desactiva **Confirm email** (mientras pruebas).
4. Copia `.env.example` como `.env` y pega la URL del proyecto y la *Publishable key* (o *anon key*).
5. Reinicia `npx expo start`.

Al iniciar sesión, los ascensos y el perfil que tenías en el teléfono se suben solos a tu cuenta.

Los grados se guardan siempre en escala francesa (vías) y V (boulder), y se convierten al mostrarlos (`src/lib/grades.ts`).

## Dónde está cada cosa

```
src/
  app/                 Pantallas (cada archivo es una ruta de Expo Router)
    _layout.tsx        Fuentes, tema y navegación principal
    nuevo-ascenso.tsx  Formulario para registrar un ascenso
    (tabs)/            Las 6 pestañas
  components/          Piezas de interfaz (tarjetas, chips, curvas topográficas)
  constants/theme.ts   Colores y fuentes de Clipping
  hooks/               Ubicación + clima, paleta clara/oscura
  lib/                 Clima, grados, logbook local y conexión con Supabase
  providers/           Estado compartido: sesión, perfil, ascensos y ajustes
supabase/schema.sql    Tablas y permisos de la base de datos
```

## Comandos útiles

```bash
npx tsc --noEmit        # revisar tipos
npx expo install <pkg>  # agregar librerías compatibles con el SDK
```
