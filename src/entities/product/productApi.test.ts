// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../shared/api/httpClient';
import { createResponseCache } from '../../shared/api/responseCache';
import type { KeyValueStorage } from '../../shared/lib/storage';
import acerIconiaTalkS from './__fixtures__/product-acer-iconia-talk-s.json';
import productList from './__fixtures__/product-list.json';
import { createProductApi } from './productApi';

const { signal } = new AbortController();

function createMapStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

function setup(response: unknown) {
  const getJson = vi.fn<HttpClient['getJson']>().mockResolvedValue(response);
  const http: HttpClient = { getJson, postJson: vi.fn<HttpClient['postJson']>() };
  const cache = createResponseCache({ storage: createMapStorage() });
  return { getJson, api: createProductApi(http, cache) };
}

describe('createProductApi', () => {
  it('getProducts pide el listado y lo devuelve convertido al modelo de dominio', async () => {
    const { getJson, api } = setup(productList);

    const result = await api.getProducts({ signal });

    expect(getJson).toHaveBeenCalledWith('/product', { signal });
    expect(result.isStale).toBe(false);
    expect(result.data).toHaveLength(4);
    expect(result.data[0]?.price).toBe(170);
  });

  it('getProductById pide el detalle del producto por su id', async () => {
    const { getJson, api } = setup(acerIconiaTalkS);

    const result = await api.getProductById('ZmGrkLRPXOTpxsU4jjAcv', { signal });

    expect(getJson).toHaveBeenCalledWith('/product/ZmGrkLRPXOTpxsU4jjAcv', { signal });
    expect(result.data.model).toBe('Iconia Talk S');
  });

  it('codifica el id para que no pueda alterar la ruta', async () => {
    const { getJson, api } = setup(acerIconiaTalkS);

    await api.getProductById('a/b?c', { signal });

    expect(getJson).toHaveBeenCalledWith('/product/a%2Fb%3Fc', { signal });
  });

  it('guarda las respuestas en la caché: la segunda vez no llama al API', async () => {
    const { getJson, api } = setup(productList);

    await api.getProducts({ signal });
    const result = await api.getProducts({ signal });

    expect(getJson).toHaveBeenCalledOnce();
    expect(result.data).toHaveLength(4);
  });
});
