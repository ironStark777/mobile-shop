/** El API ha respondido, pero con datos que no cumplen el contrato esperado. */
export class InvalidApiResponseError extends Error {
  override name = 'InvalidApiResponseError';
}
