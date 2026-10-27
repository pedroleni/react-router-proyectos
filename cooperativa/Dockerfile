# La imagen de la plantilla oficial de React Router (npx create-react-router),
# en cuatro etapas, con dos cambios: el servidor no corre como root y la
# carpeta datos/, donde se guardan los pedidos, es suya.

# 1. Todas las dependencias, para construir.
FROM node:24-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

# 2. Solo las de producción, para la imagen final.
FROM node:24-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

# 3. El build: build/server y build/client, con las páginas prerenderizadas.
#    No necesita SECRETO_SESION: el almacén de sesiones se crea con la primera petición.
FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

# 4. La imagen que se despliega: package.json, las dependencias de producción y el build.
FROM node:24-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
# El usuario node, que ya trae la imagen, en vez de root.
RUN mkdir -p /app/datos && chown node:node /app/datos
USER node
EXPOSE 3000
# react-router-serve: NODE_ENV=production y el puerto 3000 (o PORT).
CMD ["npm", "run", "start"]
