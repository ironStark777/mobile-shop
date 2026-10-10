import type { ProductOption } from '../../entities/product/product';
import styles from './OptionGroup.module.css';

interface OptionGroupProps {
  readonly legend: string;
  /** Nombre del campo en el formulario; su valor es el código de la opción elegida. */
  readonly name: string;
  readonly options: readonly ProductOption[];
  readonly value: number | null;
  readonly onChange: (code: number) => void;
}

/** Botones de opción: se ven todas a la vez y se recorren con las flechas del teclado. */
export function OptionGroup({ legend, name, options, value, onChange }: OptionGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {options.length === 0 ? (
        <p className={styles.empty}>No disponible</p>
      ) : (
        <div className={styles.options}>
          {options.map((option) => (
            <label key={option.code} className={styles.option}>
              <input
                type="radio"
                name={name}
                value={option.code}
                checked={option.code === value}
                className={styles.input}
                onChange={() => {
                  onChange(option.code);
                }}
              />
              {option.name ?? `Opción ${String(option.code)}`}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
