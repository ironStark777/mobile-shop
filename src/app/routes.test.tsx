import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  it('al pulsar un producto del listado, muestra su detalle', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(await screen.findByRole('link', { name: 'Acer Iconia Talk S' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Acer Iconia Talk S' }),
    ).toBeInTheDocument();
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

describe('cabecera', () => {
  it('el nombre de la tienda enlaza al listado', async () => {
    renderRoute('/no-existe');

    expect(await screen.findByRole('link', { name: 'Mobile Shop' })).toHaveAttribute('href', '/');
  });

  it('en el listado, las migas marcan Móviles como página actual', async () => {
    renderRoute('/');

    const breadcrumbs = await screen.findByRole('navigation', { name: 'Migas de pan' });
    expect(within(breadcrumbs).getByText('Móviles')).toHaveAttribute('aria-current', 'page');
  });

  it('en el detalle, las migas enlazan al listado y marcan el producto como actual', async () => {
    renderRoute('/product/ZmGrkLRPXOTpxsU4jjAcv');

    await screen.findByRole('heading', { level: 1, name: 'Acer Iconia Talk S' });
    const breadcrumbs = screen.getByRole('navigation', { name: 'Migas de pan' });
    expect(within(breadcrumbs).getByRole('link', { name: 'Móviles' })).toHaveAttribute('href', '/');
    const current = within(breadcrumbs).getByText('Acer Iconia Talk S');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('en una dirección desconocida, las migas muestran la página no encontrada', async () => {
    renderRoute('/no-existe');

    const breadcrumbs = await screen.findByRole('navigation', { name: 'Migas de pan' });
    const current = within(breadcrumbs).getByText('Página no encontrada');
    expect(current).toHaveAttribute('aria-current', 'page');
  });
});
