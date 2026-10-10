// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getReturnTo } from './returnTo';

describe('getReturnTo', () => {
  it('devuelve la ruta guardada en el estado de navegación', () => {
    expect(getReturnTo({ returnTo: '/?q=acer' }, '/')).toBe('/?q=acer');
  });

  it('sin estado válido, devuelve la ruta por defecto', () => {
    expect(getReturnTo(null, '/')).toBe('/');
    expect(getReturnTo({}, '/')).toBe('/');
    expect(getReturnTo({ returnTo: 42 }, '/')).toBe('/');
  });

  it('no acepta direcciones de fuera de la aplicación', () => {
    expect(getReturnTo({ returnTo: 'https://example.com' }, '/')).toBe('/');
    expect(getReturnTo({ returnTo: '//example.com' }, '/')).toBe('/');
  });
});
