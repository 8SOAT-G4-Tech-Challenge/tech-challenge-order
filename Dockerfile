# Etapa 1: Build da aplicação
FROM node:20 AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos da aplicação
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Compila o código TypeScript para JavaScript
RUN npm run build

# Etapa 2: Executar a aplicação
FROM node:20-alpine AS run

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos necessários da etapa de build
COPY --from=build /app/package.json ./package-lock.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Exposição da porta para API
EXPOSE 3333

# Exposição da porta para o Prisma Studio
EXPOSE 5555

# Comando para iniciar a aplicação e o Prisma Studio
CMD ["sh", "-c", "node dist/adapter/driver/server.js & npx prisma studio"]
