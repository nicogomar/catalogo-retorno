#!/bin/bash

# Script para iniciar el proyecto completo (API + Frontend)
# Uso: ./start-dev.sh

echo "🚀 Iniciando Catalogo KDN - Desarrollo"
echo "======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
if ! command_exists node; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js instalado:${NC} $(node --version)"

# Verificar npm
if ! command_exists npm; then
    echo -e "${RED}❌ Error: npm no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm instalado:${NC} $(npm --version)"
echo ""

# Función para instalar dependencias si es necesario
install_if_needed() {
    local dir=$1
    local name=$2

    if [ ! -d "$dir/node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependencias de $name...${NC}"
        cd "$dir"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Error al instalar dependencias de $name${NC}"
            exit 1
        fi
        cd - > /dev/null
        echo -e "${GREEN}✓ Dependencias de $name instaladas${NC}"
        echo ""
    else
        echo -e "${GREEN}✓ Dependencias de $name ya están instaladas${NC}"
    fi
}

# Verificar estructura del proyecto
if [ ! -d "api" ] || [ ! -d "App" ]; then
    echo -e "${RED}❌ Error: Estructura del proyecto incorrecta${NC}"
    echo "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Instalar dependencias de la API
echo -e "${BLUE}═══ API Backend ═══${NC}"
install_if_needed "api" "API"

# Instalar dependencias del Frontend
echo -e "${BLUE}═══ Frontend ═══${NC}"
install_if_needed "App" "Frontend"

# Verificar archivo .env de la API
if [ ! -f "api/.env" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Advertencia: No se encontró api/.env${NC}"
    echo "Por favor configura las variables de entorno antes de continuar."
    echo ""
    read -p "¿Deseas copiar el archivo .env.example? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        if [ -f "api/.env.example" ]; then
            cp api/.env.example api/.env
            echo -e "${GREEN}✓ Archivo .env creado desde .env.example${NC}"
            echo -e "${YELLOW}⚠️  IMPORTANTE: Edita api/.env y agrega tus credenciales de Supabase${NC}"
            echo ""
            read -p "Presiona Enter cuando hayas configurado el archivo .env..."
        else
            echo -e "${RED}❌ No se encontró api/.env.example${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ No se puede continuar sin configurar el .env${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✓ Todo listo para iniciar${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 Iniciando servicios...${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}API Backend:${NC}      http://localhost:3000"
echo -e "${YELLOW}Frontend:${NC}         http://localhost:4200"
echo -e "${YELLOW}API Health Check:${NC} http://localhost:3000/api/health"
echo ""
echo -e "${BLUE}Presiona Ctrl+C para detener ambos servicios${NC}"
echo ""

# Crear un directorio temporal para los logs
LOG_DIR=".logs"
mkdir -p $LOG_DIR

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    kill $API_PID $FRONTEND_PID 2>/dev/null
    wait $API_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Servicios detenidos${NC}"
    exit 0
}

# Capturar señal de interrupción (Ctrl+C)
trap cleanup SIGINT SIGTERM

# Iniciar API en background
echo -e "${BLUE}[API]${NC} Iniciando..."
cd api
npm run dev > "../$LOG_DIR/api.log" 2>&1 &
API_PID=$!
cd - > /dev/null

# Esperar un momento para que la API inicie
sleep 3

# Verificar si la API está corriendo
if ! kill -0 $API_PID 2>/dev/null; then
    echo -e "${RED}❌ Error: La API no pudo iniciar${NC}"
    echo "Revisa el log en $LOG_DIR/api.log para más detalles"
    cat "$LOG_DIR/api.log"
    exit 1
fi

echo -e "${GREEN}✓ API corriendo en http://localhost:3000${NC}"

# Iniciar Frontend en background
echo -e "${BLUE}[Frontend]${NC} Iniciando..."
cd App
npm start > "../$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd - > /dev/null

# Esperar un momento para que el frontend inicie
sleep 5

# Verificar si el frontend está corriendo
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Error: El frontend no pudo iniciar${NC}"
    echo "Revisa el log en $LOG_DIR/frontend.log para más detalles"
    cat "$LOG_DIR/frontend.log"
    kill $API_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓ Frontend corriendo en http://localhost:4200${NC}"
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ¡Todos los servicios están corriendo!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📝 Logs disponibles en:${NC}"
echo "   API:      $LOG_DIR/api.log"
echo "   Frontend: $LOG_DIR/frontend.log"
echo ""
echo -e "${YELLOW}💡 Para ver los logs en tiempo real:${NC}"
echo "   tail -f $LOG_DIR/api.log"
echo "   tail -f $LOG_DIR/frontend.log"
echo ""
echo -e "${BLUE}Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

# Mantener el script corriendo y mostrar información útil
while true; do
    # Verificar que ambos procesos sigan corriendo
    if ! kill -0 $API_PID 2>/dev/null; then
        echo ""
        echo -e "${RED}❌ La API se detuvo inesperadamente${NC}"
        echo "Revisa el log: $LOG_DIR/api.log"
        kill $FRONTEND_PID 2>/dev/null
        exit 1
    fi

    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo ""
        echo -e "${RED}❌ El frontend se detuvo inesperadamente${NC}"
        echo "Revisa el log: $LOG_DIR/frontend.log"
        kill $API_PID 2>/dev/null
        exit 1
    fi

    sleep 5
done
