import type { LoaderFunctionArgs, ShouldRevalidateFunctionArgs } from 'react-router';
import type { ProductSummary } from '../../entities/product/product';
import type { ProductApi } from '../../entities/product/productApi';
import type { CachedResult } from '../../shared/api/responseCache';

export type ProductListData = CachedResult<ProductSummary[]>;

/** La señal de la petición se cancela si el usuario sale de la página antes de que llegue. */
export function createProductListLoader(productApi: ProductApi) {
  return ({ request }: LoaderFunctionArgs): Promise<ProductListData> =>
    productApi.getProducts({ signal: request.signal });
}

/**
 * Buscar solo cambia `?q=` y se filtra en el cliente, así que escribir no vuelve a pedir el
 * listado. En cualquier otro caso, como una revalidación explícita, decide el router.
 */
export function shouldRevalidateProductList({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs): boolean {
  const onlySearchChanged =
    currentUrl.pathname === nextUrl.pathname && currentUrl.search !== nextUrl.search;
  return onlySearchChanged ? false : defaultShouldRevalidate;
}
