export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export interface RequestOptions {
  readonly signal?: AbortSignal;
}

export interface HttpClient {
  readonly getJson: (path: string, options?: RequestOptions) => Promise<unknown>;
  readonly postJson: (path: string, body: unknown, options?: RequestOptions) => Promise<unknown>;
}

/** El servidor respondió, pero con un estado de error (4xx o 5xx). */
export class HttpError extends Error {
  override name = 'HttpError';
  readonly status: number;

  constructor(status: number, url: string) {
    super(`La petición a ${url} ha respondido con el estado ${String(status)}`);
    this.status = status;
  }
}

/** No llegó ninguna respuesta: sin conexión, servidor caído, CORS... */
export class NetworkError extends Error {
  override name = 'NetworkError';
}

const DEFAULT_API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';

// Se envuelve `fetch` porque llamarla suelta, sin `window` como contexto, lanza
// "Illegal invocation" en algunos navegadores.
const defaultFetch: Fetch = (url, init) => fetch(url, init);

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * Sin timeout a propósito: el API puede tardar más de un minuto en arrancar en frío.
 * Quien llama decide cuándo cancelar mediante `signal`.
 */
export function createHttpClient(baseUrl: string, fetchFn: Fetch = defaultFetch): HttpClient {
  async function send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetchFn(url, init);
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }
      throw new NetworkError(`No se ha podido conectar con ${url}`, { cause: error });
    }
  }

  async function request(path: string, init: RequestInit): Promise<unknown> {
    const url = `${baseUrl}${path}`;
    const response = await send(url, init);
    if (!response.ok) {
      throw new HttpError(response.status, url);
    }
    const body: unknown = await response.json();
    return body;
  }

  return {
    getJson: (path, { signal } = {}) =>
      request(path, { method: 'GET', headers: { Accept: 'application/json' }, signal }),
    postJson: (path, body, { signal } = {}) =>
      request(path, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      }),
  };
}

export const httpClient = createHttpClient(
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
);
