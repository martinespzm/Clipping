/**
 * Colores y tipografías de Clipping.
 * Vienen del prototipo: verde pino, niebla de glaciar, naranja "alpenglow"
 * como acento y dorado (marca de sendero) para Premium y grados.
 */

export const Colors = {
  light: {
    page: '#D7DFD6',
    screen: '#EDF1EA',
    surface: '#FAFBF7',
    surface2: '#E0E7DD',
    line: '#C6D0C3',
    fg: '#1B2923',
    muted: '#55675D',
    accent: '#D9541E',
    accentSoft: '#F6DCCC',
    onAccent: '#FFFFFF',
    sky: '#2C6B87',
    skySoft: '#D2E4EB',
    ok: '#3A7535',
    okSoft: '#DAEAD2',
    warn: '#A06E0C',
    warnSoft: '#F2E3C0',
    bad: '#B0382A',
    badSoft: '#F3D7D2',
    gold: '#86650F',
    goldSoft: '#F0E2B6',
    pine: '#1F3A2E',
    pine2: '#2A4C3D',
    pineInk: '#EAF0E8',
    pineMuted: '#AFC2B6',
    topo: '#2A4C3D',
    topoOpacity: 0.16,
  },
  dark: {
    page: '#09110E',
    screen: '#0E1814',
    surface: '#15231E',
    surface2: '#1D2E27',
    line: '#2B3E36',
    fg: '#E5ECE3',
    muted: '#91A499',
    accent: '#F2713A',
    accentSoft: '#3B2116',
    onAccent: '#1A0C05',
    sky: '#6DB2CE',
    skySoft: '#132F39',
    ok: '#7CC36E',
    okSoft: '#173019',
    warn: '#E5B04A',
    warnSoft: '#33280F',
    bad: '#F07360',
    badSoft: '#3A1B16',
    gold: '#E3B94C',
    goldSoft: '#32290F',
    pine: '#1F3A2E',
    pine2: '#2A4C3D',
    pineInk: '#EAF0E8',
    pineMuted: '#AFC2B6',
    topo: '#EAF0E8',
    topoOpacity: 0.06,
  },
};

export type Palette = typeof Colors.light;

/** Nombres de las fuentes tal como se cargan en src/app/_layout.tsx */
export const Fonts = {
  display: 'BigShouldersDisplay_800ExtraBold',
  displayBlack: 'BigShouldersDisplay_900Black',
  body: 'Barlow_400Regular',
  bodyMedium: 'Barlow_500Medium',
  bodySemi: 'Barlow_600SemiBold',
  bodyBold: 'Barlow_700Bold',
  mono: 'IBMPlexMono_500Medium',
  monoBold: 'IBMPlexMono_600SemiBold',
};

export const Radius = { sm: 8, md: 12, lg: 14, xl: 22 };
