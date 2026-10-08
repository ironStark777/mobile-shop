import { describe, expect, it } from 'vitest';
import { InvalidApiResponseError } from '../../shared/api/invalidApiResponseError';
import acerDx650 from './__fixtures__/product-acer-dx650.json';
import acerIconiaOne7 from './__fixtures__/product-acer-iconia-one-7.json';
import acerIconiaTalkS from './__fixtures__/product-acer-iconia-talk-s.json';
import alcatelFlash2017 from './__fixtures__/product-alcatel-flash-2017.json';
import productList from './__fixtures__/product-list.json';
import { parseProductDetail, parseProductList } from './productMapper';

// Las fixtures son respuestas reales del API, elegidas porque cubren sus irregularidades.

describe('parseProductList', () => {
  it('convierte el listado del API al modelo de dominio', () => {
    const products = parseProductList(productList);

    expect(products).toHaveLength(4);
    expect(products[0]).toEqual({
      id: 'ZmGrkLRPXOTpxsU4jjAcv',
      brand: 'Acer',
      model: 'Iconia Talk S',
      price: 170,
      imageUrl: 'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
    });
  });

  it('deja el precio a null cuando el API lo envía vacío', () => {
    const products = parseProductList(productList);
    const flash = products.find((product) => product.model === 'Flash (2017)');

    expect(flash?.price).toBeNull();
  });

  it('descarta los productos que no se pueden identificar sin perder el resto', () => {
    const products = parseProductList([...productList, { brand: 'Acer', model: 'Sin id' }]);

    expect(products).toHaveLength(4);
  });

  it('falla si la respuesta no es una lista', () => {
    expect(() => parseProductList({ message: 'An Unexpected Error Occurred' })).toThrow(
      InvalidApiResponseError,
    );
  });
});

describe('parseProductDetail', () => {
  it('convierte el detalle del API al modelo de dominio', () => {
    expect(parseProductDetail(acerIconiaTalkS)).toEqual({
      id: 'ZmGrkLRPXOTpxsU4jjAcv',
      brand: 'Acer',
      model: 'Iconia Talk S',
      price: 170,
      imageUrl: 'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
      cpu: 'Quad-core 1.3 GHz Cortex-A53',
      ram: '2 GB RAM',
      os: 'Android 6.0 (Marshmallow)',
      screenResolution: '720 x 1280 pixels (~210 ppi pixel density)',
      battery: 'Non-removable Li-Ion 3400 mAh battery (12.92 Wh)',
      primaryCamera: '13 MP, autofocus',
      secondaryCamera: '2 MP, 720p',
      dimensions: '191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)',
      weight: 260,
      colors: [{ code: 1000, name: 'Black' }],
      storages: [
        { code: 2000, name: '16 GB' },
        { code: 2001, name: '32 GB' },
      ],
    });
  });

  it('toma la resolución de displaySize, porque el API intercambia los dos campos', () => {
    expect(parseProductDetail(acerIconiaTalkS).screenResolution).toContain('pixels');
  });

  it('une en un texto los campos que llegan como lista', () => {
    expect(parseProductDetail(alcatelFlash2017).cpu).toBe(
      'Deca-core (2x2.3 GHz Cortex-A72, 4x1.9 GHz Cortex-A53, 4x1.4 GHz Cortex-A53)',
    );
    expect(parseProductDetail(acerIconiaOne7).os).toBe(
      'Android 4.2.2 (Jelly Bean), planned upgrade to 4.4.2 (KitKat)',
    );
  });

  it('deja a null los campos que el API envía vacíos', () => {
    expect(parseProductDetail(alcatelFlash2017).price).toBeNull();
    expect(parseProductDetail(acerIconiaOne7).weight).toBeNull();
    expect(parseProductDetail(acerDx650).ram).toBeNull();
  });

  it('conserva las opciones sin nombre, con el nombre a null', () => {
    expect(parseProductDetail(acerDx650).storages).toEqual([{ code: 2000, name: null }]);
  });

  it('normaliza los espacios repetidos', () => {
    const detail = parseProductDetail({ ...acerIconiaTalkS, ram: '  2 GB   RAM ' });

    expect(detail.ram).toBe('2 GB RAM');
  });

  describe('si el API cambia el formato de un dato', () => {
    it('deja a null el campo informativo afectado y conserva el resto', () => {
      const detail = parseProductDetail({ ...acerIconiaTalkS, cpu: 42, battery: { mAh: 3400 } });

      expect(detail.cpu).toBeNull();
      expect(detail.battery).toBeNull();
      expect(detail.model).toBe('Iconia Talk S');
      expect(detail.ram).toBe('2 GB RAM');
    });

    it('acepta precio y peso como número', () => {
      const detail = parseProductDetail({ ...acerIconiaTalkS, price: 170, weight: 260 });

      expect(detail.price).toBe(170);
      expect(detail.weight).toBe(260);
    });

    it('deja la imagen a null si no llega', () => {
      expect(parseProductDetail({ ...acerIconiaTalkS, imgUrl: null }).imageUrl).toBeNull();
    });

    it('descarta solo las opciones inválidas', () => {
      const detail = parseProductDetail({
        ...acerIconiaTalkS,
        options: { colors: [{ code: 1000, name: 'Black' }, { name: 'Sin código' }] },
      });

      expect(detail.colors).toEqual([{ code: 1000, name: 'Black' }]);
      expect(detail.storages).toEqual([]);
    });

    it('deja las opciones vacías si no tienen el formato esperado', () => {
      const detail = parseProductDetail({ ...acerIconiaTalkS, options: 'sin opciones' });

      expect(detail.colors).toEqual([]);
      expect(detail.storages).toEqual([]);
    });
  });

  it('falla si no se puede identificar el producto', () => {
    expect(() => parseProductDetail({ ...acerIconiaTalkS, id: '' })).toThrow(/at id/);
    expect(() => parseProductDetail({ ...acerIconiaTalkS, brand: undefined })).toThrow(
      InvalidApiResponseError,
    );
  });

  it('falla con el cuerpo de error que devuelve el API', () => {
    expect(() => parseProductDetail({ message: 'An Unexpected Error Occurred', code: 0 })).toThrow(
      InvalidApiResponseError,
    );
  });
});
