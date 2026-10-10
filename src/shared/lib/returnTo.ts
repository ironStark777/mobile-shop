/** Estado de navegación que indica a la página de destino adónde debe volver. */
export interface ReturnToState {
  readonly returnTo: string;
}

/** Solo acepta rutas de la propia aplicación; si no hay ninguna válida, devuelve `fallback`. */
export function getReturnTo(state: unknown, fallback: string): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'returnTo' in state &&
    typeof state.returnTo === 'string' &&
    state.returnTo.startsWith('/') &&
    !state.returnTo.startsWith('//')
  ) {
    return state.returnTo;
  }
  return fallback;
}
