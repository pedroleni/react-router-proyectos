# Préstamos de la biblioteca del IES Tierras Altas (punto de partida)

Este proyecto es parte de **[Tech Study Tracker](https://www.techstudytracker.com)**. Es el proyecto avanzado 25 de la ficha de React Router: *«Proyecto avanzado: migrar una app de `react-router-dom` 6 a React Router 8»*.

La app con la que gestiona sus préstamos la biblioteca de un instituto de Soria: el catálogo con su búsqueda, la ficha de cada libro con sus ejemplares, y una zona para el personal (préstamos activos, devoluciones y préstamos nuevos). Está escrita como se escribía en 2024:

- `react-router-dom` 6.26.2 con `<BrowserRouter>` y `<Routes>`;
- React 18.3.1;
- datos pedidos con `useEffect`;
- un componente `RutaProtegida` que envuelve las rutas del personal;
- formularios con `onSubmit` y `fetch`.

Tu trabajo es llevarla a React Router 8.5.0, en modo datos, sin que se ponga en rojo ni uno solo de sus tests. Cada sitio que la lección te pide cambiar lleva un comentario `// TODO (paso N)`.

## Arrancar

Necesitas Node.js 22.12 o superior. Desde el paso 2 necesitarás 22.22 o superior; el `.nvmrc` que añade la lección pide la 24.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 46 tests en verde: 30 de caracterización, 11 de destinoSeguro y 5 de la cookie
npm run typecheck  # TypeScript 7.0.2
npm run build
```

Para entrar en la zona de préstamos: usuario `marta`, contraseña `tierrasaltas`. Es una app de prácticas: la contraseña está en `servidor/datos.ts`, en claro.

La cookie de sesión es `HttpOnly` y `SameSite=Lax`. Si la app se sirve por HTTPS (o con `COOKIE_SEGURA=1`), lleva además `Secure` y se llama `__Host-sesion`.

## La API

No hay un servidor aparte. `servidor/plugin.ts` es un plugin de Vite que sirve la API (`/api/libros`, `/api/prestamos`, `/api/sesion`…) en `npm run dev` y en `npm run preview`, con los datos en memoria: al reiniciar, vuelven a los de partida. Cada respuesta tarda 300 ms, como una red de verdad, para que se vean las peticiones en cascada. Lo cambias con `LATENCIA_API=0 npm run dev`.

## Las dos carpetas que no se tocan

- `pruebas/`: los tests de caracterización. Montan la app con `iniciarApp` (de `src/app.tsx`), igual que `main.tsx`, miran la URL y lo que se ve, y hablan con la misma API en memoria. No saben qué router usa la app ni cómo pide sus datos, y por eso valen igual al principio y al final.
- `servidor/`: la API. `pruebas/servidor/` comprueba su cookie de sesión con un servidor HTTP de Node de verdad.

Si un paso te obliga a cambiar un test de caracterización o algo de `servidor/`, el paso está mal. Lo que sí harás, en el paso 3.2, es añadir un test nuevo en `pruebas/nuevos/` para lo que la app pasa a hacer mejor que en la 6.
