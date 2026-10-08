/*
 * Modelo de dominio de la aplicación. En todo el modelo, `null` significa que el API no informa
 * el dato: lo envía vacío o con un formato inesperado.
 */

export interface ProductSummary {
  readonly id: string;
  readonly brand: string;
  readonly model: string;
  /** En euros. */
  readonly price: number | null;
  readonly imageUrl: string | null;
}

/** Variante que el usuario elige antes de comprar: un color o una capacidad de almacenamiento. */
export interface ProductOption {
  readonly code: number;
  readonly name: string | null;
}

export interface ProductDetail extends ProductSummary {
  readonly cpu: string | null;
  readonly ram: string | null;
  readonly os: string | null;
  readonly screenResolution: string | null;
  readonly battery: string | null;
  readonly primaryCamera: string | null;
  readonly secondaryCamera: string | null;
  readonly dimensions: string | null;
  /** En gramos. */
  readonly weight: number | null;
  /** Vacías si el API no envía opciones válidas; sin opciones, el producto no se puede comprar. */
  readonly colors: readonly ProductOption[];
  readonly storages: readonly ProductOption[];
}
