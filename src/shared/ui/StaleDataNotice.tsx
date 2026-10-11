import { useEffect, useRef, useState } from 'react';
import { focusPageHeading } from '../lib/focusPageHeading';
import styles from './StaleDataNotice.module.css';

interface StaleDataNoticeProps {
  /** `true` si se muestran datos guardados porque no se han podido actualizar. */
  readonly isStale: boolean;
  readonly isRetrying: boolean;
  readonly onRetry: () => void;
}

const OUTCOME_MESSAGES = {
  updated: 'Datos actualizados.',
  failed: 'No se han podido actualizar los datos.',
} as const;

type RetryOutcome = keyof typeof OUTCOME_MESSAGES;

/**
 * Avisa de que los datos no se han podido actualizar y permite reintentarlo. La zona de estado está
 * siempre en la página para anunciar cómo acaba cada intento: si vuelve a fallar, el aviso no
 * cambia, y si sale bien, desaparece.
 */
export function StaleDataNotice({ isStale, isRetrying, onRetry }: StaleDataNoticeProps) {
  // Se guarda el valor anterior de `isRetrying` para saber, al renderizar, cuándo acaba un intento.
  const [wasRetrying, setWasRetrying] = useState(isRetrying);
  // Un objeto nuevo por intento, para que el efecto de abajo se ejecute en cada uno.
  const [lastAttempt, setLastAttempt] = useState<{ readonly outcome: RetryOutcome } | null>(null);
  if (isRetrying !== wasRetrying) {
    setWasRetrying(isRetrying);
    if (!isRetrying) {
      setLastAttempt({ outcome: isStale ? 'failed' : 'updated' });
    }
  }

  // Si sale bien, el aviso desaparece con su botón. Solo si el botón tenía el foco en ese momento
  // se lleva al título; si el usuario estaba en otro sitio, no se toca.
  const retryHadFocus = useRef(false);
  useEffect(() => {
    if (lastAttempt?.outcome === 'updated' && retryHadFocus.current) {
      focusPageHeading();
    }
    retryHadFocus.current = false;
  }, [lastAttempt]);

  let announcement = '';
  if (isRetrying) {
    announcement = 'Reintentando…';
  } else if (lastAttempt !== null) {
    announcement = OUTCOME_MESSAGES[lastAttempt.outcome];
  }

  return (
    <>
      {isStale && (
        <div className={styles.notice}>
          <p>
            No se han podido actualizar los datos. Se muestran los últimos que se guardaron en este
            navegador.
          </p>
          {/* No se desactiva mientras reintenta para que no pierda el foco. */}
          <button
            ref={(button) => {
              // React llama a esta limpieza justo antes de quitar el botón del DOM, cuando aún
              // se puede saber si tenía el foco.
              return () => {
                retryHadFocus.current = document.activeElement === button;
              };
            }}
            type="button"
            aria-disabled={isRetrying}
            className={styles.button}
            onClick={() => {
              if (!isRetrying) {
                onRetry();
              }
            }}
          >
            {isRetrying ? 'Reintentando…' : 'Reintentar'}
          </button>
        </div>
      )}
      <p role="status" className="visually-hidden">
        {announcement}
      </p>
    </>
  );
}
