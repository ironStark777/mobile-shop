import type { RouteObject } from 'react-router';
import type { ProductApi } from '../entities/product/productApi';
import { ProductDetailPage } from '../features/product-detail/ProductDetailPage';
import { createProductDetailLoader } from '../features/product-detail/productDetailLoader';
import { ProductListPage } from '../features/product-list/ProductListPage';
import { createProductListLoader } from '../features/product-list/productListLoader';
import { InitialLoading } from './InitialLoading';
import { NotFoundPage } from './NotFoundPage';
import { RootLayout } from './RootLayout';
import { RouteError } from './RouteError';

export interface AppServices {
  readonly productApi: ProductApi;
}

/**
 * Las páginas cuelgan de una ruta sin `path` con su propio `ErrorBoundary` y `HydrateFallback`:
 * así los errores y la carga inicial se muestran dentro del layout, sin perder la cabecera.
 */
export function createRoutes({ productApi }: AppServices): RouteObject[] {
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
              Component: ProductListPage,
            },
            {
              path: 'product/:id',
              loader: createProductDetailLoader(productApi),
              Component: ProductDetailPage,
            },
            { path: '*', Component: NotFoundPage },
          ],
        },
      ],
    },
  ];
}
