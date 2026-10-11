import { SLOW_LOADING_MESSAGE, useIsSlow } from './useIsSlow';

/** Se muestra mientras se cargan los datos de la primera página que se abre. */
export function InitialLoading() {
  const isSlow = useIsSlow();

  return <p role="status">{isSlow ? `Cargando… ${SLOW_LOADING_MESSAGE}` : 'Cargando…'}</p>;
}
