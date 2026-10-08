import * as z from 'zod';

/*
 * Contrato del API. El enunciado solo documenta el `id`; el resto se ha deducido analizando
 * las respuestas reales de los 100 productos. Los nombres de campo son los del API, erratas
 * incluidas, y un mismo campo puede llegar unas veces como texto y otras como lista.
 *
 * Solo son obligatorios los datos que identifican el producto (id, marca y modelo). El resto
 * es tolerante: si un campo llega con un formato inesperado se trata como vacío, para que un
 * dato roto no impida ver el producto ni comprarlo.
 */

const requiredText = z.string().trim().min(1);
const optionalText = z.string().catch('');
const optionalTextOrList = z.union([z.string(), z.array(z.string())]).catch('');

// El API envía los números como texto ("170"); se acepta también número por si lo corrige.
const optionalNumber = z.union([z.string(), z.number()]).catch('');

const productOptionDtoSchema = z.object({
  code: z.number(),
  name: optionalText,
});

/** Descarta las opciones inválidas una a una en lugar de invalidar el producto entero. */
const optionListSchema = z
  .array(z.unknown())
  .catch([])
  .transform((items) =>
    items.flatMap((item) => {
      const option = productOptionDtoSchema.safeParse(item);
      return option.success ? [option.data] : [];
    }),
  );

export const productSummaryDtoSchema = z.object({
  id: requiredText,
  brand: requiredText,
  model: requiredText,
  /** "170", o vacío cuando el producto no tiene precio. */
  price: optionalNumber,
  imgUrl: optionalText,
});

export const productDetailDtoSchema = productSummaryDtoSchema.extend({
  cpu: optionalTextOrList,
  ram: optionalTextOrList,
  os: optionalTextOrList,
  /**
   * Pese al nombre, contiene la resolución en píxeles. `displayResolution`, que no se lee,
   * contiene el tamaño en pulgadas.
   */
  displaySize: optionalText,
  battery: optionalText,
  primaryCamera: optionalTextOrList,
  /** Errata del API: "Cmera". */
  secondaryCmera: optionalTextOrList,
  /** Errata del API: "dimentions". */
  dimentions: optionalText,
  /** Gramos, sin unidad ("260"). */
  weight: optionalNumber,
  options: z
    .object({ colors: optionListSchema, storages: optionListSchema })
    .catch({ colors: [], storages: [] }),
});

export type ProductSummaryDto = z.infer<typeof productSummaryDtoSchema>;
export type ProductDetailDto = z.infer<typeof productDetailDtoSchema>;
export type ProductOptionDto = z.infer<typeof productOptionDtoSchema>;
