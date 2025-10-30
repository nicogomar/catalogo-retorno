#!/bin/bash

# deploy-cors.sh - Script simple para desplegar cambios de configuración CORS
# Uso: ./deploy-cors.sh [dominio] [-r]
# Ejemplos:
#  ./deploy-cors.sh https://mi-dominio.vercel.app  # Agrega un nuevo dominio
#  ./deploy-cors.sh -r                           # Reinicia el servidor

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Configuración CORS - Catalogo KDN   ${NC}"
echo -e "${GREEN}========================================${NC}"

# Verificar si se pasó un dominio
NEW_DOMAIN=""
RESTART=false

# Analizar argumentos
for arg in "$@"; do
  if [ "$arg" == "-r" ]; then
    RESTART=true
  elif [[ $arg == http* ]]; then
    NEW_DOMAIN="$arg"
  fi
done

# Verificar que existe el directorio utils
if [ ! -d "src/utils" ]; then
  echo -e "${RED}Error: No se encuentra el directorio 'src/utils'.${NC}"
  echo "Ejecute este script desde el directorio raíz de la API."
  exit 1
fi

# Verificar que existe el archivo de configuración CORS
if [ ! -f "src/utils/cors.ts" ]; then
  echo -e "${RED}Error: No se encuentra el archivo 'src/utils/cors.ts'.${NC}"
  echo "Asegúrese de haber implementado la utilidad CORS primero."
  exit 1
fi

# Agregar un nuevo dominio si se proporciona
if [ -n "$NEW_DOMAIN" ]; then
  echo -e "${YELLOW}Agregando nuevo dominio a la configuración CORS: ${NC}$NEW_DOMAIN"

  # Verificar formato del dominio
  if [[ ! "$NEW_DOMAIN" =~ ^https?:// ]]; then
    echo -e "${RED}Error: El dominio debe comenzar con http:// o https://${NC}"
    exit 1
  fi

  # Verificar si el dominio ya está en la lista estática
  if grep -q "\"$NEW_DOMAIN\"" src/utils/cors.ts; then
    echo -e "${YELLOW}El dominio ya está en la lista de orígenes permitidos.${NC}"
  else
    # Agregar el dominio a la lista estática
    sed -i.bak -E "s|(staticAllowedOrigins = \[)|\1\n  \"$NEW_DOMAIN\",|" src/utils/cors.ts

    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ Dominio agregado exitosamente a la configuración CORS.${NC}"
      # Eliminar el archivo de respaldo
      rm -f src/utils/cors.ts.bak
    else
      echo -e "${RED}Error al agregar el dominio a la configuración.${NC}"
      exit 1
    fi
  fi

  # Crear o actualizar .env si no existe
  if [ ! -f ".env" ]; then
    echo "ALLOWED_ORIGINS=$NEW_DOMAIN" > .env
    echo -e "${GREEN}Archivo .env creado con el nuevo dominio.${NC}"
  else
    if grep -q "ALLOWED_ORIGINS=" .env; then
      # Verificar si el dominio ya está en ALLOWED_ORIGINS
      CURRENT_ORIGINS=$(grep "ALLOWED_ORIGINS=" .env | cut -d '=' -f2)
      if [[ "$CURRENT_ORIGINS" != *"$NEW_DOMAIN"* ]]; then
        # Agregar el dominio a ALLOWED_ORIGINS
        sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=$CURRENT_ORIGINS,$NEW_DOMAIN|" .env
        rm -f .env.bak
        echo -e "${GREEN}Dominio agregado a ALLOWED_ORIGINS en .env${NC}"
      fi
    else
      # Agregar ALLOWED_ORIGINS al .env
      echo "ALLOWED_ORIGINS=$NEW_DOMAIN" >> .env
      echo -e "${GREEN}Variable ALLOWED_ORIGINS agregada a .env${NC}"
    fi
  fi
fi

# Reiniciar el servidor si se solicitó
if [ "$RESTART" = true ]; then
  echo -e "${YELLOW}Reiniciando el servidor...${NC}"

  # Comprobar si pm2 está instalado
  if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo -e "${GREEN}✅ Servidor reiniciado con pm2.${NC}"
  else
    echo -e "${YELLOW}⚠️ pm2 no está instalado.${NC}"
    echo "Reinicie manualmente el servidor para aplicar los cambios."
  fi
fi

echo -e "${GREEN}========================================${NC}"
if [ -n "$NEW_DOMAIN" ]; then
  echo -e "${GREEN}El dominio ${YELLOW}$NEW_DOMAIN${GREEN} ya está configurado.${NC}"
fi
echo -e "${YELLOW}Para que los cambios surtan efecto, asegúrese de:${NC}"
echo -e "  1. Compilar el código TypeScript: ${GREEN}npm run build${NC}"
if [ "$RESTART" != true ]; then
  echo -e "  2. Reiniciar el servidor: ${GREEN}npm start${NC} o ${GREEN}pm2 restart all${NC}"
fi
echo -e "${GREEN}========================================${NC}"
