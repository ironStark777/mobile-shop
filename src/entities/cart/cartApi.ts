import * as z from 'zod';
import { httpClient, type HttpClient, type RequestOptions } from '../../shared/api/httpClient';
import { InvalidApiResponseError } from '../../shared/api/invalidApiResponseError';

export interface CartItem {
  readonly productId: string;
  readonly colorCode: number;
  readonly storageCode: number;
}

export interface CartApi {
  /** Devuelve el número de productos que hay en la cesta según el API. */
  readonly addToCart: (item: CartItem, options?: RequestOptions) => Promise<number>;
}

const addToCartResponseSchema = z.object({ count: z.number().int().nonnegative() });

/** Añadir a la cesta es una escritura: no pasa por la caché. */
export function createCartApi(http: HttpClient): CartApi {
  return {
    addToCart: async ({ productId, colorCode, storageCode }, options) => {
      const payload = { id: productId, colorCode, storageCode };
      const body = await http.postJson('/cart', payload, options);
      const response = addToCartResponseSchema.safeParse(body);
      if (!response.success) {
        throw new InvalidApiResponseError(
          `La respuesta al añadir a la cesta no es válida:\n${z.prettifyError(response.error)}`,
          { cause: response.error },
        );
      }
      return response.data.count;
    },
  };
}

export const cartApi = createCartApi(httpClient);
