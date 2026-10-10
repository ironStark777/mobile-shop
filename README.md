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
- [ ] 7. Pulido: responsive, estados de carga y error, accesibilidad.

## API

Base: `https://itx-frontend-test.onrender.com`

| Método | Ruta               | Uso                                                                            |
| ------ | ------------------ | ------------------------------------------------------------------------------ |
| GET    | `/api/product`     | Listado de productos                                                           |
| GET    | `/api/product/:id` | Detalle de un producto                                                         |
| POST   | `/api/cart`        | Añadir a la cesta. Body `{ id, colorCode, storageCode }`, responde `{ count }` |

En las pruebas, la primera petición al API tras un rato sin uso tardó más de un minuto en responder.

Las respuestas de los `GET` se guardan en `localStorage` durante 1 hora. Pasado ese tiempo se vuelven a pedir y, si el API falla o responde con datos no válidos, se usa la última respuesta válida guardada, marcada como no actualizada. El `POST` de la cesta nunca se guarda. Los detalles están en el [ADR-0002](docs/adr/0002-cache-de-respuestas-del-api.md).

El contador de la cesta muestra el `count` que devuelve el `POST` y lo guarda en `localStorage`, así que se conserva al recargar. En las pruebas, desde el navegador el API respondió siempre `count: 1`, aunque se añadieran varios productos.
