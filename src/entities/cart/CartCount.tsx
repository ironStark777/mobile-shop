import styles from './CartCount.module.css';
import { useCartCount } from './useCartCount';

/**
 * El número de productos de la cesta; se anuncia cuando cambia. A la vista dice "Cesta" y el
 * número; el texto completo, para los lectores de pantalla, es "Cesta: 3 productos".
 */
export function CartCount() {
  const count = useCartCount();

  return (
    <p role="status" className={styles.cart}>
      Cesta<span className="visually-hidden">:</span> <span className={styles.count}>{count}</span>
      <span className="visually-hidden">{count === 1 ? ' producto' : ' productos'}</span>
    </p>
  );
}
