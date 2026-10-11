import { useNavigation } from 'react-router';
import styles from './NavigationProgress.module.css';
import { SLOW_LOADING_MESSAGE, useIsSlow } from './useIsSlow';

/**
 * Mientras llegan los datos de la página de destino, la actual sigue a la vista. Los lectores de
 * pantalla oyen "Cargando…" al momento; la barra solo se ve si la carga pasa de 0,3 s, para que no
 * parpadee cuando los datos salen de la caché.
 */
export function NavigationProgress() {
  const navigation = useNavigation();

  return (
    <>
      {navigation.state !== 'idle' && <div className={styles.bar} />}
      <div role="status">
        {navigation.state !== 'idle' && <PendingMessage key={navigation.location.key} />}
      </div>
    </>
  );
}

/** La `key` de cada navegación vuelve a montarlo, y así el aviso de carga lenta empieza de cero. */
function PendingMessage() {
  const isSlow = useIsSlow();

  return (
    <>
      <span className="visually-hidden">Cargando…</span>
      {isSlow && <span className={styles.notice}>{SLOW_LOADING_MESSAGE}</span>}
    </>
  );
}
