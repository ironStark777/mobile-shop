import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import acerIconiaTalkS from '../entities/product/__fixtures__/product-acer-iconia-talk-s.json';
import productList from '../entities/product/__fixtures__/product-list.json';
import type { ProductApi } from '../entities/product/productApi';
import { parseProductDetail, parseProductList } from '../entities/product/productMapper';
import { createRoutes } from './routes';

const listResult = { data: parseProductList(productList), isStale: false };
const detailResult = { data: parseProductDetail(acerIconiaTalkS), isStale: false };

function renderRoute(path: string, overrides: Partial<ProductApi> = {}) {
  const productApi: ProductApi = {
    getProducts: vi.fn<ProductApi['getProducts']>().mockResolvedValue(listResult),
    getProductById: vi.fn<ProductApi['getProductById']>().mockResolvedValue(detailResult),
    ...overrides,
  };
  const router = createMemoryRouter(createRoutes({ productApi }), { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe('createRoutes', () => {
  it('en la raíz carga y muestra el listado de productos', async () => {
    renderRoute('/');

    expect(await screen.findByRole('heading', { level: 1, name: 'Móviles' })).toBeInTheDocument();
    expect(screen.getByText('4 productos')).toBeInTheDocument();
  });

  it('en /product/:id carga el detalle con la señal de cancelación de la petición', async () => {
    const getProductById = vi.fn<ProductApi['getProductById']>().mockResolvedValue(detailResult);

    renderRoute('/product/ZmGrkLRPXOTpxsU4jjAcv', { getProductById });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Acer Iconia Talk S' }),
    ).toBeInTheDocument();
    const call = getProductById.mock.lastCall;
    expect(call?.[0]).toBe('ZmGrkLRPXOTpxsU4jjAcv');
    expect(call?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('mientras llegan los datos de la primera página, muestra un mensaje de carga', async () => {
    const pending = new Promise<never>(() => undefined);
    const getProducts = vi.fn<ProductApi['getProducts']>().mockReturnValue(pending);

    renderRoute('/', { getProducts });

    expect(await screen.findByRole('status')).toHaveTextContent('Cargando');
  });

  it('si el API falla, muestra un error con un enlace al listado', async () => {
    const error = new Error('API caída');
    const getProducts = vi.fn<ProductApi['getProducts']>().mockRejectedValue(error);

    renderRoute('/', { getProducts });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'No se ha podido cargar la página' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al listado' })).toHaveAttribute('href', '/');
  });

  it('una dirección desconocida muestra la página no encontrada', async () => {
    renderRoute('/no-existe');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
