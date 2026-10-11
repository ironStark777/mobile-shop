import { useEffect, useState } from 'react';

const SLOW_AFTER_MS = 5000;

export const SLOW_LOADING_MESSAGE =
  'El servicio está tardando en responder; puede tardar más de un minuto.';

/**
 * Pasa a `true` cuando el componente lleva 5 s montado, para avisar de que la carga va lenta. Es
 * un temporizador, no una petición de datos: el efecto solo lo programa y lo cancela al desmontar.
 */
export function useIsSlow(): boolean {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSlow(true);
    }, SLOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return isSlow;
}
