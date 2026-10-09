import type { LoaderFunctionArgs } from 'react-router';
import type { ProductSummary } from '../../entities/product/product';
import type { ProductApi } from '../../entities/product/productApi';
import type { CachedResult } from '../../shared/api/responseCache';

export type ProductListData = CachedResult<ProductSummary[]>;

/** La señal de la petición se cancela si el usuario sale de la página antes de que llegue. */
export function createProductListLoader(productApi: ProductApi) {
  return ({ request }: LoaderFunctionArgs): Promise<ProductListData> =>
    productApi.getProducts({ signal: request.signal });
}
