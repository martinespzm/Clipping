import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

/** Curvas de nivel topográficas (mismo dibujo que el prototipo). */
const LOOP =
  'M0 -120 C80 -118 130 -60 122 10 C114 80 60 128 -10 120 C-90 112 -128 50 -120 -20 C-112 -90 -60 -122 0 -120Z';
const RINGS: [number, number, number, number][] = [
  [120, 140, 1.0, 40], [125, 137, 0.82, 32], [129, 134, 0.64, 25],
  [134, 130, 0.47, 18], [138, 127, 0.3, 12], [142, 125, 0.15, 6],
  [330, 300, 0.8, 40], [335, 297, 0.66, 32], [339, 294, 0.51, 25],
  [344, 290, 0.38, 18], [348, 287, 0.24, 12], [352, 285, 0.12, 6],
];

export function Topo({
  color,
  opacity,
  size = 440,
  style,
}: {
  color: string;
  opacity: number;
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 440 440">
        <G fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={1.1}>
          {RINGS.map(([x, y, s, r], i) => (
            <Path key={i} d={LOOP} transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`} />
          ))}
        </G>
      </Svg>
    </View>
  );
}

/** Silueta de cordillera con nieve en las cumbres. */
export function Ridge({ height = 64 }: { height?: number }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height }}>
      <Svg width="100%" height="100%" viewBox="0 0 400 80" preserveAspectRatio="none">
        <Path
          d="M0 80 L0 52 L40 30 L70 44 L110 12 L150 40 L190 26 L230 50 L270 18 L300 34 L340 8 L372 38 L400 28 L400 80Z"
          fill="#284A3B"
        />
        <Path
          d="M0 80 L0 64 L50 50 L90 60 L140 40 L200 58 L250 44 L310 62 L360 48 L400 58 L400 80Z"
          fill="#1B3329"
        />
        <Path
          d="M110 12 L122 22 L114 21 L104 26Z M340 8 L352 18 L343 17 L334 22Z"
          fill="#E9EFE7"
          fillOpacity={0.85}
        />
      </Svg>
    </View>
  );
}
