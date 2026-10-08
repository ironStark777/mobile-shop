// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { KeyValueStorage } from '../lib/storage';
import { CACHE_TTL_MS, createResponseCache, fetchWithCache } from './responseCache';

function createMapStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

function setup() {
  const storage = createMapStorage();
  const clock = { now: 0 };
  const cache = createResponseCache({ storage, now: () => clock.now });
  return { storage, clock, cache };
}

describe('createResponseCache', () => {
  it('devuelve null si no hay nada guardado', () => {
    const { cache } = setup();

    expect(cache.read('/product')).toBeNull();
  });

  it('devuelve el dato como vigente durante la primera hora', () => {
    const { clock, cache } = setup();
    cache.write('/product', [{ id: '1' }]);

    clock.now = CACHE_TTL_MS - 1;

    expect(cache.read('/product')).toEqual({ body: [{ id: '1' }], isFresh: true });
  });

  it('lo marca como caducado al cumplirse la hora, pero lo conserva', () => {
    const { clock, cache } = setup();
    cache.write('/product', [{ id: '1' }]);

    clock.now = CACHE_TTL_MS;

    expect(cache.read('/product')).toEqual({ body: [{ id: '1' }], isFresh: false });
  });

  it('guarda cada respuesta con su hora bajo una clave con prefijo y versión', () => {
    const { storage, clock, cache } = setup();
    clock.now = 1000;

    cache.write('/product', [{ id: '1' }]);

    expect(storage.getItem('mobile-shop:v1:/product')).toBe(
      JSON.stringify({ savedAt: 1000, body: [{ id: '1' }] }),
    );
  });

  it('ignora las entradas corruptas', () => {
    const { storage, cache } = setup();
    storage.setItem('mobile-shop:v1:/product', '{no es json');

    expect(cache.read('/product')).toBeNull();
  });
});

describe('fetchWithCache', () => {
  it('sin datos guardados, pide al API y guarda la respuesta', async () => {
    const { cache } = setup();
    const fetchFresh = vi.fn(() => Promise.resolve(['nuevo']));

    const result = await fetchWithCache(cache, '/product', fetchFresh);

    expect(result).toEqual({ body: ['nuevo'], isStale: false });
    expect(cache.read('/product')?.body).toEqual(['nuevo']);
  });

  it('con datos vigentes, no llama al API', async () => {
    const { cache } = setup();
    cache.write('/product', ['guardado']);
    const fetchFresh = vi.fn(() => Promise.resolve(['nuevo']));

    const result = await fetchWithCache(cache, '/product', fetchFresh);

    expect(result).toEqual({ body: ['guardado'], isStale: false });
    expect(fetchFresh).not.toHaveBeenCalled();
  });

  it('con datos caducados, los vuelve a pedir y los sustituye', async () => {
    const { clock, cache } = setup();
    cache.write('/product', ['guardado']);
    clock.now = CACHE_TTL_MS;
    const fetchFresh = vi.fn(() => Promise.resolve(['nuevo']));

    const result = await fetchWithCache(cache, '/product', fetchFresh);

    expect(result).toEqual({ body: ['nuevo'], isStale: false });
    expect(cache.read('/product')).toEqual({ body: ['nuevo'], isFresh: true });
  });

  it('si el API falla, devuelve los datos caducados marcados como no actualizados', async () => {
    const { clock, cache } = setup();
    cache.write('/product', ['guardado']);
    clock.now = CACHE_TTL_MS;

    const result = await fetchWithCache(cache, '/product', () =>
      Promise.reject(new Error('API caída')),
    );

    expect(result).toEqual({ body: ['guardado'], isStale: true });
  });

  it('si el API falla y no hay nada guardado, propaga el error', async () => {
    const { cache } = setup();
    const error = new Error('API caída');

    await expect(fetchWithCache(cache, '/product', () => Promise.reject(error))).rejects.toBe(
      error,
    );
  });
});
