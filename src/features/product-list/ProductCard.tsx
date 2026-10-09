import { Link } from 'react-router';
import { formatPrice } from '../../entities/product/formatPrice';
import type { ProductSummary } from '../../entities/product/product';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  readonly product: ProductSummary;
}

/**
 * La foto lleva `alt` vacío porque la marca y el modelo ya están escritos en la tarjeta:
 * repetirlos solo haría que un lector de pantalla los leyera dos veces.
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {product.imageUrl !== null && (
          <img src={product.imageUrl} alt="" loading="lazy" className={styles.image} />
        )}
      </div>
      <h2 className={styles.title}>
        <Link to={`/product/${encodeURIComponent(product.id)}`} className={styles.link}>
          <span className={styles.brand}>{product.brand}</span> {product.model}
        </Link>
      </h2>
      <p className={styles.price}>{formatPrice(product.price)}</p>
    </article>
  );
}
