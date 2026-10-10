import { useEffect, useId, useRef } from 'react';
import { NavigationType, useNavigationType } from 'react-router';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  readonly query: string;
  /** Quien la recibe debe guardar el texto en la URL con `replace`: ver el efecto de abajo. */
  readonly onQueryChange: (query: string) => void;
}

/**
 * El campo no es controlado: lo que se escribe pasa a la URL y, desde ahí, al listado. Así
 * escribir nunca espera al router.
 */
export function SearchBox({ query, onQueryChange }: SearchBoxProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigationType = useNavigationType();

  // Lo escrito llega a la URL con `replace` y el campo ya lo muestra, así que esos cambios se
  // ignoran: una actualización atrasada del router podría pisar la última letra o mover el
  // cursor. El campo solo se sincroniza cuando la URL cambia por otra vía, como el logo o los
  // botones de atrás y adelante del navegador. Limitación: otro cambio de `?q=` hecho con
  // `replace` tampoco se reflejaría en el campo; hoy no existe ninguno.
  useEffect(() => {
    const input = inputRef.current;
    if (navigationType !== NavigationType.Replace && input !== null && input.value !== query) {
      input.value = query;
    }
  }, [navigationType, query]);

  return (
    <div className={styles.search}>
      <label htmlFor={id} className={styles.label}>
        Buscar por marca o modelo
      </label>
      <input
        ref={inputRef}
        id={id}
        type="search"
        defaultValue={query}
        autoComplete="off"
        spellCheck={false}
        className={styles.input}
        onChange={(event) => {
          onQueryChange(event.target.value);
        }}
      />
    </div>
  );
}
