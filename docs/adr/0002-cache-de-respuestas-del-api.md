# ADR-0002: Caché de las respuestas del API en localStorage con 1 hora de vigencia

- **Estado:** Aceptado
- **Fecha:** 2026-10-08
- **Autor/es:** Alex Muñoz
- **Relacionado:** commits `bb4f75c`, `def7f7f` y `3f308a2`

## Contexto

El enunciado pide guardar en el cliente la información que se pide al API, con una expiración de 1 hora tras la que hay que volver a pedirla, en cualquier almacenamiento del navegador o en memoria. En las pruebas, la primera petición al API tras un rato sin uso tardó 82 s en responder.

## Decisión

Las consultas de listado y detalle de productos (`GET`) pasan por una caché propia en `localStorage`, con la ruta de la petición como clave. Una respuesta vale durante 1 hora desde que se descargó; pasado ese tiempo se pide de nuevo y se espera el resultado. Si la petición falla o la respuesta no cumple el contrato, se devuelve la última respuesta válida guardada, marcada como no actualizada (`isStale`). El `POST` de la cesta nunca pasa por la caché.

## Cómo funciona

1. Cada entrada guarda la respuesta en bruto y la hora en que se descargó (`savedAt`) bajo la clave `mobile-shop:v1:<ruta>`. Si cambia el formato guardado, se sube la versión de la clave.
2. Con `age = now() - savedAt`, una entrada está vigente si `age >= 0 && age < CACHE_TTL_MS`. Una edad negativa (el reloj del equipo ha retrocedido) cuenta como caducada.
3. Al leerla, la entrada pasa por el mapper (`parseProductList` o `parseProductDetail`). Si está corrupta o no lo supera, se trata como inexistente, así que nunca sirve de respaldo.
4. Si hay una entrada vigente y válida, se devuelve sin llamar al API. Si no, se pide al API: una respuesta válida se guarda con la hora actual; un fallo o una respuesta inválida no se guarda.
5. Si la petición falla o la respuesta es inválida, se devuelve la entrada que haya superado el mapper, aunque haya caducado, con `isStale: true`. Si no la hay, se propaga el error.
6. Si `localStorage` no está disponible o está lleno, `createSafeStorage` guarda en memoria.

Los servicios devuelven `{ data, isStale }`: la interfaz recibe los datos y su estado de actualización, sin conocer el almacenamiento ni la política de caché.

## Alternativas consideradas

- **Stale-while-revalidate:** también revalida al caducar, pero muestra al momento el dato caducado y lo sustituye cuando llega el nuevo. Actualizar la pantalla después de devolver el resultado exige un mecanismo de notificación o suscripción. Aquí se espera al resultado y el dato caducado solo se usa si la actualización falla.
- **Borrar la entrada al caducar:** es más simple, pero se pierde el respaldo justo cuando el API no responde.
- **Caché HTTP del navegador o revalidación con ETag:** la vigencia la deciden las cabeceras del servidor, no el cliente. Revalidar manualmente desde JavaScript con `If-None-Match` exige leer el `ETag`, y el API no lo expone (no lo incluye en `Access-Control-Expose-Headers`).
- **sessionStorage:** sobrevive a una recarga, pero no a cerrar la pestaña. `localStorage` conserva los datos entre sesiones, que es lo que más se nota con un API que puede tardar más de un minuto en responder.
- **Solo memoria:** los datos se pierden al recargar. Queda como respaldo cuando `localStorage` no está disponible.
- **Una librería de datos (TanStack Query, SWR):** resuelve caché y revalidación, pero añade una dependencia y su propio modelo para algo que aquí se resuelve con dos módulos pequeños y sus tests.

## Consecuencias

- **Positivas:** durante una hora, volver a una página ya visitada no espera al API; si el API falla, la app sigue mostrando la última información válida.
- **Negativas / compromisos:** en uso normal los datos tienen como mucho una hora, pero el respaldo puede ser mucho más antiguo: un fallo nunca modifica `savedAt`, así que el dato conserva su antigüedad real y por eso se marca con `isStale`. La primera visita y las revalidaciones pueden sufrir la latencia del API, incluido su arranque en frío. Las entradas no se borran nunca: con un catálogo de 100 productos no se ha previsto una limpieza.
- **Pendiente:** mostrar en la interfaz el aviso de `isStale` y un mensaje de carga cuando el API tarda en responder.
