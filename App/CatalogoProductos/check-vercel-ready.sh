#!/bin/bash

# Script de verificación para deployment en Vercel
# Verifica que todo esté configurado correctamente antes de deployar

echo "🔍 Verificando configuración para Vercel..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
SUCCESS=0

# Función para mostrar estado
check_ok() {
    echo -e "${GREEN}✅ $1${NC}"
    ((SUCCESS++))
}

check_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Verificando Backend (API)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar directorio API
if [ ! -d "api" ]; then
    check_error "Directorio 'api' no encontrado"
    exit 1
fi

cd api

# Verificar archivos necesarios
if [ -f "vercel.json" ]; then
    check_ok "vercel.json encontrado"
else
    check_error "vercel.json NO encontrado"
fi

if [ -f "src/vercel-handler.ts" ]; then
    check_ok "vercel-handler.ts encontrado"
else
    check_error "vercel-handler.ts NO encontrado (necesario para Vercel)"
fi

if [ -f "src/app.ts" ]; then
    check_ok "app.ts encontrado"
else
    check_error "app.ts NO encontrado"
fi

if [ -f "package.json" ]; then
    check_ok "package.json encontrado"
else
    check_error "package.json NO encontrado"
fi

# Verificar dependencias
echo ""
echo "📚 Verificando dependencias del backend..."
if [ -f "package.json" ]; then
    if grep -q "@supabase/supabase-js" package.json; then
        check_ok "Supabase client instalado"
    else
        check_error "Supabase client NO encontrado en package.json"
    fi

    if grep -q "express" package.json; then
        check_ok "Express instalado"
    else
        check_error "Express NO encontrado en package.json"
    fi

    if grep -q "cors" package.json; then
        check_ok "CORS instalado"
    else
        check_error "CORS NO encontrado en package.json"
    fi
fi

# Verificar node_modules
if [ -d "node_modules" ]; then
    check_ok "node_modules presente"
else
    check_warning "node_modules NO encontrado - ejecuta 'npm install'"
fi

# Verificar variables de entorno
echo ""
echo "🔐 Verificando configuración de entorno..."
if [ -f ".env" ]; then
    check_info ".env encontrado (NO se sube a Vercel)"

    if grep -q "SUPABASE_URL" .env; then
        check_ok "SUPABASE_URL definido en .env"
    else
        check_warning "SUPABASE_URL NO encontrado en .env"
    fi

    if grep -q "SUPABASE_KEY" .env; then
        check_ok "SUPABASE_KEY definido en .env"
    else
        check_warning "SUPABASE_KEY NO encontrado en .env"
    fi
else
    check_warning ".env NO encontrado - recuerda configurar variables en Vercel"
fi

# Verificar configuración CORS
echo ""
echo "🌐 Verificando configuración CORS..."
if [ -f "src/app.ts" ]; then
    if grep -q "allowedOrigins" src/app.ts; then
        check_ok "Configuración CORS encontrada"
        check_info "Recuerda agregar tu URL de Vercel frontend a allowedOrigins"
    else
        check_warning "No se encontró configuración CORS"
    fi
fi

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 Verificando Frontend (App)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar directorio App
if [ ! -d "App" ]; then
    check_error "Directorio 'App' no encontrado"
    exit 1
fi

cd App

# Verificar archivos necesarios
if [ -f "vercel.json" ]; then
    check_ok "vercel.json encontrado"
else
    check_error "vercel.json NO encontrado"
fi

if [ -f "angular.json" ]; then
    check_ok "angular.json encontrado"
else
    check_error "angular.json NO encontrado"
fi

if [ -f "package.json" ]; then
    check_ok "package.json encontrado"
else
    check_error "package.json NO encontrado"
fi

# Verificar environments
echo ""
echo "🔧 Verificando archivos de configuración..."
if [ -f "src/environments/environment.ts" ]; then
    check_ok "environment.ts encontrado"
else
    check_error "environment.ts NO encontrado"
fi

if [ -f "src/environments/environment.prod.ts" ]; then
    check_ok "environment.prod.ts encontrado"

    # Verificar URL del API
    API_URL=$(grep -o 'apiUrl:.*' src/environments/environment.prod.ts | head -1)
    if [ ! -z "$API_URL" ]; then
        check_ok "API URL configurado: $API_URL"

        if echo "$API_URL" | grep -q "koyeb.app"; then
            check_info "API apunta a Koyeb (opción híbrida)"
        elif echo "$API_URL" | grep -q "vercel.app"; then
            check_info "API apunta a Vercel"
        elif echo "$API_URL" | grep -q "localhost"; then
            check_warning "API apunta a localhost - actualizar para producción"
        fi
    else
        check_error "API URL NO encontrado en environment.prod.ts"
    fi
else
    check_error "environment.prod.ts NO encontrado"
fi

# Verificar dependencias Angular
echo ""
echo "📚 Verificando dependencias del frontend..."
if [ -f "package.json" ]; then
    if grep -q "@angular/core" package.json; then
        check_ok "Angular instalado"
    else
        check_error "Angular NO encontrado en package.json"
    fi

    if grep -q "@supabase/supabase-js" package.json; then
        check_ok "Supabase client instalado"
    else
        check_warning "Supabase client NO encontrado (puede no ser necesario)"
    fi
fi

# Verificar node_modules
if [ -d "node_modules" ]; then
    check_ok "node_modules presente"
else
    check_warning "node_modules NO encontrado - ejecuta 'npm install'"
fi

# Verificar build
echo ""
echo "🏗️  Verificando build..."
if [ -d "dist/app/browser" ]; then
    check_ok "Build previo encontrado en dist/app/browser"
else
    check_info "No hay build previo - Vercel lo hará automáticamente"
fi

cd ..

# Verificar Git
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Verificando Git"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d ".git" ]; then
    check_ok "Repositorio Git inicializado"

    # Verificar .gitignore
    if [ -f ".gitignore" ]; then
        check_ok ".gitignore encontrado"

        if grep -q "node_modules" .gitignore; then
            check_ok "node_modules ignorado"
        else
            check_warning "node_modules NO está en .gitignore"
        fi

        if grep -q ".env" .gitignore; then
            check_ok ".env ignorado"
        else
            check_error ".env NO está en .gitignore - ¡PELIGRO DE SEGURIDAD!"
        fi
    else
        check_warning ".gitignore NO encontrado"
    fi

    # Verificar estado de Git
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        check_ok "No hay cambios sin commitear"
    else
        check_warning "Hay cambios sin commitear"
        check_info "Ejecuta: git add . && git commit -m 'Ready for Vercel'"
    fi
else
    check_warning "No es un repositorio Git"
    check_info "Vercel funciona mejor con Git/GitHub"
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Exitosos: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
echo -e "${RED}❌ Errores: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 ¡Todo listo para deployment en Vercel!${NC}"
        echo ""
        echo "Próximos pasos:"
        echo "1. cd api && vercel --prod"
        echo "2. cd App && vercel --prod"
        echo "3. Actualizar URLs cruzadas si es necesario"
    else
        echo -e "${YELLOW}⚠️  Hay advertencias pero puedes proceder${NC}"
        echo ""
        echo "Revisa las advertencias arriba y corrige si es necesario"
    fi
else
    echo -e "${RED}❌ Hay errores críticos - corrígelos antes de deployar${NC}"
    echo ""
    echo "Revisa los errores arriba y ejecuta nuevamente este script"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentación disponible:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "- DEPLOY_DECISION.md     - Guía de decisión rápida"
echo "- VERCEL_DEPLOYMENT.md   - Guía completa de deployment"
echo "- api/VERCEL_SETUP.md    - Setup técnico del backend"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
