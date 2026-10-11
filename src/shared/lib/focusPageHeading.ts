/**
 * Lleva el foco al título principal de la página sin desplazarla. Los `h1` de las páginas llevan
 * `tabIndex={-1}` para poder recibirlo.
 */
export function focusPageHeading(): void {
  document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
}
