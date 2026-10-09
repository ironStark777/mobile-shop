import { useLoaderData } from 'react-router';
import { ProductCard } from './ProductCard';
import styles from './ProductListPage.module.css';
import type { ProductListData } from './productListLoader';

export function ProductListPage() {
  const { data: products } = useLoaderData<ProductListData>();

  return (
    <>
      <title>Mobile Shop</title>
      <h1>Móviles</h1>
      <p className={styles.count}>{products.length} productos</p>
      <ul className={styles.grid}>
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}
