FROM node:20.17.0 as builder
WORKDIR /app

# Copiar y instalar las dependencias
COPY package*.json ./
RUN npm install

# Fase de producción
FROM node:20.17.0 as prod
WORKDIR /app

# Copiar las dependencias de la fase de builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar el código fuente
COPY . .

# Configurar la zona horaria
ENV TZ=America/La_Paz
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Instalar dependencias necesarias si usas Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Descargar Chrome si usas Puppeteer
RUN npx puppeteer browsers install chrome

# Puerto por defecto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "app.js"]


