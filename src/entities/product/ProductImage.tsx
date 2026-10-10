import styles from './ProductImage.module.css';

interface ProductImageProps {
  readonly src: string | null;
  readonly alt: string;
  readonly loading?: 'eager' | 'lazy';
}

/** La foto del producto sobre un panel gris, en el listado y en el detalle. */
export function ProductImage({ src, alt, loading }: ProductImageProps) {
  return (
    <div className={styles.panel}>
      {src !== null && <img src={src} alt={alt} loading={loading} className={styles.image} />}
    </div>
  );
}
