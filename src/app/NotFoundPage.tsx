import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <>
      <title>Página no encontrada | Mobile Shop</title>
      <h1>Página no encontrada</h1>
      <p>La dirección no corresponde a ninguna página de la tienda.</p>
      <Link to="/">Volver al listado</Link>
    </>
  );
}
