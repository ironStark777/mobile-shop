import { httpClient, type HttpClient, type RequestOptions } from '../../shared/api/httpClient';
import {
  fetchWithCache,
  responseCache,
  type CachedResult,
  type ParseResponse,
  type ResponseCache,
} from '../../shared/api/responseCache';
import type { ProductDetail, ProductSummary } from './product';
import { parseProductDetail, parseProductList } from './productMapper';

export interface ProductApi {
  readonly getProducts: (options?: RequestOptions) => Promise<CachedResult<ProductSummary[]>>;
  readonly getProductById: (
    id: string,
    options?: RequestOptions,
  ) => Promise<CachedResult<ProductDetail>>;
}

/** La ruta de cada petición es también su clave en la caché. */
export function createProductApi(http: HttpClient, cache: ResponseCache): ProductApi {
  function getCached<T>(
    path: string,
    parse: ParseResponse<T>,
    options?: RequestOptions,
  ): Promise<CachedResult<T>> {
    return fetchWithCache(cache, path, () => http.getJson(path, options), parse);
  }

  return {
    getProducts: (options) => getCached('/product', parseProductList, options),
    getProductById: (id, options) =>
      getCached(`/product/${encodeURIComponent(id)}`, parseProductDetail, options),
  };
}

export const productApi = createProductApi(httpClient, responseCache);
