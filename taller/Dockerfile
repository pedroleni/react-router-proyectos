# L22: cuatro etapas separan las herramientas de build de la imagen que se ejecuta.
# 1. Todas las dependencias, necesarias para construir.
FROM node:24-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

# 2. Solo dependencias de producción, para la imagen final.
FROM node:24-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

# 3. Genera servidor, cliente y páginas prerenderizadas.
FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

# 4. Imagen final, sin fuentes ni herramientas de desarrollo.
FROM node:24-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
# L22: chown permite persistir los dos volúmenes y USER node evita ejecutar como root.
RUN mkdir -p /app/datos /app/subidas && chown -R node:node /app/datos /app/subidas
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
