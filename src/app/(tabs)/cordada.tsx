import { ComingSoon } from '@/components/coming-soon';

export default function CordadaScreen() {
  return (
    <ComingSoon
      eyebrow="Amigos y seguidores"
      title="Cordada"
      icon="people"
      intro="Encuentra con quién escalar y sigue lo que hace tu gente."
      bullets={[
        'Buscar cordada por sector, fecha y grado',
        'Seguir escaladores y ver sus ascensos',
        'Publicar salidas y sumarte a las de otros',
      ]}
    />
  );
}
