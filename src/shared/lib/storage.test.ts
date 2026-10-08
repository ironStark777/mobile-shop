// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createSafeStorage, type KeyValueStorage } from './storage';

function createMapStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe('createSafeStorage', () => {
  it('usa el almacenamiento disponible', () => {
    const primary = createMapStorage();
    const storage = createSafeStorage(() => primary);

    storage.setItem('key', 'value');

    expect(primary.getItem('key')).toBe('value');
    expect(storage.getItem('key')).toBe('value');
  });

  it('guarda en memoria si el almacenamiento no está disponible', () => {
    const storage = createSafeStorage(() => {
      throw new Error('SecurityError');
    });

    storage.setItem('key', 'value');

    expect(storage.getItem('key')).toBe('value');
  });

  it('si el almacenamiento está lleno, guarda en memoria y ese valor prevalece', () => {
    const primary = createMapStorage();
    primary.setItem('key', 'old');
    const full: KeyValueStorage = {
      getItem: primary.getItem,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    const storage = createSafeStorage(() => full);

    storage.setItem('key', 'new');

    expect(storage.getItem('key')).toBe('new');
  });

  it('devuelve null si la clave no existe', () => {
    const storage = createSafeStorage(() => createMapStorage());

    expect(storage.getItem('missing')).toBeNull();
  });
});
