# Mobile Shop

Mini aplicación (SPA) para comprar dispositivos móviles. Tiene dos vistas: el listado de productos, con buscador en tiempo real, y el detalle de cada producto, desde donde se elige almacenamiento y color y se añade a la cesta.

## Requisitos

- Node.js 24 LTS (mínimo 22.22). Si usas nvm, `nvm use` coge la versión del `.nvmrc`.
- npm 10 o superior.

## Puesta en marcha

```bash
npm install
npm start
```

La aplicación queda disponible en http://localhost:5173.

## Configuración

Por defecto, la aplicación usa el API del enunciado. Para usar otro (por ejemplo, un mock local), crea un fichero `.env.local` en la raíz con:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## Scripts

| Script                 | Qué hace                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm start`            | Servidor de desarrollo con recarga en caliente.                                                      |
| `npm run build`        | Comprueba tipos y genera la build de producción en `dist/`.                                          |
| `npm run preview`      | Sirve en local la build de producción.                                                               |
| `npm test`             | Ejecuta los tests una vez.                                                                           |
| `npm run test:watch`   | Ejecuta los tests en modo watch: se relanzan al guardar.                                             |
| `npm run lint`         | Analiza el código con ESLint (reglas de TypeScript con tipos y de React). Falla con cualquier aviso. |
| `npm run format`       | Formatea todo el código con Prettier.                                                                |
| `npm run format:check` | Comprueba el formato sin modificar nada.                                                             |

## Stack

- **React 19** como librería de interfaz.
- **TypeScript** en modo estricto. El enunciado permite JavaScript ES6; se usa TypeScript para detectar errores en tiempo de compilación y documentar los contratos con el API.
- **Vite** como servidor de desarrollo y empaquetador para producción.
- **React Router 8** en modo datos (`createBrowserRouter`). La navegación ocurre en el cliente y cada ruta carga sus datos con un `loader` antes de mostrarse.
- **CSS nativo**, sin frameworks de estilos. Los tokens de diseño (color, tipografía, espaciado) son variables CSS en `src/styles/tokens.css`, y cada componente tiene su CSS Module.
- **Zod** para validar las respuestas del API en tiempo de ejecución. El enunciado solo documenta el `id`; el resto del contrato se dedujo de las respuestas reales y se describe en un esquema que se comprueba en cada respuesta. Solo son obligatorios el id, la marca y el modelo: un dato con un formato inesperado se muestra como no disponible en lugar de romper la página.
- **React Compiler**, que memoiza componentes y valores al compilar. Por eso el código no lleva `useMemo`, `useCallback` ni `memo` escritos a mano.
- **ESLint** con typescript-eslint (reglas estrictas con información de tipos) y los plugins oficiales de React Hooks y React Refresh.
- **Prettier** para el formato del código. ESLint se encarga de detectar errores y Prettier del estilo; `eslint-config-prettier` evita que se pisen.
- **Vitest** y **Testing Library** para los tests, sobre jsdom. Los tests comprueban lo que ve y hace el usuario, no los detalles internos de los componentes.

## Decisiones técnicas

Las decisiones relevantes se documentan como ADR (Architecture Decision Record) en [`docs/adr`](docs/adr):

- [ADR-0001](docs/adr/0001-vite-react-typescript.md): Vite, React y TypeScript como base del proyecto.
- [ADR-0002](docs/adr/0002-cache-de-respuestas-del-api.md): caché de las respuestas del API en `localStorage`, con 1 hora de vigencia.
- [ADR-0003](docs/adr/0003-carga-de-datos-con-loaders.md): carga de datos con los loaders de React Router.

## Hitos

El proyecto se construye de forma incremental, con un commit por cambio siguiendo [Conventional Commits](https://www.conventionalcommits.org/).

- [x] 1. Proyecto base y herramientas: lint, formato y tests.
- [x] 2. Capa de datos: modelos, cliente del API y caché con expiración de 1 hora.
- [x] 3. Layout: cabecera con logo y breadcrumbs; enrutado.
- [x] 4. Listado de productos y buscador en tiempo real.
- [x] 5. Detalle de producto: imagen y descripción.
- [x] 6. Acciones: selectores de almacenamiento y color, añadir a la cesta y contador persistido.
- [x] 7. Pulido: responsive, estados de carga y error, accesibilidad.

## Requisitos del enunciado

Cada requisito del PDF, dónde se cumple (las rutas son relativas a `src`) y cómo se comprueba. Los requisitos visuales se revisaron en el navegador.

| Req. | Qué pide el enunciado                                         | Dónde                                                         | Cómo se comprueba                                                                            |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| R01  | Solo dos vistas: listado (PLP) y detalle (PDP)                | `app/routes.ts`                                               | `routes.test.tsx`: listado en `/` y detalle en `/product/:id`                                |
| R02  | Diseño libre, respetando la estructura de las capturas        | `Header`, `ProductListPage`, `ProductDetailPage` y sus CSS    | En el navegador, de 320 px a escritorio y con zoom al 200 %                                  |
| R03  | React                                                         | React 19 (`package.json`)                                     | —                                                                                            |
| R04  | JavaScript ES6 (se usa TypeScript)                            | `tsconfig.app.json`, en modo estricto                         | `npm run build` comprueba los tipos                                                          |
| R05  | Se permite boilerplate                                        | Plantilla oficial de Vite, endurecida                         | —                                                                                            |
| R06  | SPA con enrutado en cliente                                   | `createBrowserRouter` en `main.tsx`                           | `routes.test.tsx`                                                                            |
| R07  | Scripts START, BUILD, TEST y LINT                             | `package.json`                                                | Tabla de [scripts](#scripts)                                                                 |
| R08  | Repositorio público con subida evolutiva                      | GitHub: un commit por cambio y etiquetas `hito-1` a `hito-7`  | Historial de commits                                                                         |
| R09  | README con cómo ejecutar y notas                              | Este README                                                   | —                                                                                            |
| R10  | Mostrar todos los productos del API                           | `ProductListPage`                                             | `routes.test.tsx`: «en la raíz carga y muestra el listado de productos»                      |
| R11  | Filtrar según el texto de búsqueda                            | `filterProducts`, `ProductListPage`                           | `filterProducts.test.ts` y el bloque «buscador» de `routes.test.tsx`                         |
| R12  | Al seleccionar un producto, ir a su detalle                   | `ProductCard`                                                 | `routes.test.tsx`: «al pulsar un producto del listado, muestra su detalle»                   |
| R13  | Como mucho 4 productos por fila, según la resolución          | `ProductListPage.module.css`                                  | En el navegador: 1 columna a 320 px, 3 a 640 px y 4 en escritorio                            |
| R14  | Detalle en dos columnas: imagen; descripción y acciones       | `ProductDetailPage.module.css`                                | En el navegador                                                                              |
| R15  | Enlace para volver al listado                                 | `ProductDetailPage`                                           | `routes.test.tsx`: «al volver al listado se conserva la búsqueda»                            |
| R16  | Título o icono como enlace a la vista principal               | `Header`                                                      | `routes.test.tsx`: «el nombre de la tienda enlaza al listado»                                |
| R17  | Breadcrumbs con la página actual y un enlace                  | `Breadcrumbs`                                                 | Bloque «cabecera» de `routes.test.tsx`                                                       |
| R18  | A la derecha, el número de productos de la cesta              | `CartCount`, en `Header`                                      | `routes.test.tsx`: «a la derecha muestra el número de productos de la cesta»                 |
| R19  | Campo de texto libre                                          | `SearchBox`                                                   | Bloque «buscador» de `routes.test.tsx`                                                       |
| R20  | Filtra por marca y modelo                                     | `filterProducts`                                              | `filterProducts.test.ts`                                                                     |
| R21  | Filtrado en tiempo real                                       | `SearchBox`, `ProductListPage`                                | `routes.test.tsx`: «filtra por marca y modelo mientras se escribe…»                          |
| R22  | Cada producto con imagen, marca, modelo y precio              | `ProductCard`                                                 | `ProductCard.test.tsx`                                                                       |
| R23  | Imagen del producto en el detalle                             | `ProductDetailPage`                                           | `routes.test.tsx`: «muestra la foto, el precio y las especificaciones del producto»          |
| R24  | Las especificaciones mínimas del enunciado                    | `productSpecs`, `ProductDetailPage`                           | `productSpecs.test.ts`: «incluye todas las especificaciones que pide el enunciado, en orden» |
| R25  | Selectores de almacenamiento y color                          | `OptionGroup`, `AddToCartForm`                                | `routes.test.tsx`: «muestra los selectores; si solo hay una opción, viene elegida»           |
| R26  | Con una sola opción, el selector se muestra con ella elegida  | `AddToCartForm`                                               | El mismo test                                                                                |
| R27  | Botón «Añadir», tras elegir las opciones                      | `AddToCartForm`, `addToCartAction`                            | `routes.test.tsx`: «al elegir y pulsar Añadir, envía la elección…»                           |
| R28  | El POST envía el id, el color y el almacenamiento             | `addToCartAction`, `cartApi`                                  | `addToCartAction.test.ts`, `cartApi.test.ts`                                                 |
| R29  | El número de la cesta se ve en todas las vistas y se conserva | `cartStore`, `CartCount`                                      | `cartStore.test.ts` y los bloques «cabecera» y «añadir a la cesta» de `routes.test.tsx`      |
| R30  | Base del API y sus tres endpoints                             | `httpClient`, `productApi`, `cartApi`                         | `httpClient.test.ts`, `productApi.test.ts`, `cartApi.test.ts`                                |
| R31  | Guardar en el cliente cada respuesta del API                  | `responseCache`                                               | `responseCache.test.ts`: «sin datos guardados, pide al API y guarda la respuesta»            |
| R32  | Caducidad de 1 hora; después, volver a pedir                  | `responseCache` (`CACHE_TTL_MS`)                              | `responseCache.test.ts`: caducidad y nueva petición                                          |
| R33  | Cualquier almacenamiento, siempre en el cliente               | `localStorage`, con respaldo en memoria (`createSafeStorage`) | `storage.test.ts`                                                                            |

## API

Base: `https://itx-frontend-test.onrender.com`

| Método | Ruta               | Uso                                                                            |
| ------ | ------------------ | ------------------------------------------------------------------------------ |
| GET    | `/api/product`     | Listado de productos                                                           |
| GET    | `/api/product/:id` | Detalle de un producto                                                         |
| POST   | `/api/cart`        | Añadir a la cesta. Body `{ id, colorCode, storageCode }`, responde `{ count }` |

En las pruebas, la primera petición al API tras un rato sin uso tardó más de un minuto en responder.

Las respuestas de los `GET` se guardan en `localStorage` durante 1 hora. Pasado ese tiempo se vuelven a pedir y, si el API falla o responde con datos no válidos, se usa la última respuesta válida guardada, marcada como no actualizada. El `POST` de la cesta nunca se guarda. Los detalles están en el [ADR-0002](docs/adr/0002-cache-de-respuestas-del-api.md).

## Comportamientos y limitaciones conocidas

- En las pruebas realizadas, el API devuelve un error 500 al consultar un producto inexistente. La aplicación muestra un error genérico, porque esa respuesta no permite distinguirlo de un fallo del servicio.
- El contador muestra y guarda el `count` recibido del API. En las pruebas desde el navegador, el servicio devolvió siempre `1`. No se incrementa en el cliente para no inventar un total distinto del recibido.
- El buscador ignora los cambios de URL hechos con `replace`, para que una actualización retrasada no pise lo que se está escribiendo. Hoy solo la escritura usa ese mecanismo; otro cambio de búsqueda hecho por código con `replace` obligaría a revisar esta sincronización.
- El logo y la miga «Móviles» abren el listado sin filtro y recuperan su última posición de desplazamiento. Esa posición es la misma para todas las búsquedas.
- Se han comprobado el uso con teclado y el zoom al 200 %, y los tests automatizados cubren los nombres accesibles, el foco y los anuncios. No se ha validado con lectores de pantalla reales como VoiceOver o NVDA, ni con una herramienta de auditoría como axe.
