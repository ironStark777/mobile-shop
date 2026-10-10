import styles from './CartCount.module.css';
import { useCartCount } from './useCartCount';

/** El número de productos de la cesta; se anuncia a los lectores de pantalla cuando cambia. */
export function CartCount() {
  const count = useCartCount();

  return (
    <p role="status" className={styles.cart}>
      Cesta <span className={styles.count}>{count}</span>
    </p>
  );
}
