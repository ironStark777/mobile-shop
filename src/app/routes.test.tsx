import { act, render, screen, within } from '@testing-library/react';
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
  return { router, productApi };
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

describe('buscador', () => {
  const searchBoxName = 'Buscar por marca o modelo';

  it('filtra por marca y modelo mientras se escribe, sin volver a pedir el listado', async () => {
    const user = userEvent.setup();
    const { router, productApi } = renderRoute('/');

    await user.type(await screen.findByRole('searchbox', { name: searchBoxName }), 'iconia');

    expect(await screen.findByText('2 de 4 productos')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(router.state.location.search).toBe('?q=iconia');
    expect(productApi.getProducts).toHaveBeenCalledOnce();
  });

  it('buscar no vuelve a pedir el listado, pero una revalidación explícita sí', async () => {
    const user = userEvent.setup();
    const { router, productApi } = renderRoute('/');

    await user.type(await screen.findByRole('searchbox', { name: searchBoxName }), 'acer');
    expect(await screen.findByText('3 de 4 productos')).toBeInTheDocument();
    expect(productApi.getProducts).toHaveBeenCalledOnce();

    await act(() => router.revalidate());
    expect(productApi.getProducts).toHaveBeenCalledTimes(2);
  });

  it('al abrir una dirección con ?q= muestra el listado ya filtrado', async () => {
    renderRoute('/?q=alcatel');

    expect(await screen.findByRole('searchbox', { name: searchBoxName })).toHaveValue('alcatel');
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('si nada coincide, lo dice y sugiere cambiar la búsqueda', async () => {
    renderRoute('/?q=nokia');

    expect(await screen.findByText(/Ningún producto coincide con «nokia»/)).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('no pierde letras al escribir muy rápido', async () => {
    const user = userEvent.setup({ delay: null });
    const { router } = renderRoute('/');

    const searchBox = await screen.findByRole('searchbox', { name: searchBoxName });
    await user.type(searchBox, 'iconia one');

    expect(await screen.findByText('1 de 4 productos')).toBeInTheDocument();
    expect(searchBox).toHaveValue('iconia one');
    expect(router.state.location.search).toBe('?q=iconia+one');
  });

  it('al editar en mitad del texto, el cursor se queda donde estaba', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    const searchBox = await screen.findByRole('searchbox', { name: searchBoxName });
    await user.type(searchBox, 'aer');
    await user.keyboard('{ArrowLeft}{ArrowLeft}c');

    expect(await screen.findByText('3 de 4 productos')).toBeInTheDocument();
    expect(searchBox).toHaveValue('acer');
    expect(searchBox).toHaveProperty('selectionStart', 2);
  });

  it('con atrás y adelante, el campo sigue a la URL', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute('/');

    const searchBox = await screen.findByRole('searchbox', { name: searchBoxName });
    await user.type(searchBox, 'acer');
    await user.click(screen.getByRole('link', { name: 'Mobile Shop' }));
    expect(await screen.findByText('4 productos')).toBeInTheDocument();
    expect(searchBox).toHaveValue('');

    await act(() => router.navigate(-1));
    expect(await screen.findByText('3 de 4 productos')).toBeInTheDocument();
    expect(searchBox).toHaveValue('acer');

    await act(() => router.navigate(1));
    expect(await screen.findByText('4 productos')).toBeInTheDocument();
    expect(searchBox).toHaveValue('');
  });

  it('al pulsar el logo se borra la búsqueda', async () => {
    const user = userEvent.setup();
    renderRoute('/?q=alcatel');

    await user.click(await screen.findByRole('link', { name: 'Mobile Shop' }));

    expect(await screen.findByText('4 productos')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: searchBoxName })).toHaveValue('');
  });
});

describe('detalle', () => {
  it('muestra la foto, el precio y las especificaciones del producto', async () => {
    renderRoute('/product/ZmGrkLRPXOTpxsU4jjAcv');

    expect(await screen.findByRole('img', { name: 'Acer Iconia Talk S' })).toBeInTheDocument();
    expect(screen.getByText('170 €')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Especificaciones' })).toBeInTheDocument();
    expect(screen.getByText('Quad-core 1.3 GHz Cortex-A53')).toBeInTheDocument();
  });

  it('si se entra directamente, el enlace de volver lleva al listado completo', async () => {
    renderRoute('/product/ZmGrkLRPXOTpxsU4jjAcv');

    const back = await screen.findByRole('link', { name: 'Volver al listado' });
    expect(back).toHaveAttribute('href', '/');
  });

  it('al volver al listado se conserva la búsqueda', async () => {
    const user = userEvent.setup();
    renderRoute('/?q=acer');

    await user.click(await screen.findByRole('link', { name: 'Acer Iconia Talk S' }));
    await user.click(await screen.findByRole('link', { name: 'Volver al listado' }));

    expect(await screen.findByText('3 de 4 productos')).toBeInTheDocument();
    const searchBox = screen.getByRole('searchbox', { name: 'Buscar por marca o modelo' });
    expect(searchBox).toHaveValue('acer');
  });
});
