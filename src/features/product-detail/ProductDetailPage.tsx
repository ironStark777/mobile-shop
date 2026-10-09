import { useLoaderData } from 'react-router';
import type { ProductDetailData } from './productDetailLoader';

export function ProductDetailPage() {
  const { data: product } = useLoaderData<ProductDetailData>();
  const name = `${product.brand} ${product.model}`;

  return (
    <>
      <title>{`${name} | Mobile Shop`}</title>
      <h1>{name}</h1>
    </>
  );
}
