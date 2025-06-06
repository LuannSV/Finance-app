# ---- Estágio 1: Builder (Construtor) ----
# CORREÇÃO: Usar a imagem correta 'node:18-alpine'
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de gerenciamento de pacotes
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm install

# Copia o restante dos arquivos do projeto (código-fonte, schema prisma, etc.)
COPY . .

# MELHORIA: Gera o Prisma Client explicitamente. Garante que ele esteja pronto
# para ser incluído no build final, mesmo em ambientes Docker.
RUN npx prisma generate

# Executa o script de build para compilar TypeScript
RUN npm run build


# ---- Estágio 2: Production (Produção) ----
# Este estágio cria a imagem final e leve
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia apenas o necessário do estágio 'builder'
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Expõe a porta que a aplicação vai escutar
EXPOSE 3001

# Comando padrão para iniciar a aplicação
CMD [ "npm", "start" ]