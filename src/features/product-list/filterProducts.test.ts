// @vitest-environment node
import { describe, expect, it } from 'vitest';
import productList from '../../entities/product/__fixtures__/product-list.json';
import { parseProductList } from '../../entities/product/productMapper';
import { filterProducts } from './filterProducts';

const products = parseProductList(productList);

function modelsFor(query: string): string[] {
  return filterProducts(products, query).map((product) => product.model);
}

describe('filterProducts', () => {
  it('sin texto de búsqueda devuelve todos los productos', () => {
    expect(modelsFor('')).toHaveLength(4);
    expect(modelsFor('   ')).toHaveLength(4);
  });

  it('busca en la marca sin distinguir mayúsculas', () => {
    expect(modelsFor('ACER')).toEqual(['Iconia Talk S', 'Iconia One 7 B1-730', 'DX650']);
  });

  it('busca en el modelo sin distinguir acentos', () => {
    expect(modelsFor('icónia')).toEqual(['Iconia Talk S', 'Iconia One 7 B1-730']);
  });

  it('acepta las palabras en cualquier orden, mezclando marca y modelo', () => {
    expect(modelsFor('one acer')).toEqual(['Iconia One 7 B1-730']);
  });

  it('devuelve una lista vacía si nada coincide', () => {
    expect(modelsFor('nokia')).toEqual([]);
  });
});
