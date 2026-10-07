# ADR-0001: Vite, React y TypeScript como base del proyecto

- **Estado:** Aceptado
- **Fecha:** 2026-10-07
- **Autor/es:** Alex Muñoz
- **Relacionado:** commit `3c4645e` (`chore: create project with Vite, React and TypeScript`)

## Contexto

El enunciado pide una SPA de compra de móviles con React o Preact, con enrutado en cliente y sin MPA ni SSR, y con scripts para desarrollo, build de producción, tests y lint. Permite JavaScript ES6, librerías adicionales y partir de un boilerplate. Hay que elegir con qué herramienta se arranca, compila y empaqueta la aplicación, y en qué lenguaje se escribe.

## Decisión

El proyecto usa **Vite 8** como servidor de desarrollo y empaquetador, **React 19** como librería de interfaz y **TypeScript 6 en modo estricto**. Se parte de la plantilla oficial `react-ts` de Vite, sin el código de demostración y con un `tsconfig` más estricto.

## Cómo funciona

1. `npm start` ejecuta `vite`: levanta un servidor en `http://localhost:5173` que sirve `index.html` y transforma `src/main.tsx` y sus imports bajo demanda, como módulos ES nativos. `@vitejs/plugin-react` compila JSX y aplica Fast Refresh, que actualiza el componente modificado sin recargar la página ni perder el estado. En este paso **no se comprueban tipos**.
2. `npm run build` ejecuta `tsc -b && vite build`:
   - `tsc -b` comprueba los tipos de los dos proyectos de TypeScript sin generar código: `tsconfig.app.json` (código de `src/`, entorno navegador) y `tsconfig.node.json` (`vite.config.ts`, entorno Node). Si hay errores, la build se detiene.
   - `vite build` empaqueta con Rolldown en `dist/`: minifica, elimina el código no usado y añade un hash al nombre de cada fichero para poder cachearlo.
3. `npm run preview` sirve `dist/` en local para probar la build de producción.

## Configuración relevante

| Elemento | Valor | Motivo |
|---|---|---|
| Node | 24 LTS (`.nvmrc`), mínimo 22.12 (`engines`) | Vitest 5, que se añade después, exige Node 22.12; se fija desde el principio |
| `vite` / `@vitejs/plugin-react` | `^8.3.0` / `^6.1.1` | Versiones actuales |
| `react` / `react-dom` | `^19.3.0` | Versión actual |
| `typescript` | `~6.0.2` | Solo parches: typescript-eslint, que se añade después, admite hasta la 6.0.x |
| `strict` | `true` | Comprobaciones de nulos, `any` implícito, etc. |
| `noUncheckedIndexedAccess` | `true` | `lista[i]` es `T \| undefined`; obliga a contemplar el caso vacío |
| `erasableSyntaxOnly` | `true` | Prohíbe sintaxis que genera código (`enum`, `namespace`); los tipos solo existen al compilar |
| `noEmit` | `true` | `tsc` solo comprueba; el JavaScript lo genera Vite |
| `jsx` | `react-jsx` | Runtime automático: no hace falta importar React en cada fichero |

## Salidas

`npm run build` genera `dist/index.html` y `dist/assets/*.js|css` con hash en el nombre, listos para servirse desde cualquier hosting estático. Al ser una SPA, el servidor debe devolver `index.html` para cualquier ruta.

## Errores y casos límite

| Situación | Comportamiento |
|---|---|
| Error de tipos | `npm start` sigue funcionando (Vite no comprueba tipos); el error se ve en el IDE y `npm run build` falla |
| Node inferior a 22.12 | npm muestra un aviso (`EBADENGINE`) al instalar; con versiones antiguas las herramientas no arrancan |
| Recarga en una ruta interna en producción sin fallback a `index.html` | El servidor responde 404 |

## Alternativas consideradas

- **Create React App:** el equipo de React lo declaró obsoleto en 2025 y ya no se mantiene.
- **Next.js o React Router en modo framework:** están orientados a renderizado en servidor; el enunciado lo excluye y una SPA pura es más simple.
- **Webpack configurado a mano:** da control total, pero exige mucha configuración y su servidor de desarrollo es más lento. No aporta nada a este proyecto.
- **Preact:** más ligero, pero las librerías previstas (React Router, Testing Library, React Compiler) apuntan a React, y la capa de compatibilidad añade fricción. El tamaño del bundle no es una restricción aquí.
- **JavaScript ES6 sin TypeScript:** lo permite el enunciado, pero se pierden los errores en tiempo de compilación, la documentación de los contratos con el API y los refactors seguros desde el IDE.

## Consecuencias

- **Positivas:** arranque instantáneo en desarrollo y recarga en caliente; configuración estándar que cualquier desarrollador de React reconoce; errores de tipos detectados antes de llegar al navegador.
- **Negativas / compromisos:** la build tiene dos pasos (`tsc` y `vite`) porque Vite no comprueba tipos; hay tres `tsconfig` que mantener; TypeScript queda fijado en 6.0.x.
- **Pendiente:** pasar a TypeScript 7 cuando typescript-eslint lo soporte.
