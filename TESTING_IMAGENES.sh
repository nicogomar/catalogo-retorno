#!/bin/bash

# =============================================================================
# Script de Testing para Funcionalidad de Gestión de Imágenes
# Catálogo KDN - Storage Management
# =============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://localhost:3000/api"
TOKEN="" # Se obtendrá después del login

# =============================================================================
# Funciones de Utilidad
# =============================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
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

# =============================================================================
# Tests
# =============================================================================

test_health_check() {
    print_header "1. Health Check - API"

    response=$(curl -s -w "\n%{http_code}" "${API_URL}/health")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        print_success "API está corriendo"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "API no responde correctamente (HTTP $http_code)"
        exit 1
    fi
}

test_login() {
    print_header "2. Autenticación - Login"

    print_info "Ingresa tus credenciales de administrador:"
    read -p "Email: " email
    read -sp "Password: " password
    echo ""

    response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        TOKEN=$(echo "$body" | jq -r '.token // .data.token // empty')
        if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            print_success "Login exitoso"
            print_info "Token obtenido: ${TOKEN:0:20}..."
        else
            print_error "No se pudo obtener el token"
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
            exit 1
        fi
    else
        print_error "Login fallido (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        exit 1
    fi
}

test_list_images() {
    print_header "3. Listar Imágenes"

    if [ -z "$TOKEN" ]; then
        print_error "No hay token de autenticación"
        return 1
    fi

    response=$(curl -s -w "\n%{http_code}" "${API_URL}/storage/images" \
        -H "Authorization: Bearer $TOKEN")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        count=$(echo "$body" | jq -r '.count // 0')
        print_success "Imágenes listadas correctamente"
        print_info "Total de imágenes: $count"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "Error al listar imágenes (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

test_bucket_stats() {
    print_header "4. Estadísticas del Bucket"

    if [ -z "$TOKEN" ]; then
        print_error "No hay token de autenticación"
        return 1
    fi

    response=$(curl -s -w "\n%{http_code}" "${API_URL}/storage/stats" \
        -H "Authorization: Bearer $TOKEN")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        print_success "Estadísticas obtenidas"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "Error al obtener estadísticas (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

test_upload_image() {
    print_header "5. Subir Imagen"

    if [ -z "$TOKEN" ]; then
        print_error "No hay token de autenticación"
        return 1
    fi

    print_info "Ingresa la ruta de la imagen a subir:"
    read -p "Ruta del archivo: " file_path

    if [ ! -f "$file_path" ]; then
        print_error "El archivo no existe: $file_path"
        return 1
    fi

    # Verificar tipo de archivo
    file_type=$(file --mime-type -b "$file_path")
    if [[ ! "$file_type" =~ ^image/ ]]; then
        print_error "El archivo no es una imagen válida (tipo: $file_type)"
        return 1
    fi

    # Verificar tamaño (5MB = 5242880 bytes)
    file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null)
    if [ "$file_size" -gt 5242880 ]; then
        print_error "El archivo es demasiado grande ($(($file_size / 1024 / 1024))MB). Máximo: 5MB"
        return 1
    fi

    print_info "Subiendo archivo: $(basename "$file_path") ($(($file_size / 1024))KB)"

    response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/storage/upload" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$file_path")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "201" ]; then
        url=$(echo "$body" | jq -r '.data.url // empty')
        print_success "Imagen subida exitosamente"
        print_info "URL: $url"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "Error al subir imagen (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

test_delete_image() {
    print_header "6. Eliminar Imagen"

    if [ -z "$TOKEN" ]; then
        print_error "No hay token de autenticación"
        return 1
    fi

    print_info "Listando imágenes disponibles..."
    response=$(curl -s "${API_URL}/storage/images" \
        -H "Authorization: Bearer $TOKEN")

    echo "$response" | jq -r '.data[] | "\(.name) - \(.path)"' 2>/dev/null

    echo ""
    print_info "Ingresa el path de la imagen a eliminar:"
    read -p "Path: " file_path

    if [ -z "$file_path" ]; then
        print_error "Path vacío"
        return 1
    fi

    print_info "¿Estás seguro de eliminar '$file_path'? (s/n)"
    read -p "> " confirm

    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        print_info "Operación cancelada"
        return 0
    fi

    # URL encode el path
    encoded_path=$(echo "$file_path" | jq -sRr @uri)

    response=$(curl -s -w "\n%{http_code}" -X DELETE "${API_URL}/storage/image/${encoded_path}" \
        -H "Authorization: Bearer $TOKEN")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        print_success "Imagen eliminada exitosamente"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "Error al eliminar imagen (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

test_get_public_url() {
    print_header "7. Obtener URL Pública"

    print_info "Ingresa el path de la imagen:"
    read -p "Path: " file_path

    if [ -z "$file_path" ]; then
        print_error "Path vacío"
        return 1
    fi

    # URL encode el path
    encoded_path=$(echo "$file_path" | jq -sRr @uri)

    response=$(curl -s -w "\n%{http_code}" "${API_URL}/storage/url/${encoded_path}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        url=$(echo "$body" | jq -r '.data.url // empty')
        print_success "URL obtenida"
        print_info "URL: $url"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "Error al obtener URL (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

test_upload_invalid_file() {
    print_header "8. Prueba: Subir Archivo Inválido"

    if [ -z "$TOKEN" ]; then
        print_error "No hay token de autenticación"
        return 1
    fi

    print_info "Esta prueba intenta subir un archivo no válido"

    # Crear un archivo de texto temporal
    temp_file=$(mktemp)
    echo "Este no es un archivo de imagen" > "$temp_file"

    print_info "Intentando subir archivo de texto..."

    response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/storage/upload" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$temp_file")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    rm "$temp_file"

    if [ "$http_code" = "400" ]; then
        print_success "Validación funcionando correctamente (rechazó archivo inválido)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "La validación no funcionó correctamente (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

test_unauthorized_access() {
    print_header "9. Prueba: Acceso Sin Autenticación"

    print_info "Intentando subir imagen sin token..."

    # Crear una imagen de prueba simple
    temp_file=$(mktemp --suffix=.jpg)
    echo "fake image data" > "$temp_file"

    response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/storage/upload" \
        -F "file=@$temp_file")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    rm "$temp_file"

    if [ "$http_code" = "401" ]; then
        print_success "Autenticación funcionando correctamente (rechazó acceso sin token)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "La autenticación no está funcionando correctamente (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

run_all_tests() {
    print_header "INICIANDO SUITE DE TESTS - GESTIÓN DE IMÁGENES"

    test_health_check
    test_login
    test_list_images
    test_bucket_stats
    test_unauthorized_access
    test_upload_invalid_file

    echo ""
    print_info "Tests automáticos completados"
    print_info "Tests interactivos disponibles:"
    echo "  - test_upload_image"
    echo "  - test_delete_image"
    echo "  - test_get_public_url"
}

show_menu() {
    echo ""
    print_header "MENÚ DE TESTING - GESTIÓN DE IMÁGENES"
    echo "1) Health Check"
    echo "2) Login"
    echo "3) Listar imágenes"
    echo "4) Estadísticas del bucket"
    echo "5) Subir imagen"
    echo "6) Eliminar imagen"
    echo "7) Obtener URL pública"
    echo "8) Probar archivo inválido"
    echo "9) Probar acceso no autorizado"
    echo "10) Ejecutar todos los tests automáticos"
    echo "0) Salir"
    echo ""
}

# =============================================================================
# Main
# =============================================================================

# Verificar si jq está instalado
if ! command -v jq &> /dev/null; then
    print_error "jq no está instalado. Instálalo para una mejor experiencia:"
    print_info "  macOS: brew install jq"
    print_info "  Linux: apt-get install jq / yum install jq"
    echo ""
fi

# Si se pasa un argumento, ejecutar ese test
if [ $# -gt 0 ]; then
    case $1 in
        "all")
            run_all_tests
            ;;
        "health")
            test_health_check
            ;;
        "login")
            test_login
            ;;
        "list")
            test_login
            test_list_images
            ;;
        "upload")
            test_login
            test_upload_image
            ;;
        "delete")
            test_login
            test_delete_image
            ;;
        "stats")
            test_login
            test_bucket_stats
            ;;
        *)
            echo "Uso: $0 [all|health|login|list|upload|delete|stats]"
            exit 1
            ;;
    esac
    exit 0
fi

# Modo interactivo
print_header "TESTING DE GESTIÓN DE IMÁGENES - Catálogo KDN"
print_info "API URL: $API_URL"

while true; do
    show_menu
    read -p "Selecciona una opción: " option

    case $option in
        1) test_health_check ;;
        2) test_login ;;
        3)
            if [ -z "$TOKEN" ]; then
                test_login
            fi
            test_list_images
            ;;
        4)
            if [ -z "$TOKEN" ]; then
                test_login
            fi
            test_bucket_stats
            ;;
        5)
            if [ -z "$TOKEN" ]; then
                test_login
            fi
            test_upload_image
            ;;
        6)
            if [ -z "$TOKEN" ]; then
                test_login
            fi
            test_delete_image
            ;;
        7) test_get_public_url ;;
        8)
            if [ -z "$TOKEN" ]; then
                test_login
            fi
            test_upload_invalid_file
            ;;
        9) test_unauthorized_access ;;
        10) run_all_tests ;;
        0)
            print_info "¡Hasta luego!"
            exit 0
            ;;
        *)
            print_error "Opción inválida"
            ;;
    esac

    echo ""
    read -p "Presiona Enter para continuar..."
done
