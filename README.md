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
| **Inicio** | Clima según tu ubicación (Open-Meteo, sin clave), estado de la roca, mejor ventana para escalar y botón para registrar un ascenso (se guarda en el teléfono). |
| Clima, Cordada, Tienda, Aprende, Perfil | Pantallas "próximamente" con lo que tendrá cada una. |

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
  lib/                 Clima (Open-Meteo) y logbook (AsyncStorage)
```

## Comandos útiles

```bash
npx tsc --noEmit        # revisar tipos
npx expo install <pkg>  # agregar librerías compatibles con el SDK
```
