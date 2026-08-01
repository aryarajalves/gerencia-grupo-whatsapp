# Estágio 1: Construção (Build)
FROM node:20-slim AS build-stage

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração de pacotes
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código fonte do frontend
COPY . .

# Executa o build da aplicação para produção
RUN npm run build

# Estágio 2: Produção (Servidor Nginx)
FROM nginx:stable-alpine AS production-stage

# Copia os arquivos construídos no estágio anterior para o diretório de serviço do Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copia uma configuração personalizada do Nginx para suportar SPA e redirecionamentos
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o script de entrypoint e dá permissão de execução
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expõe a porta 80
EXPOSE 80

# Usa o script de entrypoint para iniciar
ENTRYPOINT ["/entrypoint.sh"]
