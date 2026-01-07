#!/bin/bash
# Script de preparación para deploy en Vercel

echo "🧹 Limpiando proyecto para deploy en Vercel..."

# Eliminar archivos innecesarios para producción
rm -f *.sh
rm -f Procfile
rm -f .DS_Store

# Verificar que solo exista el handler principal
if [ -f "api/index.js" ]; then
    echo "✅ Handler principal encontrado: api/index.js"
else
    echo "❌ No se encuentra el handler principal"
    exit 1
fi

# Verificar .vercelignore
if [ -f ".vercelignore" ]; then
    echo "✅ Archivo .vercelignore configurado"
else
    echo "❌ No se encuentra .vercelignore"
    exit 1
fi

echo "🚀 Proyecto limpio y listo para deploy en Vercel"
