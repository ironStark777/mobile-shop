import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CartApi } from '../entities/cart/cartApi';
import { createCartStore } from '../entities/cart/cartStore';
import { CartStoreContext } from '../entities/cart/useCartCount';
import acerIconiaTalkS from '../entities/product/__fixtures__/product-acer-iconia-talk-s.json';
import productList from '../entities/product/__fixtures__/product-list.json';
import type { ProductApi } from '../entities/product/productApi';
import { parseProductDetail, parseProductList } from '../entities/product/productMapper';
import type { KeyValueStorage } from '../shared/lib/storage';
import { createRoutes } from './routes';

const listResult = { data: parseProductList(productList), isStale: false };
const detailResult = { data: parseProductDetail(acerIconiaTalkS), isStale: false };

function createMapStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

function renderRoute(path: string, overrides: Partial<ProductApi> = {}) {
  const productApi: ProductApi = {
    getProducts: vi.fn<ProductApi['getProducts']>().mockResolvedValue(listResult),
    getProductById: vi.fn<ProductApi['getProductById']>().mockResolvedValue(detailResult),
    ...overrides,
  };
  const cartApi: CartApi = { addToCart: vi.fn<CartApi['addToCart']>().mockResolvedValue(1) };
  // Una cesta nueva en cada test, para que lo que añade uno no afecte al siguiente.
  const cartStore = createCartStore(createMapStorage());
  const routes = createRoutes({ productApi, cartApi, cartStore });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <CartStoreContext value={cartStore}>
      <RouterProvider router={router} />
    </CartStoreContext>,
  );
  return { router, productApi, cartApi, cartStore };
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

    const main = await screen.findByRole('main');
    expect(within(main).getByRole('status')).toHaveTextContent('Cargando');
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

  it('a la derecha muestra el número de productos de la cesta', async () => {
    const { cartStore } = renderRoute('/');

    const header = await screen.findByRole('banner');
    expect(within(header).getByRole('status')).toHaveTextContent('Cesta 0');

    act(() => {
      cartStore.setCount(3);
    });
    expect(within(header).getByRole('status')).toHaveTextContent('Cesta 3');
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

describe('añadir a la cesta', () => {
  const detailPath = '/product/ZmGrkLRPXOTpxsU4jjAcv';

  it('muestra los selectores; si solo hay una opción, viene elegida', async () => {
    renderRoute(detailPath);

    const storage = await screen.findByRole('group', { name: 'Almacenamiento' });
    expect(within(storage).getByRole('radio', { name: '16 GB' })).not.toBeChecked();
    expect(within(storage).getByRole('radio', { name: '32 GB' })).not.toBeChecked();
    const color = screen.getByRole('group', { name: 'Color' });
    expect(within(color).getByRole('radio', { name: 'Black' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Añadir' })).toBeDisabled();
  });

  it('al elegir y pulsar Añadir, envía la elección y muestra el número de la cesta', async () => {
    const user = userEvent.setup();
    const { cartApi } = renderRoute(detailPath);

    await user.click(await screen.findByRole('radio', { name: '32 GB' }));
    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(await screen.findByText('Añadido a la cesta.')).toBeInTheDocument();
    const call = vi.mocked(cartApi.addToCart).mock.lastCall;
    expect(call?.[0]).toEqual({
      productId: 'ZmGrkLRPXOTpxsU4jjAcv',
      storageCode: 2001,
      colorCode: 1000,
    });
    expect(call?.[1]?.signal).toBeInstanceOf(AbortSignal);
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('status')).toHaveTextContent('Cesta 1');
  });

  it('si el API falla, lo dice y la cesta no cambia', async () => {
    const user = userEvent.setup();
    const { cartApi } = renderRoute(detailPath);
    vi.mocked(cartApi.addToCart).mockRejectedValue(new Error('API caída'));

    await user.click(await screen.findByRole('radio', { name: '16 GB' }));
    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(
      await screen.findByText('No se ha podido añadir a la cesta. Inténtalo de nuevo.'),
    ).toBeInTheDocument();
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('status')).toHaveTextContent('Cesta 0');
  });
});
