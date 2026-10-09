# ADR-0003: Carga de datos con los loaders de React Router

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Autor/es:** Alex Muñoz
- **Relacionado:** commits `7e77192` y `05d5114`; [ADR-0002](0002-cache-de-respuestas-del-api.md)

## Contexto

Las dos vistas dependen de datos del API: el listado y el detalle, que además depende del id de la URL. En las pruebas, la primera petición al API tras un rato sin uso tardó más de un minuto. Hay que decidir cuándo y dónde se piden los datos, cómo se muestran la espera y los errores, y qué pasa con una petición si el usuario cambia de página antes de que responda.

## Decisión

Cada ruta declara un `loader` (React Router 8 en modo datos) que pide sus datos al servicio de productos antes de mostrar la página. Los componentes de página reciben los datos ya cargados con `useLoaderData` y no piden nada por su cuenta.

## Cómo funciona

1. `createRoutes({ productApi })` define las rutas `/` y `/product/:id`. Sus loaders llaman a `productApi` pasándole `request.signal`.
2. Al navegar, el router ejecuta el loader de la ruta destino y mantiene la página anterior hasta que termina. Si el usuario navega a otra parte antes, el router aborta la señal y la petición HTTP se cancela.
3. En la primera carga no hay página anterior que mantener, así que se muestra `InitialLoading` (`HydrateFallback`).
4. Si el loader falla, se muestra `RouteError` (`ErrorBoundary`). Las dos cuelgan de una ruta sin `path`, de modo que la cabecera se mantiene.
5. Las direcciones que no coinciden con ninguna ruta muestran `NotFoundPage` (ruta `*`).
6. Los tests montan las mismas rutas en un `createMemoryRouter` con servicios falsos.

## Alternativas consideradas

- **`useEffect` en cada página:** la página se pinta vacía y después pide los datos. Cada componente tendría que gestionar su estado de carga, su error y las carreras cuando una respuesta antigua llega después de una nueva. La [documentación de React](https://react.dev/reference/react/useEffect) recomienda usar el mecanismo de datos del framework o una caché en lugar de efectos, y cita React Router entre las opciones.
- **TanStack Query u otra librería de datos:** resuelve estados de carga, reintentos y caché, pero duplicaría la caché del ADR-0002 y añadiría una dependencia.
- **`use()` con Suspense:** React 19 permite leer una promesa con `use`, pero hay que crear y guardar la promesa fuera del componente y gestionar la cancelación a mano. Los loaders ya lo resuelven.

## Consecuencias

- **Positivas:** los componentes de página no gestionan estados de carga ni de error; las peticiones se cancelan al cambiar de página; la carga inicial y los errores se tratan en un solo sitio.
- **Negativas / compromisos:** la navegación espera a que lleguen los datos, así que con un API lento no se ve ningún cambio hasta que responde. `useLoaderData<T>()` confía en el tipo que se le indica: el router no comprueba que coincida con lo que devuelve el loader.
- **Pendiente:** un indicador de navegación en curso (`useNavigation`) y el aviso de datos no actualizados (`isStale`).
