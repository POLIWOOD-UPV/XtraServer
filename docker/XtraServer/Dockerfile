# syntax=docker/dockerfile:1
FROM node:20-alpine
# Seleccionamos carpeta
WORKDIR /home/app
# Instalamos dependencias
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN ["npm", "install"]
# Exponemos los puertos
# EXPOSE 80 80
# Copiamos el servidor
# COPY . .
# RUN --mount=type=bind,src="./*",dst=/home/app,readonly=false
# Ejecutamos servidor
# CMD ["node", "server.js"]

# docker run -it --rm --name xtraserver \
# --mount type=bind,src="$(pwd)",dst=/home/app,readonly=false \
# -p 80:80 avr24/xtraserver:v1.0 \
# node server.js

# docker stop xtraserver