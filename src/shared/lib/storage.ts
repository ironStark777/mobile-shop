/** Lo único que se necesita de un almacenamiento clave-valor; `localStorage` ya lo cumple. */
export interface KeyValueStorage {
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
}

function resolveStorage(getStorage: () => KeyValueStorage): KeyValueStorage | null {
  try {
    return getStorage();
  } catch {
    return null;
  }
}

function tryGetItem(storage: KeyValueStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function trySetItem(storage: KeyValueStorage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * `localStorage` puede no estar disponible (navegación privada, cookies bloqueadas) o llenarse.
 * En esos casos los datos se guardan en memoria: se pierden al recargar, pero la app sigue
 * funcionando.
 */
export function createSafeStorage(
  getStorage: () => KeyValueStorage = () => window.localStorage,
): KeyValueStorage {
  const storage = resolveStorage(getStorage);
  const memory = new Map<string, string>();

  return {
    getItem: (key) => memory.get(key) ?? (storage ? tryGetItem(storage, key) : null),
    setItem: (key, value) => {
      if (storage && trySetItem(storage, key, value)) {
        memory.delete(key);
      } else {
        memory.set(key, value);
      }
    },
  };
}
