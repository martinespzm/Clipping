import { ComingSoon } from '@/components/coming-soon';

export default function TiendaScreen() {
  return (
    <ComingSoon
      eyebrow="Marketplace"
      title="Tienda"
      icon="bag-handle"
      intro="Compra y vende equipo de escalada y camping, nuevo y usado."
      bullets={[
        'Cuerdas, arneses, cintas, mosquetones y zapatillas',
        'Carpas, sacos y artículos de camping',
        'Publica tu equipo usado en un par de toques',
      ]}
    />
  );
}
