import { ComingSoon } from '@/components/coming-soon';

export default function AprendeScreen() {
  return (
    <ComingSoon
      premium
      eyebrow="Escuela"
      title="Aprende"
      icon="school"
      intro="Lecciones paso a paso, revisadas por guías certificados."
      bullets={[
        'Técnicas de descenso y rapel',
        'Autorrescate y primeros auxilios',
        'Multilargos, nudos y uso de mosquetones',
      ]}
    />
  );
}
