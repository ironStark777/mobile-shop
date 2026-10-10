import { createContext, useContext, useSyncExternalStore } from 'react';
import { cartStore, type CartStore } from './cartStore';

/**
 * El contexto solo inyecta la instancia del store, que no cambia: el número vive en el store
 * y `useSyncExternalStore` vuelve a pintar a quien lo usa cuando cambia. Por defecto es el store
 * de la aplicación; los tests lo sustituyen por uno propio.
 */
export const CartStoreContext = createContext<CartStore>(cartStore);

export function useCartCount(): number {
  const store = useContext(CartStoreContext);
  return useSyncExternalStore(store.subscribe, store.getCount);
}
