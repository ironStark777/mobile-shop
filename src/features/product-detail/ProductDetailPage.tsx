import { Link, useLoaderData, useLocation } from 'react-router';
import { formatPrice } from '../../entities/product/formatPrice';
import { ProductImage } from '../../entities/product/ProductImage';
import { getReturnTo } from '../../shared/lib/returnTo';
import { AddToCartForm } from './AddToCartForm';
import styles from './ProductDetailPage.module.css';
import type { ProductDetailData } from './productDetailLoader';
import { getProductSpecs } from './productSpecs';

export function ProductDetailPage() {
  const { data: product } = useLoaderData<ProductDetailData>();
  const location = useLocation();
  const name = `${product.brand} ${product.model}`;

  return (
    <>
      <title>{`${name} | Mobile Shop`}</title>
      <Link to={getReturnTo(location.state, '/')} className={styles.back}>
        Volver al listado
      </Link>
      <div className={styles.layout}>
        <ProductImage src={product.imageUrl} alt={name} />
        <div className={styles.info}>
          <h1>
            <span className={styles.brand}>{product.brand}</span> {product.model}
          </h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <section className={styles.specs}>
            <h2 className={styles.specsTitle}>Especificaciones</h2>
            <dl>
              {getProductSpecs(product).map((spec) => (
                <div key={spec.label} className={styles.spec}>
                  <dt className={styles.specLabel}>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          {/* La key hace que, con otro producto, la elección empiece de cero. */}
          <AddToCartForm key={product.id} product={product} />
        </div>
      </div>
    </>
  );
}
