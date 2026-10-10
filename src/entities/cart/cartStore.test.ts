// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { KeyValueStorage } from '../../shared/lib/storage';
import { createCartStore } from './cartStore';

const STORAGE_KEY = 'mobile-shop:v1:cart-count';

function createMapStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe('createCartStore', () => {
  it('empieza en 0 si no hay nada guardado', () => {
    expect(createCartStore(createMapStorage()).getCount()).toBe(0);
  });

  it('recupera el número guardado en una visita anterior', () => {
    const storage = createMapStorage({ [STORAGE_KEY]: '3' });

    expect(createCartStore(storage).getCount()).toBe(3);
  });

  it('ignora un valor guardado que no es un número de productos válido', () => {
    for (const stored of ['abc', '-2', '1.5']) {
      const storage = createMapStorage({ [STORAGE_KEY]: stored });

      expect(createCartStore(storage).getCount()).toBe(0);
    }
  });

  it('guarda el nuevo número y avisa a quien está suscrito', () => {
    const storage = createMapStorage();
    const store = createCartStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);

    store.setCount(2);

    expect(store.getCount()).toBe(2);
    expect(storage.getItem(STORAGE_KEY)).toBe('2');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('deja de avisar al cancelar la suscripción', () => {
    const store = createCartStore(createMapStorage());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.setCount(1);

    expect(listener).not.toHaveBeenCalled();
  });
});
