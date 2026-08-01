#!/bin/sh

# Se a variável não estiver definida, tenta pegar de outra forma (Swarm às vezes usa minúsculo)
URL=${VITE_API_URL:-$vite_api_url}
SECRET=${VITE_API_SECRET:-$vite_api_secret}

echo "--- Gerando config.js ---"
echo "window.CONFIG = {" > /usr/share/nginx/html/config.js
echo "  VITE_API_URL: \"$URL\"," >> /usr/share/nginx/html/config.js
echo "  VITE_API_SECRET: \"$SECRET\"" >> /usr/share/nginx/html/config.js
echo "};" >> /usr/share/nginx/html/config.js

echo "Configuração gerada em /usr/share/nginx/html/config.js:"
cat /usr/share/nginx/html/config.js

# Inicia o Nginx
exec nginx -g "daemon off;"
