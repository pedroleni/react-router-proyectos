> Este proyecto vive en la carpeta `taller/` de un repositorio con varios proyectos: clónalo entero y haz `cd taller` antes de los pasos siguientes.

# Taller: Albergue de peregrinos El Cea

Proyecto de prácticas de las lecciones 14 a 22 de React Router en [Tech Study Tracker](https://www.techstudytracker.com).

**Esta es la rama `main`**: el punto de partida. La app ya trae los estilos, los datos de Sahagún,
las validaciones públicas y los tests, pero solo está registrada la portada. Lo que falta está marcado
con `TODO (lección N)`. La rama [`solucion`](../../tree/solucion/taller) contiene la implementación
completa, por si te atascas.

## Las lecciones

14. `app/routes.ts`, `app/root.tsx`, `app/routes/no-encontrada.tsx` y
    `react-router.config.ts`: registra las rutas, completa el documento raíz y responde 404.
    La zona de hospitaleros usa una `route()` padre con hijos porque necesita layout; `prefix()`
    sería la alternativa si solo compartiera el segmento de URL.
15. `app/routes/etapa.tsx`, `app/routes/etapas.tsx` y `app/contexto.server.ts`: usa los tipos
    generados, `href`, contextos sin valor por defecto y una frontera de error segura.
16. `app/datos/reservas.server.ts`, `app/mi-camino.ts`, `app/routes/etapa.tsx`,
    `app/routes/mi-camino.tsx`, `app/medir.client.ts` y `app/root.tsx`: separa servidor y navegador,
    serializa la persistencia, añade caché, `localStorage` y middleware cliente.
17. `react-router.config.ts`, `app/routes/camas.tsx` y `app/entry.server.tsx`: configura el
    prerender como array, las cabeceras de caché y el timeout del stream.
18. `app/config.server.ts`, `app/sesiones.server.ts`, `app/contexto.server.ts`,
    `app/middleware/hospitalero.server.ts`, `app/seguridad.ts` (`destinoProvisional`),
    `app/routes/entrar.tsx`, `app/routes/salir.tsx` y `app/routes/hospitaleros/*`: crea la sesión,
    protege toda la zona, valida el destino de vuelta y consume el flash.
19. `app/csv.ts`, `app/config.server.ts`, `app/routes/recursos/*` y las rutas de hospitaleros:
    implementa CSV, JSON, sitemap, webhook y subida de credenciales.
20. `app/seguridad.ts`, `react-router.config.ts`, `app/entry.server.tsx`, `app/routes/entrar.tsx`,
    `app/middleware/hospitalero.server.ts` y el detalle de reserva: endurece redirecciones, origen,
    metadatos y CSP.
21. `pruebas/21-mis-pruebas.test.tsx`: sustituye los cuatro `expect.fail` por pruebas de un
    componente, un loader, una action y un middleware.
22. `Dockerfile`, `.dockerignore`, `app/errores.server.ts`, `app/entry.server.tsx`,
    `app/entry.client.tsx` y `app/config.server.ts`: prepara el contenedor, los errores y la
    instrumentación. **TODO (lección 22):** crea `Dockerfile` y `.dockerignore`; no existen aún.

## Pruebas y tipos al empezar

`npm test` empieza con **5 tests en verde** (`00-base`) y **93 en rojo** (lecciones 14 a 22).
Cada fallo señala el TODO de su lección. El reparto final es:

| Lección | Tests |
| ------- | ----: |
| Base    |     5 |
| 14      |     5 |
| 15      |     5 |
| 16      |     9 |
| 17      |     3 |
| 18      |    26 |
| 19      |    19 |
| 20      |    13 |
| 21      |     4 |
| 22      |     9 |

Con TypeScript 7.0.2, `npm run typecheck` empieza con **20 errores**. Es deliberado: `routes.ts` solo
registra la portada, por lo que React Router todavía no genera los `+types` de las demás rutas ni conoce
sus patrones para `href`; además, `etapa.tsx` conserva el ejercicio de tipos de la lección 15. Estas son
las cifras de la progresión completa:

| Estado           | Inicio |  14 |  15 |  16 |  17 |  18 |  19 |  20 |  21 |  22 |
| ---------------- | -----: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| Errores de tipos |     20 |   1 |   0 |   0 |   0 |   0 |   0 |   0 |   0 |   0 |

El `tsconfig` no contiene ninguna de las opciones eliminadas en TypeScript 7.

`npm run leccion -- 18` ejecuta solamente `pruebas/18-*`.

## Ejecutar el proyecto

Requiere Node 22.22.2 o posterior. Se ha comprobado con Node 24.

```bash
npm ci
npm run dev
npm test
npm run typecheck
```

La portada se sirve desde el principio. `npm run build` termina en los estados de inicio y de las
lecciones 14 a 16. Desde la 17 también construye cliente y servidor, y después inicia el prerender; en
entornos que no permiten abrir el servidor local de Vite se detendrá justo en ese punto.

## Cuentas de ejemplo

- `marta` con la contraseña `camino2026`.
- `ignacio` con la contraseña `sahagun2026`.

Son identidades inventadas. También lo son las reservas y todos los datos de peregrinos.

El Cea y todos sus datos son ficticios. Al terminar, `SECRETO_SESION`, `AVISOS_TOKEN` y
`URL_PUBLICA` se configuran en el servidor; ninguna variable sensible debe empezar por `VITE_`.
