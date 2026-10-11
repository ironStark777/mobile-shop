import type { ActionFunctionArgs } from 'react-router';
import * as z from 'zod';
import type { CartApi } from '../../entities/cart/cartApi';
import type { CartStore } from '../../entities/cart/cartStore';
import { getProductId } from './productDetailLoader';

export interface AddToCartResult {
  readonly ok: boolean;
  readonly message: string;
}

// Los códigos llegan del formulario como texto. Se exigen dígitos antes de convertirlos, porque
// `Number('')` y `Number(' ')` dan 0.
const optionCode = z
  .string()
  .regex(/^\d+$/)
  .transform((code) => Number(code));

const selectionSchema = z.object({ storageCode: optionCode, colorCode: optionCode });

/**
 * Añade a la cesta el producto de la URL con el almacenamiento y el color elegidos, y guarda el
 * número de productos que devuelve el API. Si algo falla, devuelve un mensaje en lugar de lanzar
 * el error: así la página sigue a la vista y se puede volver a intentar.
 */
export function createAddToCartAction(cartApi: CartApi, cartStore: CartStore) {
  return async ({
    params,
    request,
  }: Pick<ActionFunctionArgs, 'params' | 'request'>): Promise<AddToCartResult> => {
    const productId = getProductId(params);
    const selection = selectionSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!selection.success) {
      return { ok: false, message: 'Elige el almacenamiento y el color.' };
    }
    try {
      const count = await cartApi.addToCart(
        { productId, ...selection.data },
        { signal: request.signal },
      );
      cartStore.setCount(count);
      return { ok: true, message: 'Añadido a la cesta.' };
    } catch (error) {
      // Una petición cancelada no es un fallo de la compra; el router descarta su resultado.
      if (request.signal.aborted) {
        throw error;
      }
      return { ok: false, message: 'No se ha podido añadir a la cesta. Inténtalo de nuevo.' };
    }
  };
}
