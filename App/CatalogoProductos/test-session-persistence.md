# Script de Prueba: Persistencia de Sesión

Este documento contiene instrucciones paso a paso para probar la persistencia de sesión después de los cambios implementados.

## Pre-requisitos

1. Backend ejecutándose en `http://localhost:3000`
2. Frontend ejecutándose en `http://localhost:4200`
3. Usuario de prueba creado (ej: `nico@nico.com` / `niconico`)

## Prueba 1: Login Básico

### Pasos:
1. Abrir el navegador en `http://localhost:4200`
2. Abrir DevTools (F12) → Console
3. Abrir DevTools → Application → Local Storage → `http://localhost:4200`
4. Verificar que localStorage esté vacío o limpiar manualmente
5. Ir a la página de login
6. Ingresar credenciales válidas
7. Hacer click en "Iniciar Sesión"

### Resultado Esperado:
- ✅ Login exitoso
- ✅ Redirección a la página principal
- ✅ En localStorage deben aparecer:
  - `currentUser`: `{"id":"...","email":"nico@nico.com","role":"user",...}`
  - `accessToken`: `eyJhbGciOiJIUzI1NiI...` (JWT token largo)
  - `tokenExpiry`: `1234567890123` (timestamp en milisegundos)
  - `refreshToken`: `...` (puede ser null)

### Consola debe mostrar:
```
✅ Login exitoso: {id: "...", email: "nico@nico.com", ...}
Autenticación verificada, redirigiendo a: /
```

---

## Prueba 2: Persistencia al Recargar (CASO PRINCIPAL)

### Pasos:
1. Después de hacer login exitoso (Prueba 1)
2. **IMPORTANTE**: Verificar en DevTools → Network que el backend esté corriendo
3. Presionar F5 o Ctrl+R para recargar la página
4. Observar la consola y el estado de la aplicación

### Resultado Esperado:
- ✅ La página se recarga completamente
- ✅ El usuario **permanece autenticado** sin necesidad de volver a hacer login
- ✅ Se muestra el contenido de la aplicación (no la página de login)
- ✅ localStorage mantiene todos los datos:
  - `currentUser`
  - `accessToken`
  - `tokenExpiry`
  - `refreshToken`

### En la pestaña Network:
- ✅ Debe haber una petición GET a `http://localhost:3000/api/auth/session`
- ✅ Status: 200 OK
- ✅ Response debe contener: `{"success":true,"data":{"user":{...},"session":{...}}}`

### Consola NO debe mostrar:
- ❌ "Token inválido, limpiando sesión"
- ❌ "Usuario no autenticado, mostrando formulario de login"
- ❌ Errores 404 en `/api/auth/session`

---

## Prueba 3: Persistencia con Backend Apagado

### Pasos:
1. Con sesión activa, **detener el backend** (Ctrl+C en la terminal del servidor)
2. Recargar la página (F5)
3. Observar el comportamiento

### Resultado Esperado:
- ✅ El usuario **DEBE permanecer autenticado**
- ✅ localStorage mantiene los datos
- ✅ La aplicación funciona en modo offline (con datos cargados previamente)

### Consola puede mostrar:
```
Error al obtener la sesión: HttpErrorResponse {status: 0, ...}
```

### Consola NO debe mostrar:
- ❌ "Token inválido, limpiando sesión"

### Explicación:
El error con status 0 indica problema de red, no token inválido. La sesión debe mantenerse porque el token en localStorage aún es válido.

---

## Prueba 4: Token Inválido (Simulación)

### Pasos:
1. Con sesión activa, abrir DevTools → Application → Local Storage
2. Copiar el valor de `accessToken`
3. Modificar manualmente el token (cambiar algunos caracteres al final)
4. Recargar la página (F5)

### Resultado Esperado:
- ✅ La petición a `/api/auth/session` retorna **401 Unauthorized**
- ✅ La sesión **SE LIMPIA AUTOMÁTICAMENTE**
- ✅ El usuario es redirigido a `/login`
- ✅ localStorage queda vacío

### Consola debe mostrar:
```
⚠️ Token inválido, limpiando sesión
```

---

## Prueba 5: Token Expirado

### Pasos:
1. Con sesión activa, abrir DevTools → Application → Local Storage
2. Modificar `tokenExpiry` a un valor en el pasado (ej: `1000000000000`)
3. Recargar la página (F5)

### Resultado Esperado:
- ✅ El sistema detecta que el token expiró
- ✅ Llama automáticamente a `logout()`
- ✅ Limpia localStorage
- ✅ Redirige a `/login`

---

## Prueba 6: Navegación Entre Páginas

### Pasos:
1. Hacer login
2. Navegar a diferentes páginas de la aplicación
3. Usar el botón "Atrás" del navegador
4. Navegar a rutas protegidas

### Resultado Esperado:
- ✅ El usuario permanece autenticado en todas las páginas
- ✅ No se pierde la sesión al navegar
- ✅ El `AuthGuard` permite acceso a rutas protegidas
- ✅ El `AuthInterceptor` agrega el token a todas las peticiones HTTP

---

## Prueba 7: Logout

### Pasos:
1. Con sesión activa
2. Hacer click en el botón "Cerrar Sesión" o "Logout"
3. Observar el comportamiento

### Resultado Esperado:
- ✅ Petición POST a `http://localhost:3000/api/auth/logout`
- ✅ Cookies del navegador se limpian
- ✅ localStorage se limpia completamente
- ✅ Usuario redirigido a `/login`
- ✅ Intentar acceder a rutas protegidas redirige a login

### Verificar en DevTools → Application:
- ✅ Local Storage: vacío
- ✅ Cookies: `sb-access-token` y `sb-refresh-token` eliminadas

---

## Prueba 8: Múltiples Pestañas

### Pasos:
1. Hacer login en una pestaña
2. Abrir una nueva pestaña del mismo navegador
3. Ir a `http://localhost:4200`

### Resultado Esperado:
- ✅ La nueva pestaña **muestra al usuario autenticado**
- ✅ No solicita login nuevamente
- ✅ Ambas pestañas comparten la misma sesión (mismo localStorage)

### Prueba adicional:
1. Hacer logout en una pestaña
2. Recargar la otra pestaña

### Resultado Esperado:
- ✅ La segunda pestaña también pierde la sesión
- ✅ Redirige a login

---

## Comandos de Diagnóstico en Consola

Abrir la consola del navegador (F12 → Console) y ejecutar:

### Ver datos de autenticación actuales:
```javascript
// Ver usuario actual
localStorage.getItem('currentUser')

// Ver token
localStorage.getItem('accessToken')

// Ver expiración
new Date(parseInt(localStorage.getItem('tokenExpiry'))).toLocaleString()

// Verificar si está autenticado
console.log('Autenticado:', !!localStorage.getItem('accessToken'))
```

### Probar login programáticamente:
```javascript
// Ejecutar desde la consola del navegador
window.testLogin('nico@nico.com', 'niconico')
```

### Ver diagnóstico completo:
```javascript
window.diagnoseAuth()
```

---

## Verificación de Endpoints en Backend

### Probar endpoint de sesión con cURL:

```bash
# 1. Primero hacer login y copiar el token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nico@nico.com","password":"niconico"}' \
  -v

# 2. Copiar el access_token de la respuesta y usarlo aquí:
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -v
```

### Resultado esperado del endpoint /session:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "usuario": "nico@nico.com",
      "correo_electronico": "nico@nico.com",
      "rol": "user",
      "nombre": "Nicolas"
    },
    "session": {
      "access_token": "eyJhbGci...",
      "refresh_token": null,
      "expires_at": 1234567890
    }
  },
  "message": "Sesión válida"
}
```

---

## Checklist de Validación

Antes de considerar la funcionalidad completa, verificar:

- [ ] Login funciona correctamente
- [ ] Al recargar la página, el usuario permanece autenticado
- [ ] localStorage contiene todos los datos necesarios
- [ ] El endpoint `/api/auth/session` retorna 200 OK con sesión válida
- [ ] Token inválido resulta en logout automático (401)
- [ ] Errores de red NO causan logout (status 0)
- [ ] Token expirado resulta en logout automático
- [ ] Logout limpia correctamente localStorage y cookies
- [ ] Múltiples pestañas comparten la misma sesión
- [ ] AuthGuard protege correctamente las rutas
- [ ] AuthInterceptor agrega el token a las peticiones HTTP

---

## Problemas Comunes y Soluciones

### Problema: Aún me pide login al recargar
**Solución:**
1. Verificar que el backend esté ejecutándose
2. Abrir DevTools → Network → verificar petición a `/api/auth/session`
3. Si retorna 404: El backend no tiene el endpoint (verificar que se aplicaron los cambios)
4. Si retorna 401: El token no es válido (verificar fecha de expiración)
5. Si retorna 0: Problema de red o CORS

### Problema: Error 404 en /api/auth/session
**Solución:**
- Asegurarse de reiniciar el backend después de agregar el nuevo endpoint
- Verificar que `auth.routes.ts` incluye: `router.get("/session", ...)`

### Problema: CORS error
**Solución:**
- Verificar configuración de CORS en el backend
- El frontend debe estar en `http://localhost:4200`
- El backend debe permitir ese origen

### Problema: Token se borra al recargar
**Solución:**
- Abrir consola y buscar: "Token inválido, limpiando sesión"
- Si aparece, el backend está rechazando el token
- Verificar que el endpoint `/auth/session` funciona correctamente

---

## Notas Finales

- La sesión persiste en **localStorage**, no en cookies del navegador
- El backend usa cookies HttpOnly para el token, pero el frontend usa localStorage
- La persistencia funciona incluso si el backend está temporalmente caído
- El token expira por defecto en 7 días
- Se puede cerrar el navegador y volver más tarde, la sesión se mantiene (hasta que expire)

---

## Resultado Final Esperado

✅ **ANTES** (Problema): Usuario debe hacer login cada vez que recarga la página
✅ **DESPUÉS** (Solución): Usuario permanece autenticado al recargar, solo pierde la sesión si:
  - Hace logout explícitamente
  - El token expira (7 días)
  - El token es inválido (modificado manualmente)