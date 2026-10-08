// @vitest-environment node
import { describe, expect, it, vi, type Mock } from 'vitest';
import { createHttpClient, HttpError, NetworkError, type Fetch } from './httpClient';

const BASE_URL = 'https://api.test';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function setup() {
  const fetchMock = vi.fn<Fetch>();
  const client = createHttpClient(BASE_URL, fetchMock);
  return { fetchMock, client };
}

function lastFetchCall(fetchMock: Mock<Fetch>): Parameters<Fetch> {
  const call = fetchMock.mock.lastCall;
  if (!call) {
    throw new Error('fetch no se ha llamado');
  }
  return call;
}

describe('createHttpClient', () => {
  it('hace un GET a la URL base más la ruta y devuelve el JSON', async () => {
    const { fetchMock, client } = setup();
    fetchMock.mockResolvedValue(jsonResponse([{ id: '1' }]));

    const body = await client.getJson('/product');

    const [url, init] = lastFetchCall(fetchMock);
    expect(body).toEqual([{ id: '1' }]);
    expect(url).toBe('https://api.test/product');
    expect(init.method).toBe('GET');
  });

  it('envía el cuerpo del POST como JSON', async () => {
    const { fetchMock, client } = setup();
    fetchMock.mockResolvedValue(jsonResponse({ count: 1 }));
    const product = { id: '1', colorCode: 1000, storageCode: 2000 };

    const body = await client.postJson('/cart', product);

    const [url, init] = lastFetchCall(fetchMock);
    expect(body).toEqual({ count: 1 });
    expect(url).toBe('https://api.test/cart');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    expect(init.body).toBe(JSON.stringify(product));
  });

  it('pasa a fetch la señal de cancelación', async () => {
    const { fetchMock, client } = setup();
    fetchMock.mockResolvedValue(jsonResponse({}));
    const controller = new AbortController();

    await client.getJson('/product', { signal: controller.signal });

    const [, init] = lastFetchCall(fetchMock);
    expect(init.signal).toBe(controller.signal);
  });

  it('lanza HttpError con el estado cuando el servidor responde con error', async () => {
    const { fetchMock, client } = setup();
    fetchMock.mockResolvedValue(
      jsonResponse({ message: 'An Unexpected Error Occurred', code: 0 }, 500),
    );

    const error = await client.getJson('/product/no-existe').catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toHaveProperty('status', 500);
  });

  it('lanza NetworkError cuando no llega ninguna respuesta', async () => {
    const { fetchMock, client } = setup();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(client.getJson('/product')).rejects.toBeInstanceOf(NetworkError);
  });

  it('deja pasar la cancelación sin convertirla en error de red', async () => {
    const { fetchMock, client } = setup();
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    fetchMock.mockRejectedValue(abortError);

    await expect(client.getJson('/product')).rejects.toBe(abortError);
  });
});
