#!/bin/bash

# ==============================================================================
# Script de Prueba - Crear y Verificar Pago con MercadoPago
# ==============================================================================
# Este script automatiza el proceso de crear un pago de prueba
# y verificar que todo funcione correctamente.
#
# Uso: ./test-pago.sh
# ==============================================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://localhost:3000"
API_PAGOS="${API_URL}/api/pagos"
API_PEDIDOS="${API_URL}/api/pedidos"

# ==============================================================================
# Funciones auxiliares
# ==============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "Comando '$1' no encontrado. Por favor instálalo primero."
        exit 1
    fi
}

# ==============================================================================
# Verificaciones iniciales
# ==============================================================================

print_header "Verificando requisitos"

# Verificar que curl esté instalado
check_command curl
print_success "curl instalado"

# Verificar que jq esté instalado (opcional pero útil)
if command -v jq &> /dev/null; then
    USE_JQ=true
    print_success "jq instalado (output será más legible)"
else
    USE_JQ=false
    print_info "jq no instalado (el output será JSON crudo)"
    print_info "Instala jq para mejor visualización: brew install jq"
fi

# ==============================================================================
# Verificar que el servidor esté corriendo
# ==============================================================================

print_header "Verificando servidor"

if curl -s "${API_URL}/api/health" > /dev/null 2>&1; then
    print_success "Servidor corriendo en ${API_URL}"
else
    print_error "Servidor no está corriendo en ${API_URL}"
    print_info "Inicia el servidor con: npm run dev"
    exit 1
fi

# ==============================================================================
# Verificar configuración de MercadoPago
# ==============================================================================

print_header "Verificando configuración de MercadoPago"

CONFIG_RESPONSE=$(curl -s "${API_PAGOS}/check-config")

if [ "$USE_JQ" = true ]; then
    echo "$CONFIG_RESPONSE" | jq '.'
    IS_CONFIGURED=$(echo "$CONFIG_RESPONSE" | jq -r '.data.configured')
else
    echo "$CONFIG_RESPONSE"
    IS_CONFIGURED=$(echo "$CONFIG_RESPONSE" | grep -o '"configured":[^,}]*' | cut -d':' -f2)
fi

if [ "$IS_CONFIGURED" = "true" ]; then
    print_success "MercadoPago configurado correctamente"
else
    print_error "MercadoPago NO está configurado"
    print_info "Agrega MERCADOPAGO_ACCESS_TOKEN a tu archivo .env"
    print_info "Ejemplo: MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456..."
    exit 1
fi

# ==============================================================================
# Crear un pedido de prueba
# ==============================================================================

print_header "Creando pedido de prueba"

PEDIDO_DATA='{
  "nombre_comercio": "Tienda Test Script",
  "telefóno": "1234567890",
  "email": "test-script@example.com",
  "localidad": "Buenos Aires",
  "productos": [
    {
      "id": 1,
      "nombre": "Producto Test Script",
      "precio": 100.50,
      "quantity": 2,
      "peso": "1kg",
      "img_url": "https://via.placeholder.com/150"
    }
  ]
}'

PEDIDO_RESPONSE=$(curl -s -X POST "${API_PEDIDOS}" \
  -H "Content-Type: application/json" \
  -d "$PEDIDO_DATA")

if [ "$USE_JQ" = true ]; then
    echo "$PEDIDO_RESPONSE" | jq '.'
    PEDIDO_ID=$(echo "$PEDIDO_RESPONSE" | jq -r '.data.id')
    PEDIDO_SUCCESS=$(echo "$PEDIDO_RESPONSE" | jq -r '.success')
else
    echo "$PEDIDO_RESPONSE"
    PEDIDO_ID=$(echo "$PEDIDO_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    PEDIDO_SUCCESS=$(echo "$PEDIDO_RESPONSE" | grep -o '"success":[^,}]*' | cut -d':' -f2)
fi

if [ "$PEDIDO_SUCCESS" = "true" ] && [ -n "$PEDIDO_ID" ]; then
    print_success "Pedido creado con ID: ${PEDIDO_ID}"
else
    print_error "Error al crear pedido"
    exit 1
fi

# ==============================================================================
# Crear el pago
# ==============================================================================

print_header "Creando pago para pedido ${PEDIDO_ID}"

PAGO_DATA="{
  \"pedido_id\": ${PEDIDO_ID},
  \"items\": [
    {
      \"title\": \"Producto Test Script\",
      \"description\": \"Descripción del producto de prueba\",
      \"quantity\": 2,
      \"unit_price\": 100.50,
      \"currency_id\": \"ARS\",
      \"picture_url\": \"https://via.placeholder.com/150\"
    }
  ],
  \"payer\": {
    \"name\": \"Test\",
    \"surname\": \"Script\",
    \"email\": \"test-script@example.com\",
    \"phone\": {
      \"area_code\": \"11\",
      \"number\": \"12345678\"
    }
  }
}"

PAGO_RESPONSE=$(curl -s -X POST "${API_PAGOS}" \
  -H "Content-Type: application/json" \
  -d "$PAGO_DATA")

if [ "$USE_JQ" = true ]; then
    echo "$PAGO_RESPONSE" | jq '.'
    PAGO_ID=$(echo "$PAGO_RESPONSE" | jq -r '.data.pago_id')
    PREFERENCE_ID=$(echo "$PAGO_RESPONSE" | jq -r '.data.preference_id')
    INIT_POINT=$(echo "$PAGO_RESPONSE" | jq -r '.data.init_point')
    SANDBOX_INIT_POINT=$(echo "$PAGO_RESPONSE" | jq -r '.data.sandbox_init_point')
    PAGO_SUCCESS=$(echo "$PAGO_RESPONSE" | jq -r '.success')
else
    echo "$PAGO_RESPONSE"
    PAGO_ID=$(echo "$PAGO_RESPONSE" | grep -o '"pago_id":[0-9]*' | cut -d':' -f2)
    PREFERENCE_ID=$(echo "$PAGO_RESPONSE" | grep -o '"preference_id":"[^"]*"' | cut -d'"' -f4)
    INIT_POINT=$(echo "$PAGO_RESPONSE" | grep -o '"init_point":"[^"]*"' | cut -d'"' -f4)
    SANDBOX_INIT_POINT=$(echo "$PAGO_RESPONSE" | grep -o '"sandbox_init_point":"[^"]*"' | cut -d'"' -f4)
    PAGO_SUCCESS=$(echo "$PAGO_RESPONSE" | grep -o '"success":[^,}]*' | head -1 | cut -d':' -f2)
fi

if [ "$PAGO_SUCCESS" = "true" ] && [ -n "$PAGO_ID" ]; then
    print_success "Pago creado exitosamente!"
    echo ""
    echo -e "${GREEN}Detalles del pago:${NC}"
    echo -e "  Pago ID: ${PAGO_ID}"
    echo -e "  Preference ID: ${PREFERENCE_ID}"
    echo ""
else
    print_error "Error al crear pago"
    exit 1
fi

# ==============================================================================
# Verificar el pago en la base de datos
# ==============================================================================

print_header "Verificando pago en base de datos"

sleep 1  # Dar tiempo para que se guarde en la BD

VERIFY_RESPONSE=$(curl -s "${API_PAGOS}/${PAGO_ID}")

if [ "$USE_JQ" = true ]; then
    echo "$VERIFY_RESPONSE" | jq '.'
    VERIFY_SUCCESS=$(echo "$VERIFY_RESPONSE" | jq -r '.success')
else
    echo "$VERIFY_RESPONSE"
    VERIFY_SUCCESS=$(echo "$VERIFY_RESPONSE" | grep -o '"success":[^,}]*' | cut -d':' -f2)
fi

if [ "$VERIFY_SUCCESS" = "true" ]; then
    print_success "Pago verificado en base de datos"
else
    print_error "Error al verificar pago"
fi

# ==============================================================================
# Ver estadísticas
# ==============================================================================

print_header "Estadísticas de pagos"

STATS_RESPONSE=$(curl -s "${API_PAGOS}/stats")

if [ "$USE_JQ" = true ]; then
    echo "$STATS_RESPONSE" | jq '.'
else
    echo "$STATS_RESPONSE"
fi

# ==============================================================================
# Mostrar links de pago
# ==============================================================================

print_header "Links de Pago"

echo -e "${GREEN}Para completar el pago, abre uno de estos links:${NC}"
echo ""
echo -e "${YELLOW}Producción:${NC}"
echo -e "${INIT_POINT}"
echo ""
echo -e "${YELLOW}Sandbox (Testing):${NC}"
echo -e "${SANDBOX_INIT_POINT}"
echo ""

print_info "Usa estas tarjetas de prueba en MercadoPago:"
echo ""
echo -e "${GREEN}✓ APROBADO:${NC}"
echo "  Tarjeta: 5031 7557 3453 0604"
echo "  CVV: 123 | Vencimiento: 11/25 | Nombre: APRO"
echo ""
echo -e "${RED}✗ RECHAZADO:${NC}"
echo "  Tarjeta: 4509 9535 6623 3704"
echo "  CVV: 123 | Vencimiento: 11/25 | Nombre: OTHE"
echo ""
echo -e "${YELLOW}⏳ PENDIENTE:${NC}"
echo "  Tarjeta: 5031 4332 1540 6351"
echo "  CVV: 123 | Vencimiento: 11/25 | Nombre: CALL"
echo ""

# ==============================================================================
# Opciones de siguiente paso
# ==============================================================================

print_header "Opciones"

echo "1) Abrir link de pago en navegador (sandbox)"
echo "2) Ver todos los pagos"
echo "3) Ver detalles del pago creado"
echo "4) Eliminar pago de prueba"
echo "5) Salir"
echo ""
read -p "Selecciona una opción (1-5): " OPTION

case $OPTION in
    1)
        print_info "Abriendo link de pago..."
        if command -v open &> /dev/null; then
            open "$SANDBOX_INIT_POINT"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$SANDBOX_INIT_POINT"
        else
            echo "Por favor abre manualmente: $SANDBOX_INIT_POINT"
        fi
        ;;
    2)
        print_header "Todos los pagos"
        ALL_PAGOS=$(curl -s "${API_PAGOS}")
        if [ "$USE_JQ" = true ]; then
            echo "$ALL_PAGOS" | jq '.'
        else
            echo "$ALL_PAGOS"
        fi
        ;;
    3)
        print_header "Detalles del pago ${PAGO_ID}"
        DETAIL_RESPONSE=$(curl -s "${API_PAGOS}/${PAGO_ID}")
        if [ "$USE_JQ" = true ]; then
            echo "$DETAIL_RESPONSE" | jq '.'
        else
            echo "$DETAIL_RESPONSE"
        fi
        ;;
    4)
        print_info "Eliminando pago de prueba..."
        DELETE_RESPONSE=$(curl -s -X DELETE "${API_PAGOS}/${PAGO_ID}")
        if [ "$USE_JQ" = true ]; then
            echo "$DELETE_RESPONSE" | jq '.'
        else
            echo "$DELETE_RESPONSE"
        fi
        print_success "Pago eliminado"

        print_info "Eliminando pedido de prueba..."
        DELETE_PEDIDO=$(curl -s -X DELETE "${API_PEDIDOS}/${PEDIDO_ID}")
        if [ "$USE_JQ" = true ]; then
            echo "$DELETE_PEDIDO" | jq '.'
        else
            echo "$DELETE_PEDIDO"
        fi
        print_success "Pedido eliminado"
        ;;
    5)
        print_info "Saliendo..."
        ;;
    *)
        print_error "Opción inválida"
        ;;
esac

# ==============================================================================
# Resumen final
# ==============================================================================

print_header "Resumen"

echo -e "${GREEN}✓ Test completado exitosamente${NC}"
echo ""
echo "Pedido ID: ${PEDIDO_ID}"
echo "Pago ID: ${PAGO_ID}"
echo "Preference ID: ${PREFERENCE_ID}"
echo ""
echo -e "${YELLOW}Para ver el pago:${NC}"
echo "  curl ${API_PAGOS}/${PAGO_ID}"
echo ""
echo -e "${YELLOW}Para ver estadísticas:${NC}"
echo "  curl ${API_PAGOS}/stats"
echo ""
echo -e "${YELLOW}Para abrir el link de pago:${NC}"
echo "  open \"${SANDBOX_INIT_POINT}\""
echo ""

print_success "¡Listo! Tu integración de MercadoPago está funcionando."
