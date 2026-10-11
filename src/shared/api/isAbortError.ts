/** `fetch` rechaza con este error cuando se cancela la petición mediante su `AbortSignal`. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
