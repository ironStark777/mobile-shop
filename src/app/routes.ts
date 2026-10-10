import type { RouteObject } from 'react-router';
import type { CartApi } from '../entities/cart/cartApi';
import type { CartStore } from '../entities/cart/cartStore';
import type { ProductApi } from '../entities/product/productApi';
import { createAddToCartAction } from '../features/product-detail/addToCartAction';
import { ProductDetailPage } from '../features/product-detail/ProductDetailPage';
import { createProductDetailLoader } from '../features/product-detail/productDetailLoader';
import { ProductListPage } from '../features/product-list/ProductListPage';
import {
  createProductListLoader,
  shouldRevalidateProductList,
} from '../features/product-list/productListLoader';
import { InitialLoading } from './InitialLoading';
import { NotFoundPage } from './NotFoundPage';
import { RootLayout } from './RootLayout';
import { RouteError } from './RouteError';
import { routeIds } from './routeIds';

export interface AppServices {
  readonly productApi: ProductApi;
  readonly cartApi: CartApi;
  readonly cartStore: CartStore;
}

/**
 * Las páginas cuelgan de una ruta sin `path` con su propio `ErrorBoundary` y `HydrateFallback`:
 * así los errores y la carga inicial se muestran dentro del layout, sin perder la cabecera.
 */
export function createRoutes({ productApi, cartApi, cartStore }: AppServices): RouteObject[] {
  return [
    {
      path: '/',
      Component: RootLayout,
      ErrorBoundary: RouteError,
      children: [
        {
          ErrorBoundary: RouteError,
          HydrateFallback: InitialLoading,
          children: [
            {
              index: true,
              loader: createProductListLoader(productApi),
              shouldRevalidate: shouldRevalidateProductList,
              Component: ProductListPage,
            },
            {
              id: routeIds.productDetail,
              path: 'product/:id',
              loader: createProductDetailLoader(productApi),
              action: createAddToCartAction(cartApi, cartStore),
              Component: ProductDetailPage,
            },
            { id: routeIds.notFound, path: '*', Component: NotFoundPage },
          ],
        },
      ],
    },
  ];
}
