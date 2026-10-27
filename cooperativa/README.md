> Este proyecto vive en la carpeta `cooperativa/` de un repositorio con varios proyectos: clónalo entero y haz `cd cooperativa` antes de los pasos siguientes.

# La cooperativa de consumo

Proyecto avanzado 24 de la ficha de React Router de [Tech Study Tracker](https://www.techstudytracker.com).

**Esta es la rama `main`**: el punto de partida. Los estilos, los datos, los
componentes y los tests ya están; en cada sitio que tienes que construir hay
un comentario `TODO (paso N)`, con el mismo número que los pasos de la lección.
La rama [`solucion`](../../tree/solucion/cooperativa) tiene el proyecto terminado.

Al empezar, `npm test` da `41 failed | 11 passed | 3 todo`: los 11 que pasan
comprueban la capa de datos, que ya está hecha, el secreto de desarrollo y la
parte de `?volver=` que la versión ingenua ya cubre. Se ponen en verde paso a
paso: 18 tras el paso 1, 22 tras el 2, 26 tras el 3, 33 tras el 4, 37 tras el 5,
39 tras el 6, 49 tras el 7 y 50 tras el 8. En el 9 escribes tú los tres tests
que faltan (53), y con el 10 pasan los 55. `npm run typecheck` marca un error, `params.id` en
`pedido-detalle.tsx`, que desaparece en el paso 8.

Hasta el paso 2, la zona de socios enseña «Algo ha fallado» con
`No value found for context`: nadie ha dejado todavía al socio en el contexto.

La Cooperativa La Huerta del Ebro, de Zaragoza, reparte cada semana cestas de
verdura, fruta, huevos y pan de las huertas de la vega del Ebro. Sus socios
entran en su zona, llenan la cesta y confirman el pedido. Es una app de React
Router 8 en modo framework, en TSX y con renderizado en el servidor, centrada en
usuarios, sesiones y seguridad:

- **Iniciar sesión con una cookie firmada**: `createCookieSessionStorage`, con
  `httpOnly`, `sameSite`, `secure` en producción y los secretos fuera del código.
- **Un middleware de servidor** que protege toda la zona `/socio`, deja al socio
  en un contexto tipado y marca las respuestas como privadas.
- **La cesta en la sesión**, con un fetcher compartido y respuesta optimista.
- **El pedido validado con Zod**: un 400 con los errores, o una redirección con
  un mensaje *flash*. El token de la compra en curso, guardado en el servidor,
  impide que el mismo formulario, enviado dos veces, guarde dos pedidos.
- **Una ruta de recursos** con la hoja de reparto en CSV, solo para la
  coordinación de reparto.
- **La portada y «Cómo funciona», prerenderizadas**, y el catálogo con
  `Cache-Control` público.
- **`?volver=` validado** y `allowedActionOrigins`.
- **Tipos generados y `href()`**: `npm run typecheck` no marca nada.
- **Tests** de `loader`, `action` y middleware llamados como funciones, y de
  componentes con `createRoutesStub`.
- **Desplegarla** con `react-router-serve` y Docker.

## Los pasos

1. Iniciar sesión con una cookie de sesión firmada (`sesiones.server.ts`, `entrar.tsx`, `salir.tsx`).
2. Un middleware que protege la zona y deja al socio en el contexto (`middleware/socio.server.ts`, `zona.tsx`).
3. La cesta en la sesión, con un fetcher y respuesta optimista (`cesta.ts`, `routes/cesta.tsx`).
4. El pedido validado con Zod, y el aviso *flash* (`validacion/pedido.ts`, `pedido.tsx`, `pedidos.tsx`).
5. La hoja de reparto en CSV, una ruta de recursos (`csv.ts`, `reparto-csv.ts`).
6. Prerenderizar las páginas fijas y `Cache-Control` en el catálogo (`react-router.config.ts`, `catalogo.tsx`).
7. `?volver=` validado y `allowedActionOrigins` (`seguridad.ts`, `react-router.config.ts`).
8. Los tipos generados y `href()` (`pedido-detalle.tsx`, `pedidos.tsx`).
9. Tus tests con `createRoutesStub` (`pruebas/componentes.test.tsx`).
10. Desplegar: el secreto desde el entorno y Docker (`config.server.ts`, `Dockerfile`).

## Qué hay dentro

```
app/
  root.tsx                    — el documento, la cabecera pública y el error general (sin datos del socio)
  routes.ts                   — las rutas
  routes/
    inicio.tsx                — /                    prerenderizada
    como-funciona.tsx         — /como-funciona       prerenderizada
    catalogo.tsx              — /catalogo            loader y Cache-Control público
    entrar.tsx                — /entrar              iniciar sesión, con ?volver=
    salir.tsx                 — /salir               cerrar sesión (POST)
    zona.tsx                  — /socio               el middleware que protege la zona y su cabecera
    cesta.tsx                 — /socio               la cesta: su action
    pedido.tsx                — /socio/pedido        confirmar el pedido, validado con Zod
    pedidos.tsx               — /socio/pedidos       tus pedidos y el aviso flash
    pedido-detalle.tsx        — /socio/pedidos/:id   un pedido, solo si es tuyo
    reparto-csv.ts            — /socio/reparto.csv   ruta de recursos: la hoja de reparto
    no-encontrada.tsx         — cualquier otra dirección, con su 404
  componentes/                — ListaCesta, ResumenCesta y FormularioPedido
  datos/                      — catálogo, socios (contraseñas con scrypt) y pedidos (solo en el servidor)
  middleware/socio.server.ts  — exigirSocio
  contexto.server.ts          — socioContext y sesionContext
  sesiones.server.ts          — la cookie de sesión
  config.server.ts            — los secretos de la sesión, de SECRETO_SESION
  cesta.ts                    — la cesta en funciones puras y useCestaOptimista
  validacion/pedido.ts        — el esquema de Zod del pedido
  csv.ts                      — un CSV que Excel abre bien, sin inyección de fórmulas
  seguridad.ts                — destinoSeguro, para ?volver=
pruebas/                      — Vitest y Testing Library
Dockerfile                    — la imagen de la plantilla oficial, sin root
```

## Requisitos

- [Node.js](https://nodejs.org/) **22.22.2 o superior**, o la LTS actual (24).
  React Router 8 pide 22.22 y jsdom, con el que corren los tests, 22.22.2.
- Docker, solo para el último paso.

## Cómo ejecutarlo

```bash
git clone https://github.com/pedroleni/react-router-proyectos.git
cd react-router-proyectos/cooperativa
npm install
npm run dev
```

- `npm run dev`: servidor de desarrollo en `http://localhost:5173`
- `npm test`: los tests (55 al terminar)
- `npm run typecheck`: genera los tipos de las rutas y comprueba los de todo el proyecto
- `npm run build`: construye el servidor y el cliente en `build/`, con las páginas prerenderizadas
- `SECRETO_SESION=… npm start`: arranca ese build, el servidor de producción, en `http://localhost:3000`

Para entrar: `pilar@huertadelebro.example` con la contraseña `borraja2026`
(socia) o `javier@huertadelebro.example` con `cebolla2026` (coordina el reparto
y puede descargar la hoja). Son datos de ejemplo.

### Variables de entorno

- `SECRETO_SESION` (**obligatoria en producción**): el secreto con el que se
  firma la cookie de sesión. Para rotarlo, pon el nuevo delante y el viejo
  detrás, separados por comas. En desarrollo, si no está, se usa uno de pruebas.
- `ARCHIVO_PEDIDOS`: dónde se guardan los pedidos. Por defecto,
  `datos/pedidos.json` (la carpeta `datos/` está en `.gitignore`).

### Con Docker

```bash
docker build -t cooperativa .
docker run -p 3000:3000 -e SECRETO_SESION="$(openssl rand -hex 32)" -v cooperativa-datos:/app/datos cooperativa
```

El volumen guarda los pedidos aunque borres el contenedor.

## De dónde sale

De la plantilla oficial, `npx create-react-router@8.5.0`, con estos cambios: sin
Tailwind ni la fuente de Google (los estilos están en `app/app.css`), con Zod y
Vitest, TypeScript 7.0.2 en vez del 5.9 de la plantilla y un `Dockerfile` que no
corre como root.

## Versiones

React 19.3.1, React Router 8.5.0 (`react-router`, `@react-router/dev`,
`@react-router/node` y `@react-router/serve`), Zod 4.6.7, isbot 5.2.2, Vite
8.3.5, TypeScript 7.0.2, Vitest 5.0.5, Testing Library React 16.3.3, user-event
14.6.8, jest-dom 7.0.1 y jsdom 30.1.3.
