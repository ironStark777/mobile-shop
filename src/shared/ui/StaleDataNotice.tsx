import { useState } from 'react';
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
 * siempre en la página para que los lectores de pantalla oigan cómo acaba cada intento: si vuelve
 * a fallar, el aviso no cambia, y si sale bien, desaparece.
 */
export function StaleDataNotice({ isStale, isRetrying, onRetry }: StaleDataNoticeProps) {
  // Se guarda el valor anterior de `isRetrying` para saber, al renderizar, cuándo acaba un intento.
  const [wasRetrying, setWasRetrying] = useState(isRetrying);
  const [outcome, setOutcome] = useState<RetryOutcome | null>(null);
  if (isRetrying !== wasRetrying) {
    setWasRetrying(isRetrying);
    if (!isRetrying) {
      setOutcome(isStale ? 'failed' : 'updated');
    }
  }

  let announcement = '';
  if (isRetrying) {
    announcement = 'Reintentando…';
  } else if (outcome !== null) {
    announcement = OUTCOME_MESSAGES[outcome];
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
