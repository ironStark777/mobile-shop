import type { ProductDetail } from '../../entities/product/product';

export interface ProductSpec {
  readonly label: string;
  readonly value: string;
}

const NOT_AVAILABLE = 'No disponible';
const weightFormatter = new Intl.NumberFormat('es-ES', { style: 'unit', unit: 'gram' });

/** Las especificaciones que pide el enunciado, en el orden en que se muestran. */
export function getProductSpecs(product: ProductDetail): ProductSpec[] {
  const weight = product.weight === null ? null : weightFormatter.format(product.weight);
  return [
    { label: 'CPU', value: product.cpu },
    { label: 'RAM', value: product.ram },
    { label: 'Sistema operativo', value: product.os },
    { label: 'Resolución de pantalla', value: product.screenResolution },
    { label: 'Batería', value: product.battery },
    { label: 'Cámara principal', value: product.primaryCamera },
    { label: 'Cámara frontal', value: product.secondaryCamera },
    { label: 'Dimensiones', value: product.dimensions },
    { label: 'Peso', value: weight },
  ].map(({ label, value }) => ({ label, value: value ?? NOT_AVAILABLE }));
}
