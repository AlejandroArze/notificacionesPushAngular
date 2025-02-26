# Etapa de construcción
FROM node:20.17.0 as builder
WORKDIR /code

COPY package.json package-lock.json ./
RUN npm install --force
RUN npm install -g @angular/cli@17

FROM node:20.17.0 as prod
WORKDIR /code

COPY . .
COPY --from=builder /code/node_modules ./node_modules

ENV TZ=America/La_Paz
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 4200

CMD ["npm", "start"]
