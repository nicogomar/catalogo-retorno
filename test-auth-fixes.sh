#!/bin/bash

# Script de prueba para verificar las correcciones de autenticación
# Este script proporciona instrucciones y comandos para probar las correcciones

echo "======================================"
echo "  PRUEBAS DE CORRECCIONES DE AUTH"
echo "======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Este script te guiará a través de las pruebas de las correcciones${NC}"
echo ""

# Función para pausar entre pasos
pause() {
    echo ""
    read -p "Presiona Enter para continuar..."
    echo ""
}

echo -e "${YELLOW}PASO 1: Verificar que la aplicación esté corriendo${NC}"
echo "Asegúrate de que tanto el backend como el frontend estén corriendo:"
echo "  - Backend (API): http://localhost:3000"
echo "  - Frontend (App): http://localhost:4200"
echo ""
echo "Si no están corriendo, ejecuta en otra terminal:"
echo "  cd api && npm run dev"
echo "  cd App && npm start"
pause

echo -e "${YELLOW}PASO 2: Prueba de Navegación Estando Autenticado${NC}"
echo "Esta prueba verifica que no haya logout automático al navegar"
echo ""
echo "Pasos manuales:"
echo "  1. Abre http://localhost:4200/login en tu navegador"
echo "  2. Inicia sesión con tus credenciales"
echo "  3. Una vez autenticado, navega a diferentes secciones"
echo "  4. Vuelve a la página principal (/)"
echo "  5. Navega a /administracion (si eres admin)"
echo ""
echo -e "${GREEN}✓ RESULTADO ESPERADO:${NC} No debes ser deslogueado automáticamente"
echo -e "${RED}✗ FALLO SI:${NC} Eres redirigido al login sin querer"
pause

echo -e "${YELLOW}PASO 3: Prueba de Cambio de Estado de Pedido${NC}"
echo "Esta prueba verifica que cambiar el estado no cause logout"
echo ""
echo "Pasos manuales:"
echo "  1. Inicia sesión como administrador"
echo "  2. Ve a la sección de Administración"
echo "  3. Busca un pedido en la lista"
echo "  4. Cambia el estado del pedido usando el dropdown"
echo "  5. Observa la consola del navegador (F12)"
echo ""
echo -e "${GREEN}✓ RESULTADO ESPERADO:${NC} El estado se actualiza correctamente"
echo -e "${RED}✗ FALLO SI:${NC} Aparece error 401 y eres deslogueado"
pause

echo -e "${YELLOW}PASO 4: Prueba de Funcionalidad 'Recordarme'${NC}"
echo "Esta prueba verifica que la opción recordarme funcione"
echo ""
echo "Pasos manuales:"
echo "  1. Ve a http://localhost:4200/login"
echo "  2. Marca el checkbox 'Recordarme'"
echo "  3. Inicia sesión"
echo "  4. Abre la consola del navegador (F12)"
echo "  5. En la pestaña 'Application' o 'Storage', ve a 'Local Storage'"
echo "  6. Busca la clave 'rememberMe'"
echo ""
echo -e "${GREEN}✓ RESULTADO ESPERADO:${NC} Debe aparecer 'rememberMe: true' en localStorage"
echo -e "${RED}✗ FALLO SI:${NC} No aparece o da error en consola"
pause

echo -e "${YELLOW}PASO 5: Verificar que no hay errores en consola${NC}"
echo "Abre la consola del navegador y verifica que no haya errores relacionados con:"
echo "  - 'getAccessToken is not a function'"
echo "  - Loops infinitos de redirección"
echo "  - Errores 401 no manejados"
echo ""
echo -e "${GREEN}✓ RESULTADO ESPERADO:${NC} No deben aparecer estos errores"
pause

echo -e "${YELLOW}PASO 6: Prueba de Logout Manual${NC}"
echo "Esta prueba verifica que el logout funcione correctamente"
echo ""
echo "Pasos manuales:"
echo "  1. Estando autenticado, haz clic en 'Cerrar Sesión'"
echo "  2. Verifica que seas redirigido al login"
echo "  3. Intenta acceder a /administracion directamente"
echo ""
echo -e "${GREEN}✓ RESULTADO ESPERADO:${NC} Debes ser redirigido al login"
echo -e "${RED}✗ FALLO SI:${NC} Puedes acceder a rutas protegidas sin estar logueado"
pause

echo -e "${YELLOW}PASO 7: Prueba de Persistencia de Sesión${NC}"
echo "Esta prueba verifica que la sesión persista en navegación"
echo ""
echo "Pasos manuales:"
echo "  1. Inicia sesión (con o sin 'Recordarme')"
echo "  2. Recarga la página (F5)"
echo "  3. Navega a diferentes secciones"
echo ""
echo -e "${GREEN}✓ RESULTADO ESPERADO:${NC} La sesión se mantiene después de recargar"
echo -e "${RED}✗ FALLO SI:${NC} Tienes que volver a iniciar sesión"
pause

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  PRUEBAS DE API (OPCIONAL)${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

echo -e "${YELLOW}Prueba de API: Verificar endpoint de login${NC}"
echo "Ejecutando prueba de login..."
echo ""

# Intentar hacer login con curl (requiere que el usuario tenga credenciales)
echo "curl -X POST http://localhost:3000/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"admin@example.com\",\"password\":\"password123\"}'"
echo ""
echo "Si tienes credenciales de prueba, copia el comando de arriba y pruébalo"
pause

echo -e "${YELLOW}Prueba de API: Verificar endpoint de sesión${NC}"
echo "Esta prueba verifica que el endpoint de sesión funcione"
echo ""
echo "Primero debes obtener un token válido del paso anterior, luego:"
echo ""
echo "curl -X GET http://localhost:3000/api/auth/session \\"
echo "  -H 'Authorization: Bearer TU_TOKEN_AQUI' \\"
echo "  -H 'Content-Type: application/json'"
pause

echo ""
echo -e "${GREEN}======================================"
echo -e "  RESUMEN DE CORRECCIONES"
echo -e "======================================${NC}"
echo ""
echo "Las siguientes correcciones fueron aplicadas:"
echo ""
echo "1. ✓ Eliminada verificación automática de sesión en startup"
echo "2. ✓ Mejorado manejo de errores 401 en interceptor"
echo "3. ✓ Implementada funcionalidad 'Recordarme'"
echo "4. ✓ Prevenido logout agresivo y loops infinitos"
echo "5. ✓ Mejorado manejo de expiración de tokens"
echo ""
echo -e "${BLUE}Para más detalles, ver: CORRECCIONES_AUTENTICACION.md${NC}"
echo ""

echo -e "${YELLOW}¿Las pruebas funcionaron correctamente? (s/n)${NC}"
read -p "> " response

if [[ "$response" =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${GREEN}¡Excelente! Las correcciones están funcionando correctamente.${NC}"
    echo ""
    echo "Puedes continuar desarrollando con confianza."
    echo "Si encuentras algún problema, revisa los logs en la consola del navegador."
else
    echo ""
    echo -e "${RED}Parece que algo no funcionó como esperado.${NC}"
    echo ""
    echo "Por favor revisa:"
    echo "  1. Que tanto el frontend como el backend estén corriendo"
    echo "  2. Los logs de la consola del navegador (F12 > Console)"
    echo "  3. Los logs del servidor en la terminal"
    echo "  4. El archivo CORRECCIONES_AUTENTICACION.md para más detalles"
    echo ""
    echo "Si el problema persiste, verifica:"
    echo "  - Las credenciales de usuario en la base de datos"
    echo "  - La configuración de CORS en el backend"
    echo "  - Las variables de entorno (.env)"
fi

echo ""
echo -e "${BLUE}Fin de las pruebas.${NC}"
echo ""
