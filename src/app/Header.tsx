import { Link } from 'react-router';
import { Breadcrumbs } from './Breadcrumbs';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Mobile Shop
        </Link>
        <Breadcrumbs />
      </div>
    </header>
  );
}
