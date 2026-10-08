import { createSafeStorage, type KeyValueStorage } from '../lib/storage';

export interface CacheEntry {
  readonly body: unknown;
  readonly isFresh: boolean;
}

export interface ResponseCache {
  readonly read: (key: string) => CacheEntry | null;
  readonly write: (key: string, body: unknown) => void;
}

export interface CachedResult<T> {
  readonly data: T;
  /** `true` si el API ha fallado y se devuelve el último dato guardado, aunque haya caducado. */
  readonly isStale: boolean;
}

/** Valida la respuesta y la convierte en datos de la app. Lanza un error si no es válida. */
export type ParseResponse<T> = (body: unknown) => T;

export interface ResponseCacheOptions {
  readonly storage: KeyValueStorage;
  readonly now?: () => number;
  readonly ttlMs?: number;
}

export const CACHE_TTL_MS = 60 * 60 * 1000;

// Si cambia el formato de lo guardado, subir la versión deja sin efecto las entradas antiguas.
const KEY_PREFIX = 'mobile-shop:v1:';

interface StoredEntry {
  readonly savedAt: number;
  readonly body: unknown;
}

function isStoredEntry(value: unknown): value is StoredEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'savedAt' in value &&
    typeof value.savedAt === 'number' &&
    'body' in value
  );
}

function parseStoredEntry(raw: string): StoredEntry | null {
  try {
    const value: unknown = JSON.parse(raw);
    return isStoredEntry(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Las entradas caducadas no se borran: si el API falla al revalidar, son el respaldo.
 * Se sustituyen cuando llega una respuesta nueva.
 */
export function createResponseCache({
  storage,
  now = () => Date.now(),
  ttlMs = CACHE_TTL_MS,
}: ResponseCacheOptions): ResponseCache {
  return {
    read: (key) => {
      const raw = storage.getItem(KEY_PREFIX + key);
      const entry = raw === null ? null : parseStoredEntry(raw);
      if (!entry) {
        return null;
      }
      // Una edad negativa significa que el reloj del equipo ha retrocedido: se trata como caducada.
      const age = now() - entry.savedAt;
      return { body: entry.body, isFresh: age >= 0 && age < ttlMs };
    },
    write: (key, body) => {
      const entry: StoredEntry = { savedAt: now(), body };
      storage.setItem(KEY_PREFIX + key, JSON.stringify(entry));
    },
  };
}

interface ParsedEntry<T> {
  readonly data: T;
  readonly isFresh: boolean;
}

/** Una entrada guardada que ya no pasa la validación cuenta como si no existiera. */
function readParsed<T>(
  cache: ResponseCache,
  key: string,
  parse: ParseResponse<T>,
): ParsedEntry<T> | null {
  const entry = cache.read(key);
  if (!entry) {
    return null;
  }
  try {
    return { data: parse(entry.body), isFresh: entry.isFresh };
  } catch {
    return null;
  }
}

/**
 * Devuelve la respuesta guardada mientras esté vigente. Pasada la hora la pide de nuevo y,
 * si el API falla, devuelve la última guardada marcada como no actualizada (`isStale`).
 * Una respuesta que no pasa la validación cuenta como un fallo del API: no se guarda, así que
 * no sustituye al último dato bueno.
 */
export async function fetchWithCache<T>(
  cache: ResponseCache,
  key: string,
  fetchFresh: () => Promise<unknown>,
  parse: ParseResponse<T>,
): Promise<CachedResult<T>> {
  const cached = readParsed(cache, key, parse);
  if (cached?.isFresh) {
    return { data: cached.data, isStale: false };
  }
  try {
    const body = await fetchFresh();
    const data = parse(body);
    cache.write(key, body);
    return { data, isStale: false };
  } catch (error) {
    if (cached) {
      return { data: cached.data, isStale: true };
    }
    throw error;
  }
}

export const responseCache = createResponseCache({ storage: createSafeStorage() });
