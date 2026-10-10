// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { formatPrice } from './formatPrice';

// Intl separa el número del símbolo con un espacio de no separación (\u00a0).
describe('formatPrice', () => {
  it('muestra los euros sin decimales cuando el precio es entero', () => {
    expect(formatPrice(170)).toBe('170\u00a0€');
  });

  it('muestra dos decimales cuando el precio los tiene', () => {
    expect(formatPrice(120.5)).toBe('120,50\u00a0€');
  });

  it('indica que no hay precio cuando el API no lo trae', () => {
    expect(formatPrice(null)).toBe('Precio no disponible');
  });
});
