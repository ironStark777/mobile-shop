// @vitest-environment node
import { describe, expect, it } from 'vitest';
import acerDx650 from '../../entities/product/__fixtures__/product-acer-dx650.json';
import acerIconiaTalkS from '../../entities/product/__fixtures__/product-acer-iconia-talk-s.json';
import { parseProductDetail } from '../../entities/product/productMapper';
import { getProductSpecs } from './productSpecs';

function specsOf(json: unknown): Map<string, string> {
  const specs = getProductSpecs(parseProductDetail(json));
  return new Map(specs.map((spec) => [spec.label, spec.value]));
}

describe('getProductSpecs', () => {
  it('incluye todas las especificaciones que pide el enunciado, en orden', () => {
    expect([...specsOf(acerIconiaTalkS).keys()]).toEqual([
      'CPU',
      'RAM',
      'Sistema operativo',
      'Resolución de pantalla',
      'Batería',
      'Cámara principal',
      'Cámara frontal',
      'Dimensiones',
      'Peso',
    ]);
  });

  it('muestra los valores del API', () => {
    const specs = specsOf(acerIconiaTalkS);

    expect(specs.get('CPU')).toBe('Quad-core 1.3 GHz Cortex-A53');
    expect(specs.get('Cámara principal')).toBe('13 MP, autofocus');
    expect(specs.get('Peso')).toMatch(/^260.g$/);
  });

  it('indica los datos que el API no trae', () => {
    expect(specsOf(acerDx650).get('RAM')).toBe('No disponible');
  });
});
