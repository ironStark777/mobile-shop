# Mobile Shop

Mini aplicación (SPA) para comprar dispositivos móviles. Tiene dos vistas: el listado de productos, con buscador en tiempo real, y el detalle de cada producto, desde donde se elige almacenamiento y color y se añade a la cesta.

## Requisitos

- Node.js 24 LTS (mínimo 22.12). Si usas nvm, `nvm use` coge la versión del `.nvmrc`.
- npm 10 o superior.

## Puesta en marcha

```bash
npm install
npm start
```

La aplicación queda disponible en http://localhost:5173.

## Scripts

| Script                 | Qué hace                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm start`            | Servidor de desarrollo con recarga en caliente.                                                      |
| `npm run build`        | Comprueba tipos y genera la build de producción en `dist/`.                                          |
| `npm run preview`      | Sirve en local la build de producción.                                                               |
| `npm run lint`         | Analiza el código con ESLint (reglas de TypeScript con tipos y de React). Falla con cualquier aviso. |
| `npm run format`       | Formatea todo el código con Prettier.                                                                |
| `npm run format:check` | Comprueba el formato sin modificar nada.                                                             |

El script de tests se añade en un commit posterior, junto con su herramienta.

## Stack

- **React 19** como librería de interfaz.
- **TypeScript** en modo estricto. El enunciado permite JavaScript ES6; se usa TypeScript para detectar errores en tiempo de compilación y documentar los contratos con el API.
- **Vite** como servidor de desarrollo y empaquetador para producción.
- **ESLint** con typescript-eslint (reglas estrictas con información de tipos) y los plugins oficiales de React Hooks y React Refresh.
- **Prettier** para el formato del código. ESLint se encarga de detectar errores y Prettier del estilo; `eslint-config-prettier` evita que se pisen.

## Decisiones técnicas

Las decisiones relevantes se documentan como ADR (Architecture Decision Record) en [`docs/adr`](docs/adr):

- [ADR-0001](docs/adr/0001-vite-react-typescript.md): Vite, React y TypeScript como base del proyecto.

## Hitos

El proyecto se construye de forma incremental, con un commit por cambio siguiendo [Conventional Commits](https://www.conventionalcommits.org/).

- [ ] 1. Proyecto base y herramientas: lint, formato y tests.
- [ ] 2. Capa de datos: modelos, cliente del API y caché con expiración de 1 hora.
- [ ] 3. Layout: cabecera con logo, breadcrumbs y contador de la cesta; enrutado.
- [ ] 4. Listado de productos y buscador en tiempo real.
- [ ] 5. Detalle de producto: imagen y descripción.
- [ ] 6. Acciones: selectores de almacenamiento y color, añadir a la cesta y contador persistido.
- [ ] 7. Pulido: responsive, estados de carga y error, accesibilidad.

## API

Base: `https://itx-frontend-test.onrender.com`

| Método | Ruta               | Uso                                                                            |
| ------ | ------------------ | ------------------------------------------------------------------------------ |
| GET    | `/api/product`     | Listado de productos                                                           |
| GET    | `/api/product/:id` | Detalle de un producto                                                         |
| POST   | `/api/cart`        | Añadir a la cesta. Body `{ id, colorCode, storageCode }`, responde `{ count }` |

El API está alojado en un plan gratuito, así que la primera petición tras un rato sin uso puede tardar bastante mientras el servicio arranca.
