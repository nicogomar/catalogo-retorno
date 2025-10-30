#!/bin/bash

# make-executable.sh - Script para hacer ejecutables todos los scripts bash del proyecto

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Configurando permisos de ejecución   ${NC}"
echo -e "${BLUE}========================================${NC}"

# Función para hacer un script ejecutable
make_executable() {
  local script=$1
  if [ -f "$script" ]; then
    chmod +x "$script"
    echo -e "${GREEN}✅ Hecho ejecutable:${NC} $script"
  else
    echo -e "${RED}❌ No encontrado:${NC} $script"
  fi
}

# Comprobar si estamos en el directorio api
if [[ "$(basename "$(pwd)")" == "api" ]]; then
  BASEDIR="."
else
  # Comprobar si existe el directorio api
  if [ -d "api" ]; then
    BASEDIR="api"
  else
    echo -e "${RED}Error: No se pudo encontrar el directorio 'api'.${NC}"
    echo "Ejecute este script desde el directorio raíz del proyecto o desde el directorio api."
    exit 1
  fi
fi

echo -e "${YELLOW}Haciendo ejecutables los scripts en $BASEDIR...${NC}"

# Lista de scripts que necesitan ser ejecutables
SCRIPTS=(
  "$BASEDIR/deploy-cors.sh"
  "$BASEDIR/push-changes.sh"
  "$BASEDIR/install-deps.sh"
  "$BASEDIR/make-executable.sh"
)

# Hacer cada script ejecutable
for script in "${SCRIPTS[@]}"; do
  make_executable "$script"
done

# Buscar scripts adicionales
echo -e "${YELLOW}Buscando scripts bash adicionales...${NC}"
FOUND_SCRIPTS=$(find "$BASEDIR" -name "*.sh" 2>/dev/null)

for script in $FOUND_SCRIPTS; do
  # Verificar si ya lo procesamos
  if [[ ! " ${SCRIPTS[@]} " =~ " ${script} " ]]; then
    make_executable "$script"
  fi
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ¡Permisos configurados con éxito!    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Ahora puede ejecutar los scripts directamente:${NC}"
echo -e "  ${GREEN}./deploy-cors.sh${NC} [nuevo-dominio] [-r]"
echo -e "  ${GREEN}./push-changes.sh${NC} [mensaje-commit]"
echo ""
