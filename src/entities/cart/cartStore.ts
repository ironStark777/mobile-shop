import { createSafeStorage, type KeyValueStorage } from '../../shared/lib/storage';

export interface CartStore {
  readonly getCount: () => number;
  readonly setCount: (count: number) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

const STORAGE_KEY = 'mobile-shop:v1:cart-count';

function readCount(storage: KeyValueStorage): number {
  const stored = Number(storage.getItem(STORAGE_KEY));
  return Number.isInteger(stored) && stored >= 0 ? stored : 0;
}

/**
 * Guarda el número de productos de la cesta que devuelve el API, lo persiste para que sobreviva
 * a una recarga y avisa a los componentes que lo muestran.
 */
export function createCartStore(storage: KeyValueStorage): CartStore {
  const listeners = new Set<() => void>();
  let count = readCount(storage);

  return {
    getCount: () => count,
    setCount: (nextCount) => {
      count = nextCount;
      storage.setItem(STORAGE_KEY, String(nextCount));
      listeners.forEach((listener) => {
        listener();
      });
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const cartStore = createCartStore(createSafeStorage());
