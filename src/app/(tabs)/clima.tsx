import { ComingSoon } from '@/components/coming-soon';

export default function ClimaScreen() {
  return (
    <ComingSoon
      eyebrow="Pronóstico de escalada"
      title="Clima"
      icon="partly-sunny"
      intro="El pronóstico de tus sectores favoritos, pensado para decidir si se escala o no."
      bullets={[
        'Pronóstico de 7 días por sector (Petrohué, Cochamó, El Manzano…)',
        'Mapa de viento conectado con Windy',
        'Estado de la roca y mejor ventana para escalar',
      ]}
    />
  );
}
