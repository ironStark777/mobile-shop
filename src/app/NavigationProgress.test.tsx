import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  createMemoryRouter,
  Link,
  Outlet,
  RouterProvider,
  type LoaderFunctionArgs,
} from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavigationProgress } from './NavigationProgress';

const SLOW_NOTICE = 'El servicio está tardando en responder; puede tardar más de un minuto.';

function Layout() {
  return (
    <>
      <NavigationProgress />
      <Link to="/a">Página A</Link>
      <Link to="/b">Página B</Link>
      <Outlet />
    </>
  );
}

/** Las páginas A y B no terminan de cargar hasta que el test llama a `finishLoading`. */
async function renderWithSlowPages() {
  const finishers = new Map<string, () => void>();
  const loader = ({ request }: LoaderFunctionArgs) =>
    new Promise<null>((resolve) => {
      finishers.set(new URL(request.url).pathname, () => {
        resolve(null);
      });
    });
  const router = createMemoryRouter([
    {
      path: '/',
      Component: Layout,
      children: [
        { index: true, Component: () => <p>Inicio</p> },
        { path: 'a', loader, Component: () => <p>Página A cargada</p> },
        { path: 'b', loader, Component: () => <p>Página B cargada</p> },
      ],
    },
  ]);
  render(<RouterProvider router={router} />);
  await screen.findByText('Inicio');

  // Desde aquí el tiempo solo avanza cuando el test lo pide. Solo se simula `setTimeout`, que es lo
  // que usa el aviso: `await act()` necesita el `setImmediate` real para terminar.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  return {
    finishLoading: (path: string) => {
      finishers.get(path)?.();
    },
  };
}

/** Avanza el reloj simulado y deja que el router y React terminen lo pendiente. */
async function advance(ms: number) {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

function clickLink(name: string) {
  fireEvent.click(screen.getByRole('link', { name }));
}

describe('NavigationProgress', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('anuncia la carga al momento y avisa a los 5 segundos', async () => {
    await renderWithSlowPages();

    clickLink('Página A');
    await advance(0);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();

    await advance(4999);
    expect(screen.queryByText(SLOW_NOTICE)).not.toBeInTheDocument();

    await advance(1);
    expect(screen.getByText(SLOW_NOTICE)).toBeInTheDocument();
  });

  it('una navegación nueva quita el aviso y vuelve a contar desde cero', async () => {
    const { finishLoading } = await renderWithSlowPages();
    clickLink('Página A');
    await advance(5000);
    expect(screen.getByText(SLOW_NOTICE)).toBeInTheDocument();

    clickLink('Página B');
    await advance(0);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(screen.queryByText(SLOW_NOTICE)).not.toBeInTheDocument();

    await advance(4999);
    expect(screen.queryByText(SLOW_NOTICE)).not.toBeInTheDocument();

    await advance(1);
    expect(screen.getByText(SLOW_NOTICE)).toBeInTheDocument();

    finishLoading('/b');
    await advance(0);
    expect(screen.getByText('Página B cargada')).toBeInTheDocument();
    expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    expect(screen.queryByText(SLOW_NOTICE)).not.toBeInTheDocument();
  });

  it('si la página llega antes de 5 segundos, cancela el aviso', async () => {
    const { finishLoading } = await renderWithSlowPages();
    clickLink('Página A');
    await advance(3000);

    finishLoading('/a');
    await advance(0);
    expect(screen.getByText('Página A cargada')).toBeInTheDocument();
    expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);

    await advance(5000);
    expect(screen.queryByText(SLOW_NOTICE)).not.toBeInTheDocument();
  });
});
