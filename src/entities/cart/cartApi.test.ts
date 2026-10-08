// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../shared/api/httpClient';
import { InvalidApiResponseError } from '../../shared/api/invalidApiResponseError';
import { createCartApi } from './cartApi';

const { signal } = new AbortController();
const item = { productId: 'ZmGrkLRPXOTpxsU4jjAcv', colorCode: 1000, storageCode: 2000 };

function setup(response: unknown) {
  const postJson = vi.fn<HttpClient['postJson']>().mockResolvedValue(response);
  const http: HttpClient = { getJson: vi.fn<HttpClient['getJson']>(), postJson };
  return { postJson, api: createCartApi(http) };
}

describe('createCartApi', () => {
  it('envía el id del producto y los códigos de color y almacenamiento elegidos', async () => {
    const { postJson, api } = setup({ count: 1 });

    await api.addToCart(item, { signal });

    expect(postJson).toHaveBeenCalledWith(
      '/cart',
      { id: 'ZmGrkLRPXOTpxsU4jjAcv', colorCode: 1000, storageCode: 2000 },
      { signal },
    );
  });

  it('devuelve el número de productos que hay en la cesta', async () => {
    const { api } = setup({ count: 3 });

    await expect(api.addToCart(item)).resolves.toBe(3);
  });

  it('falla si la respuesta no trae el número de productos', async () => {
    const { api } = setup({});

    await expect(api.addToCart(item)).rejects.toBeInstanceOf(InvalidApiResponseError);
  });
});
