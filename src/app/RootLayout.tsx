import { Outlet, ScrollRestoration, type Location } from 'react-router';
import { Header } from './Header';
import { NavigationProgress } from './NavigationProgress';
import styles from './RootLayout.module.css';
import { useFocusAfterNavigation } from './useFocusAfterNavigation';

/**
 * El listado guarda una sola posición, sea cual sea la búsqueda: al volver del detalle o al
 * filtrar, sigue donde estaba. Las demás páginas guardan una posición por visita, así que empiezan
 * arriba y la recuperan con atrás y adelante.
 */
function getScrollKey(location: Location): string {
  return location.pathname === '/' ? location.pathname : location.key;
}

export function RootLayout() {
  useFocusAfterNavigation();

  return (
    <>
      <NavigationProgress />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <ScrollRestoration getKey={getScrollKey} />
    </>
  );
}
