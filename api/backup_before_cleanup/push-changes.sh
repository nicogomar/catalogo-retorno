#!/bin/bash

# Script para preparar y hacer push de los cambios relacionados con CORS
# Uso: ./push-changes.sh [mensaje]

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       Push de cambios CORS a Git       ${NC}"
echo -e "${BLUE}========================================${NC}"

# Verificar si Git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git no está instalado. Instálelo primero.${NC}"
    exit 1
fi

# Verificar si estamos en un repositorio Git
if [ ! -d ".git" ] && [ ! -d "../.git" ]; then
    echo -e "${RED}Error: No se encuentra un repositorio Git.${NC}"
    echo "Ejecute este script desde el directorio raíz del proyecto o desde el directorio de la API."
    exit 1
fi

# Navegar al directorio raíz si estamos en el directorio api
if [[ "$(basename "$(pwd)")" == "api" ]]; then
    echo -e "${YELLOW}Navegando al directorio raíz del proyecto...${NC}"
    cd ..
fi

# Mensaje de commit por defecto
DEFAULT_MESSAGE="fix: implementar solución CORS para URLs dinámicas de Vercel"
COMMIT_MESSAGE="${1:-$DEFAULT_MESSAGE}"

echo -e "${YELLOW}Verificando cambios...${NC}"
git status

echo -e "${YELLOW}Archivos modificados para la solución CORS:${NC}"
echo -e "  - api/src/utils/cors.ts"
echo -e "  - api/src/app.ts"
echo -e "  - api/deploy-cors.sh"
echo -e "  - api/CORS_README.md"
echo -e "  - api/push-changes.sh"

# Confirmación del usuario
read -p "¿Desea agregar estos archivos y hacer commit? (s/n) " CONFIRM
if [[ $CONFIRM != [sS] ]]; then
    echo -e "${YELLOW}Operación cancelada por el usuario.${NC}"
    exit 0
fi

# Agregar archivos específicos
echo -e "${BLUE}Agregando archivos al commit...${NC}"
git add api/src/utils/cors.ts api/src/app.ts api/deploy-cors.sh api/CORS_README.md api/push-changes.sh

# Verificar si hay otros cambios que el usuario quiera agregar
read -p "¿Desea agregar todos los demás cambios también? (s/n) " ADD_ALL
if [[ $ADD_ALL == [sS] ]]; then
    git add .
    echo -e "${GREEN}Se agregaron todos los cambios.${NC}"
else
    echo -e "${YELLOW}Solo se agregaron los archivos relacionados con CORS.${NC}"
fi

# Hacer commit
echo -e "${BLUE}Haciendo commit con mensaje:${NC} $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al hacer commit. Verifique el mensaje de error.${NC}"
    exit 1
fi

# Preguntar si se desea hacer push
read -p "¿Desea hacer push de los cambios ahora? (s/n) " PUSH_NOW
if [[ $PUSH_NOW == [sS] ]]; then
    # Preguntar por la rama
    DEFAULT_BRANCH=$(git branch --show-current)
    read -p "¿A qué rama desea hacer push? [$DEFAULT_BRANCH] " BRANCH
    BRANCH=${BRANCH:-$DEFAULT_BRANCH}

    echo -e "${BLUE}Haciendo push a la rama ${BRANCH}...${NC}"
    git push origin $BRANCH

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Push exitoso a ${BRANCH}.${NC}"
    else
        echo -e "${RED}Error al hacer push. Verifique el mensaje de error.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}No se hizo push. Puede hacerlo manualmente cuando esté listo.${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}      ¡Proceso completado con éxito!    ${NC}"
echo -e "${GREEN}========================================${NC}"
