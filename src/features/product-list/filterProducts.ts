import type { ProductSummary } from '../../entities/product/product';

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Busca cada palabra del texto en la marca y el modelo, sin distinguir mayúsculas ni acentos
 * y en cualquier orden: «z6 acer» encuentra el Acer Liquid Z6.
 */
export function filterProducts(
  products: readonly ProductSummary[],
  query: string,
): readonly ProductSummary[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return products;
  }
  return products.filter((product) => {
    const text = normalize(`${product.brand} ${product.model}`);
    return words.every((word) => text.includes(word));
  });
}
