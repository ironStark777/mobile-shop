import { Link } from 'react-router';

/**
 * El API responde con un error 500 tanto si falla como si el producto no existe, así que no se
 * puede distinguir un caso del otro.
 */
export function RouteError() {
  return (
    <>
      <title>Error | Mobile Shop</title>
      <h1>No se ha podido cargar la página</h1>
      <p>Puede que el producto no exista o que el servicio no esté disponible ahora mismo.</p>
      <Link to="/">Volver al listado</Link>
    </>
  );
}
