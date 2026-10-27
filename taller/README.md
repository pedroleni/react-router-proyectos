# Taller: Albergue de peregrinos El Cea

App de prácticas del módulo 4 de la ficha de React Router de [Tech Study Tracker](https://www.techstudytracker.com). Esta carpeta contiene la solución completa de las lecciones 14 a 22.

El Cea es un albergue ficticio de Sahagún, en el Camino Francés. La aplicación publica información del albergue y sus etapas, consulta camas y recibe reservas. La zona privada permite al turno de hospitaleros gestionar llegadas, credenciales y el CSV diario de pernoctas.

## Ejecutar el proyecto

Requiere Node 22.22.2 o posterior. Se ha comprobado con Node 24.

```bash
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm start
```

`npm run leccion -- 18` ejecuta solamente `pruebas/18-*`.

`npm run build` genera además, una vez, «El albergue» y la página de cada etapa (el array
`prerender` de `react-router.config.ts`). La portada no se genera al construir: enseña el aviso del
Ayuntamiento, que puede llegar en cualquier momento. Después, `npm start` sirve el build de producción.

En `inicio/` (la rama `main` del taller), `npm run typecheck` falla hasta terminar la lección 15. Es
deliberado: faltan loaders, contextos y módulos de ruta de los que React Router genera los tipos
`Route.*`; la lección completa esos contratos. En `solucion/`, el mismo comando debe quedar limpio.
Con TypeScript 7.0.2, la progresión da 20 errores al inicio, 1 tras la 14 y 0 tras cada lección de la
15 a la 22. El `tsconfig` no contiene ninguna de las opciones eliminadas en TypeScript 7.

## Cuentas de ejemplo

- `marta` con la contraseña `camino2026`.
- `ignacio` con la contraseña `sahagun2026`.

Son identidades inventadas. También lo son las reservas y todos los datos de peregrinos.

## Variables de entorno

- `SECRETO_SESION`: obligatoria en producción y con 32 caracteres como mínimo por secreto. Firma la
  cookie. Para rotarla, escribe `nuevo,viejo`; el primero firma y ambos validan.
- `AVISOS_TOKEN`: obligatoria en producción y con 32 caracteres como mínimo. Autentica el webhook
  `POST /api/avisos`.
- `URL_PUBLICA`: origen absoluto usado en `sitemap.xml`. Por defecto, `https://albergue-el-cea.es`.
- `ARCHIVO_RESERVAS`, `ARCHIVO_AVISOS` y `DIRECTORIO_SUBIDAS`: opcionales para cambiar las rutas de almacenamiento.

Ninguna variable sensible empieza por `VITE_`: ese prefijo haría que Vite pudiera incluirla en el código enviado al navegador.

## Lecciones y pruebas

La solución ejecuta 98 tests en 10 archivos, todos en verde:

| Lección | Trabajo principal                                                         | Tests |
| ------- | ------------------------------------------------------------------------- | ----: |
| Base    | Datos, fechas y validaciones ya presentes al empezar                      |     5 |
| 14      | Configuración de rutas, documento raíz y 404                              |     5 |
| 15      | Tipos de ruta, `href`, contexto tipado y errores                          |     5 |
| 16      | Módulos `.server`, concurrencia, caché, `/mi-camino` y middleware cliente |     9 |
| 17      | Prerender, caché HTTP y streaming                                         |     3 |
| 18      | Sesiones, redirección provisional, middleware, flash y salida segura      |    26 |
| 19      | CSV, JSON, sitemap, webhook, descarga y subida de credenciales            |    19 |
| 20      | Destinos seguros, metadatos, origen de actions y CSP                      |    13 |
| 21      | Pruebas de componentes, loaders, actions y middleware                     |     4 |
| 22      | Docker, informe de errores, configuración e instrumentación               |     9 |

`npm run leccion -- NN` permite ejecutar el archivo de una sola lección. Cada prueba vive en la
lección donde el alumno escribe el código que comprueba; lo que ya existe al empezar está en
`00-base.test.ts`.

## Persistencia y despliegue

Las reservas y avisos se guardan como JSON mediante escritura atómica. Las credenciales se guardan en `subidas/` con un UUID, nunca con el nombre aportado por el navegador. En Docker, `datos/` y `subidas/` pertenecen al usuario `node`; ambos directorios deben montarse en almacenamiento persistente si se quiere conservar su contenido entre despliegues.

```bash
docker build -t albergue-el-cea .
docker run --rm -p 3000:3000 \
  -e SECRETO_SESION -e AVISOS_TOKEN -e URL_PUBLICA \
  -v "$(pwd)/datos:/app/datos" \
  -v "$(pwd)/subidas:/app/subidas" \
  albergue-el-cea
```

`SECRETO_SESION`, `AVISOS_TOKEN` y `URL_PUBLICA` se toman del entorno desde el que se ejecuta
Docker. Los dos volúmenes conservan reservas, avisos y fotos entre contenedores.

## CSP y páginas prerenderizadas

El test de la lección 20 llama de verdad a `handleRequest` con peticiones `HEAD` para comprobar las
cabeceras y que el nonce cambia. Además verifica en el módulo los dos puntos que reciben el nonce:
`ServerRouter` y `renderToPipeableStream`. No se monta un `EntryContext` completo para renderizar el
HTML porque resulta frágil y depende del manifiesto generado.

Las páginas prerenderizadas son archivos estáticos al servirlas con `react-router-serve`: no pasan
por `handleRequest`, no reciben su CSP y conservan el nonce generado durante el build. En producción,
si esas páginas necesitan CSP, el proxy o CDN debe aplicarla con hashes; una política dinámica basada
en nonce no puede renovarse para un HTML estático.
