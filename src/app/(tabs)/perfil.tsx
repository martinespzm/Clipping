import { ComingSoon } from '@/components/coming-soon';

export default function PerfilScreen() {
  return (
    <ComingSoon
      eyebrow="Tu perfil"
      title="Perfil"
      icon="person-circle"
      intro="Tu perfil de escalador, al estilo Instagram."
      bullets={[
        'Fotos de salidas y ascensos',
        'Descripción, años escalando y grado máximo',
        'Certificaciones verificadas y sectores que frecuentas',
      ]}
    />
  );
}
