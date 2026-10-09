import { Link, useMatches, useRouteLoaderData } from 'react-router';
import type { ProductDetailData } from '../features/product-detail/productDetailLoader';
import styles from './Breadcrumbs.module.css';
import { routeIds } from './routeIds';

/** La tienda tiene dos niveles: el listado y, debajo, la página actual si no es el listado. */
export function Breadcrumbs() {
  const currentPage = useCurrentPageLabel();

  return (
    <nav aria-label="Migas de pan">
      <ol className={styles.list}>
        <li className={styles.item}>
          {currentPage === null ? (
            <span aria-current="page" className={styles.current}>
              Móviles
            </span>
          ) : (
            <Link to="/" className={styles.link}>
              Móviles
            </Link>
          )}
        </li>
        {currentPage !== null && (
          <li className={styles.item}>
            <span aria-current="page" className={styles.current}>
              {currentPage}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

function useCurrentPageLabel(): string | null {
  const matches = useMatches();
  const detail = useRouteLoaderData<ProductDetailData>(routeIds.productDetail);

  if (matches.some((match) => match.id === routeIds.productDetail)) {
    // Mientras carga, o si la carga ha fallado, todavía no hay nombre que mostrar.
    return detail ? `${detail.data.brand} ${detail.data.model}` : 'Producto';
  }
  if (matches.some((match) => match.id === routeIds.notFound)) {
    return 'Página no encontrada';
  }
  return null;
}
