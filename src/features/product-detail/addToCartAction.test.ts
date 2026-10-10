// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { CartApi } from '../../entities/cart/cartApi';
import type { CartStore } from '../../entities/cart/cartStore';
import { createAddToCartAction } from './addToCartAction';

function setup(addToCart: CartApi['addToCart']) {
  const cartStore: CartStore = {
    getCount: () => 0,
    setCount: vi.fn<CartStore['setCount']>(),
    subscribe: () => () => undefined,
  };
  const action = createAddToCartAction({ addToCart }, cartStore);
  return { action, cartStore };
}

function postForm(fields: Record<string, string>): Request {
  return new Request('http://localhost/product/abc', {
    method: 'POST',
    body: new URLSearchParams(fields),
  });
}

describe('createAddToCartAction', () => {
  it('añade el producto de la URL con los códigos elegidos y guarda el número de la cesta', async () => {
    const addToCart = vi.fn<CartApi['addToCart']>().mockResolvedValue(3);
    const { action, cartStore } = setup(addToCart);
    const request = postForm({ storageCode: '2001', colorCode: '1000' });

    const result = await action({ params: { id: 'abc' }, request });

    expect(result).toEqual({ ok: true, message: 'Añadido a la cesta.' });
    expect(addToCart).toHaveBeenCalledWith(
      { productId: 'abc', storageCode: 2001, colorCode: 1000 },
      { signal: request.signal },
    );
    expect(cartStore.setCount).toHaveBeenCalledWith(3);
  });

  it('si el API falla, devuelve un mensaje y no cambia el número de la cesta', async () => {
    const addToCart = vi.fn<CartApi['addToCart']>().mockRejectedValue(new Error('API caída'));
    const { action, cartStore } = setup(addToCart);

    const result = await action({
      params: { id: 'abc' },
      request: postForm({ storageCode: '2001', colorCode: '1000' }),
    });

    expect(result).toEqual({
      ok: false,
      message: 'No se ha podido añadir a la cesta. Inténtalo de nuevo.',
    });
    expect(cartStore.setCount).not.toHaveBeenCalled();
  });

  it('si falta el almacenamiento o el color, no llama al API', async () => {
    const addToCart = vi.fn<CartApi['addToCart']>();
    const { action } = setup(addToCart);

    const result = await action({
      params: { id: 'abc' },
      request: postForm({ colorCode: '1000' }),
    });

    expect(result).toEqual({ ok: false, message: 'Elige el almacenamiento y el color.' });
    expect(addToCart).not.toHaveBeenCalled();
  });
});
