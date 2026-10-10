import { useLoaderData, useSearchParams } from 'react-router';
import { filterProducts } from './filterProducts';
import { ProductCard } from './ProductCard';
import styles from './ProductListPage.module.css';
import type { ProductListData } from './productListLoader';
import { SearchBox } from './SearchBox';

const SEARCH_PARAM = 'q';

function describeCount(shown: number, total: number): string {
  return shown === total
    ? `${String(total)} productos`
    : `${String(shown)} de ${String(total)} productos`;
}

export function ProductListPage() {
  const { data: products } = useLoaderData<ProductListData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(SEARCH_PARAM) ?? '';
  const visibleProducts = filterProducts(products, query);

  // `replace` evita que cada letra escrita deje una entrada en el historial del navegador.
  function handleQueryChange(nextQuery: string) {
    setSearchParams(nextQuery === '' ? {} : { [SEARCH_PARAM]: nextQuery }, { replace: true });
  }

  return (
    <>
      <title>Mobile Shop</title>
      <div className={styles.toolbar}>
        <div className={styles.heading}>
          <h1>Móviles</h1>
          <p role="status" className={styles.count}>
            {describeCount(visibleProducts.length, products.length)}
          </p>
        </div>
        <SearchBox query={query} onQueryChange={handleQueryChange} />
      </div>
      {visibleProducts.length > 0 ? (
        <ul className={styles.grid}>
          {visibleProducts.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          Ningún producto coincide con «{query.trim()}». Prueba con otra marca o modelo.
        </p>
      )}
    </>
  );
}
