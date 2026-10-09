import { useLoaderData } from 'react-router';
import type { ProductListData } from './productListLoader';

export function ProductListPage() {
  const { data: products } = useLoaderData<ProductListData>();

  return (
    <>
      <title>Mobile Shop</title>
      <h1>Móviles</h1>
      <p>{products.length} productos</p>
    </>
  );
}
