# Proyectos de React Router

Los proyectos de la ficha de React Router de [Tech Study Tracker](https://www.techstudytracker.com).
Cada carpeta es un proyecto independiente, con su propio `package.json` y su README.

| Lecciones | Proyecto | Carpeta |
|---|---|---|
| 14 a 22 | Taller del módulo 4: el albergue de peregrinos El Cea, en Sahagún | [`taller/`](taller/) |
| 24 | La cooperativa de consumo: zona de socios en modo framework | [`cooperativa/`](cooperativa/) |
| 25 | Migrar el préstamo de libros de una biblioteca de instituto de `react-router-dom` 6 a React Router 8 | [`prestamo-biblioteca/`](prestamo-biblioteca/) |

## Ramas

- **`main`**: el punto de partida. Cada proyecto arranca, pero le faltan las piezas que construyes en las lecciones; las marcan los comentarios `TODO`, y los tests de cada lección empiezan en rojo.
- **`solucion`**: los mismos proyectos terminados. Úsala para comparar cuando acabes un paso, no para empezar.

## Cómo empezar

```bash
git clone https://github.com/pedroleni/react-router-proyectos.git
cd react-router-proyectos/<carpeta>
npm ci
npm test
```

Cada README dice qué versión de Node necesita y qué órdenes tiene (`npm run dev`, `npm run typecheck`, `npm run build`…).
