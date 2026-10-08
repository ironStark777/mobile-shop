import * as z from 'zod';
import type { ProductDetail, ProductOption, ProductSummary } from './product';
import {
  productDetailDtoSchema,
  productSummaryDtoSchema,
  type ProductDetailDto,
  type ProductOptionDto,
  type ProductSummaryDto,
} from './productDto';

export class InvalidApiResponseError extends Error {
  override name = 'InvalidApiResponseError';
}

function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Las listas que envía el API son textos que partió por las comas, así que se vuelven a unir
 * con ", " para recuperar el texto original.
 */
function toOptionalText(value: string | string[]): string | null {
  const parts = (Array.isArray(value) ? value : [value])
    .map(collapseSpaces)
    .filter((part) => part !== '');
  return parts.length > 0 ? parts.join(', ') : null;
}

function toOptionalNumber(value: string | number): number | null {
  // Number('') es 0, no NaN: el texto vacío se trata aparte.
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toProductOption(dto: ProductOptionDto): ProductOption {
  return { code: dto.code, name: toOptionalText(dto.name) };
}

function toProductSummary(dto: ProductSummaryDto): ProductSummary {
  return {
    id: dto.id,
    brand: collapseSpaces(dto.brand),
    model: collapseSpaces(dto.model),
    price: toOptionalNumber(dto.price),
    imageUrl: toOptionalText(dto.imgUrl),
  };
}

function toProductDetail(dto: ProductDetailDto): ProductDetail {
  return {
    ...toProductSummary(dto),
    cpu: toOptionalText(dto.cpu),
    ram: toOptionalText(dto.ram),
    os: toOptionalText(dto.os),
    screenResolution: toOptionalText(dto.displaySize),
    battery: toOptionalText(dto.battery),
    primaryCamera: toOptionalText(dto.primaryCamera),
    secondaryCamera: toOptionalText(dto.secondaryCmera),
    dimensions: toOptionalText(dto.dimentions),
    weight: toOptionalNumber(dto.weight),
    colors: dto.options.colors.map(toProductOption),
    storages: dto.options.storages.map(toProductOption),
  };
}

/** Un producto que no se puede identificar se descarta para no dejar sin catálogo al resto. */
export function parseProductList(json: unknown): ProductSummary[] {
  const list = z.array(z.unknown()).safeParse(json);
  if (!list.success) {
    throw new InvalidApiResponseError('El listado de productos no es una lista', {
      cause: list.error,
    });
  }
  return list.data.flatMap((item) => {
    const product = productSummaryDtoSchema.safeParse(item);
    return product.success ? [toProductSummary(product.data)] : [];
  });
}

/** Solo falla si no se puede identificar el producto; el resto de datos se degrada a `null`. */
export function parseProductDetail(json: unknown): ProductDetail {
  const detail = productDetailDtoSchema.safeParse(json);
  if (!detail.success) {
    throw new InvalidApiResponseError(
      `El detalle del producto no se puede identificar:\n${z.prettifyError(detail.error)}`,
      { cause: detail.error },
    );
  }
  return toProductDetail(detail.data);
}
