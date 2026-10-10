import { Link } from 'react-router';
import { CartCount } from '../entities/cart/CartCount';
import { Breadcrumbs } from './Breadcrumbs';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Link to="/" className={styles.logo}>
            Mobile Shop
          </Link>
          <CartCount />
        </div>
        <Breadcrumbs />
      </div>
    </header>
  );
}
