import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createRoutes } from './app/routes';
import { cartApi } from './entities/cart/cartApi';
import { cartStore } from './entities/cart/cartStore';
import { CartStoreContext } from './entities/cart/useCartCount';
import { productApi } from './entities/product/productApi';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('No se ha encontrado el elemento #root en index.html');
}

// El router se crea fuera de React y empieza a cargar los datos de la primera página al momento.
const router = createBrowserRouter(createRoutes({ productApi, cartApi, cartStore }));

createRoot(container).render(
  <StrictMode>
    {/* La action que añade a la cesta y el contador de la cabecera usan la misma cesta. */}
    <CartStoreContext value={cartStore}>
      <RouterProvider router={router} />
    </CartStoreContext>
  </StrictMode>,
);
