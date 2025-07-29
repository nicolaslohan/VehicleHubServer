# Dockerfile
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o resto dos arquivos de configuração (tsconfig, etc.)
COPY . .

# Expõe a porta que a aplicação vai usar
EXPOSE 3333

# O comando que será executado quando o container iniciar.
# O 'tsx watch' monitora mudanças nos arquivos e reinicia o servidor.
CMD ["npm", "run", "dev"]