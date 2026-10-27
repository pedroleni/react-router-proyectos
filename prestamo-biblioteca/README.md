# Préstamos de la biblioteca del IES Tierras Altas (solución)

Este proyecto es parte de **[Tech Study Tracker](https://www.techstudytracker.com)**. Es el proyecto avanzado 25 de la ficha de React Router: *«Proyecto avanzado: migrar una app de `react-router-dom` 6 a React Router 8»*.

La misma app que en la rama `main`, ya migrada:

- React Router 8.5.0 en **modo datos**: `createBrowserRouter` y `RouterProvider`;
- React 19.3.1 y Node.js 22.22 o superior (el `.nvmrc` pide la 24);
- cada ruta, un módulo en `src/rutas/` con su `loader`, su `action` y su `ErrorBoundary`;
- un middleware (`exigirSesion`, en `src/sesion.ts`) en lugar de `RutaProtegida`.

Los 30 tests de caracterización, los 11 de `destinoSeguro` y los 5 de la cookie (`pruebas/servidor/`) son los mismos que al principio, sin tocar una línea, y siguen en verde. En `pruebas/nuevos/` hay uno más, para lo que la app hace ahora mejor que en la 6: si `/api/sesion` falla, lo dice y deja reintentar, en vez de tratarte como anónimo.

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # los 47 tests, en verde
npm run typecheck  # TypeScript 7.0.2
npm run build
```

Para entrar en la zona de préstamos: usuario `marta`, contraseña `tierrasaltas`. Es una app de prácticas: la contraseña está en `servidor/datos.ts`, en claro.

La cookie de sesión es `HttpOnly` y `SameSite=Lax`. Si la app se sirve por HTTPS (o con `COOKIE_SEGURA=1`), lleva además `Secure` y se llama `__Host-sesion`.

La API la sirve un plugin de Vite (`servidor/plugin.ts`) en `npm run dev` y en `npm run preview`, con los datos en memoria y 300 ms de latencia por respuesta (`LATENCIA_API=0 npm run dev` para quitarla).

## Dónde está cada cosa

```text
src/
├── app.tsx            iniciarApp: crea el router y lo monta (main.tsx y los tests)
├── rutas.tsx          el árbol de rutas, como objetos
├── rutas/             un módulo por ruta: loader, action, Component, ErrorBoundary
├── sesion.ts          la sesión compartida (getContext) y el middleware exigirSesion
├── api.ts             pedirJson y enviarJson
└── componentes/Campo.tsx
servidor/              la API en memoria y su plugin de Vite
pruebas/               los tests de caracterización
```

El paso 4 de la lección, opcional, lleva esta misma app al modo framework en SPA Mode. No está en esta rama: la lección lo cuenta paso a paso.
