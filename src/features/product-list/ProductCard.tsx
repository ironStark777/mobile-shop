import { Link, useLocation } from 'react-router';
import { formatPrice } from '../../entities/product/formatPrice';
import type { ProductSummary } from '../../entities/product/product';
import { ProductImage } from '../../entities/product/ProductImage';
import type { ReturnToState } from '../../shared/lib/returnTo';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  readonly product: ProductSummary;
}

/**
 * La foto lleva `alt` vacío porque la marca y el modelo ya están escritos en la tarjeta:
 * repetirlos solo haría que un lector de pantalla los leyera dos veces. El enlace guarda la
 * dirección actual, con la búsqueda, para que el detalle pueda volver a ella.
 */
export function ProductCard({ product }: ProductCardProps) {
  const { pathname, search } = useLocation();
  const returnTo: ReturnToState = { returnTo: pathname + search };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <ProductImage src={product.imageUrl} alt="" loading="lazy" />
      </div>
      <h2 className={styles.title}>
        <Link
          to={`/product/${encodeURIComponent(product.id)}`}
          state={returnTo}
          className={styles.link}
        >
          <span className={styles.brand}>{product.brand}</span> {product.model}
        </Link>
      </h2>
      <p className={styles.price}>{formatPrice(product.price)}</p>
    </article>
  );
}
