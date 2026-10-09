const priceFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  trailingZeroDisplay: 'stripIfInteger',
});

/** Los precios del API están en euros; algunos productos no lo traen. */
export function formatPrice(price: number | null): string {
  return price === null ? 'Precio no disponible' : priceFormatter.format(price);
}
