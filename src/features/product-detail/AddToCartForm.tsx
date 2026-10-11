import { useState } from 'react';
import { useFetcher } from 'react-router';
import type { ProductDetail, ProductOption } from '../../entities/product/product';
import styles from './AddToCartForm.module.css';
import type { AddToCartResult } from './addToCartAction';
import { OptionGroup } from './OptionGroup';

interface AddToCartFormProps {
  readonly product: ProductDetail;
}

/** Si solo hay una opción, viene elegida; si hay varias, elige el usuario. */
function getDefaultCode(options: readonly ProductOption[]): number | null {
  const [first] = options;
  return options.length === 1 && first !== undefined ? first.code : null;
}

/**
 * La elección del usuario vale mientras la opción exista. Si al reintentar llegan otras opciones y
 * ya no está, se vuelve a la opción por defecto.
 */
function resolveCode(options: readonly ProductOption[], chosenCode: number | null): number | null {
  return chosenCode !== null && options.some((option) => option.code === chosenCode)
    ? chosenCode
    : getDefaultCode(options);
}

/**
 * Envía la elección a la action de la ruta con un fetcher: no navega, y no vuelve a pedir el
 * producto porque añadirlo a la cesta no cambia sus datos.
 */
export function AddToCartForm({ product }: AddToCartFormProps) {
  const fetcher = useFetcher<AddToCartResult>();
  // Solo se guarda lo que elige el usuario; lo que se marca se calcula con las opciones actuales.
  const [chosenStorageCode, setChosenStorageCode] = useState<number | null>(null);
  const [chosenColorCode, setChosenColorCode] = useState<number | null>(null);
  const storageCode = resolveCode(product.storages, chosenStorageCode);
  const colorCode = resolveCode(product.colors, chosenColorCode);
  const isSubmitting = fetcher.state !== 'idle';
  // Mientras se envía no se muestra el resultado anterior: así el mensaje cambia, y se anuncia,
  // en cada envío.
  const result = isSubmitting ? undefined : fetcher.data;

  return (
    <fetcher.Form
      method="post"
      defaultShouldRevalidate={false}
      className={styles.form}
      onSubmit={(event) => {
        // Evita un segundo envío con doble clic. El botón no se desactiva para no perder el foco.
        if (isSubmitting) {
          event.preventDefault();
        }
      }}
    >
      <OptionGroup
        legend="Almacenamiento"
        name="storageCode"
        options={product.storages}
        value={storageCode}
        onChange={setChosenStorageCode}
      />
      <OptionGroup
        legend="Color"
        name="colorCode"
        options={product.colors}
        value={colorCode}
        onChange={setChosenColorCode}
      />
      <div className={styles.actions}>
        <button
          type="submit"
          disabled={storageCode === null || colorCode === null}
          aria-disabled={isSubmitting}
          className={styles.button}
        >
          {isSubmitting ? 'Añadiendo…' : 'Añadir'}
        </button>
        <p role="status" className={result?.ok === false ? styles.error : styles.message}>
          {result?.message}
        </p>
      </div>
    </fetcher.Form>
  );
}
