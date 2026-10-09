import type { LoaderFunctionArgs } from 'react-router';
import type { ProductDetail } from '../../entities/product/product';
import type { ProductApi } from '../../entities/product/productApi';
import type { CachedResult } from '../../shared/api/responseCache';

export type ProductDetailData = CachedResult<ProductDetail>;

/** La señal de la petición se cancela si el usuario sale de la página antes de que llegue. */
export function createProductDetailLoader(productApi: ProductApi) {
  return ({ params, request }: LoaderFunctionArgs): Promise<ProductDetailData> => {
    const { id } = params;
    // La ruta `product/:id` siempre trae el id; la comprobación es para el tipo.
    if (id === undefined) {
      throw new Error('La ruta del detalle no incluye el id del producto');
    }
    return productApi.getProductById(id, { signal: request.signal });
  };
}
