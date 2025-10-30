# Cambios para Persistencia de Sesión

## Problema
Cada vez que se recargaba la página, el usuario debía volver a hacer login en lugar de recuperar el token de sesión guardado en localStorage.

## Causa del Problema
1. **Endpoint faltante**: El frontend intentaba verificar la sesión llamando a `/auth/session`, pero este endpoint no existía en el backend, causando un error 404.
2. **Manejo de errores agresivo**: Cuando la verificación de sesión fallaba (por cualquier error, incluyendo errores de red), el frontend limpiaba completamente la autenticación del localStorage.
3. **Bug en logout**: El método `logout()` buscaba `access_token` en lugar de `accessToken` en localStorage.

## Solución Implementada

### Backend (API)

#### 1. Nuevo Método en AuthService (`api/src/services/auth.service.ts`)
Se agregó el método `getSessionByToken()` que:
- Valida el token de acceso
- Recupera el usuario desde Supabase Auth
- Obtiene los datos completos del usuario desde la tabla `usuario`
- Retorna la información de sesión en el mismo formato que el login

```typescript
async getSessionByToken(token: string): Promise<ApiResponse<{ user: Usuario; session: any }>>
```

#### 2. Nuevo Endpoint en AuthController (`api/src/controllers/auth.controller.ts`)
Se agregó el método `getSession()` que:
- Extrae el token desde cookies o header Authorization
- Valida el token usando el servicio de autenticación
- Retorna la sesión completa con usuario y token

#### 3. Nueva Ruta (`api/src/routes/auth.routes.ts`)
```typescript
router.get("/session", (req, res) => authController.getSession(req, res));
```

### Frontend (App)

#### 1. Mejora en `loadUserFromStorage()` (`App/src/app/services/auth.service.ts`)
- Ahora solo limpia la autenticación si recibe un error **401 (No Autorizado)**
- Ignora errores de red (status 0) y errores de servidor (5xx)
- Permite que la sesión persista incluso si hay problemas temporales de conectividad

**Antes:**
```typescript
this.getSession().subscribe({
  next: (user) => {},
  error: (error) => {
    this.clearAuthData(); // ❌ Limpiaba en CUALQUIER error
  },
});
```

**Después:**
```typescript
this.getSession().subscribe({
  next: (user) => {
    // Sesión verificada correctamente
  },
  error: (error) => {
    // ✅ Solo limpia si es error 401 (token inválido)
    if (error.status === 401) {
      console.warn("Token inválido, limpiando sesión");
      this.clearAuthData();
    }
  },
});
```

#### 2. Corrección en `getSession()`
- Ya no limpia la autenticación inmediatamente en caso de error
- Normaliza correctamente los datos del usuario
- Propaga el error para que sea manejado por el llamador

#### 3. Corrección del Bug en `logout()`
- Cambiado de `localStorage.getItem("access_token")` a `localStorage.getItem("accessToken")`

## Flujo de Persistencia de Sesión

### Al Iniciar la Aplicación:
1. **AuthService se construye** → llama a `loadUserFromStorage()`
2. **Lee localStorage**:
   - `currentUser` (datos del usuario)
   - `accessToken` (JWT token)
   - `tokenExpiry` (fecha de expiración)
   - `refreshToken` (token de refresco)
3. **Si encuentra datos válidos**:
   - Verifica que el token no haya expirado
   - Establece el usuario en `currentUserSubject`
   - Configura timer de expiración
   - **Opcionalmente** verifica con el backend (no crítico)
4. **Si la verificación falla con 401**: Limpia la sesión (token inválido)
5. **Si la verificación falla con otro error**: Mantiene la sesión (error temporal)

### Al Hacer Login:
1. Usuario ingresa credenciales
2. Backend valida y retorna `{ user, session: { access_token, refresh_token, expires_at } }`
3. Frontend guarda todo en localStorage
4. Establece el usuario como autenticado
5. Redirige a la página solicitada

### Al Recargar la Página:
1. Angular reconstruye la aplicación
2. AuthService se inicializa y lee localStorage
3. Si hay un token válido, el usuario permanece autenticado
4. **AuthGuard** permite acceso a rutas protegidas
5. **AuthInterceptor** agrega el token a todas las peticiones HTTP

## Beneficios

✅ **Persistencia de Sesión**: El usuario permanece autenticado al recargar la página
✅ **Mejor UX**: No es necesario volver a hacer login constantemente
✅ **Resistente a Errores Temporales**: Problemas de red no cierran la sesión
✅ **Seguridad Mantenida**: Tokens expirados o inválidos aún resultan en logout
✅ **Consistencia**: El endpoint `/auth/session` sigue el mismo formato que `/auth/login`

## Configuración de Tokens

Los tokens se almacenan en localStorage con los siguientes nombres:
- `currentUser`: Objeto JSON con datos del usuario
- `accessToken`: JWT token para autenticación
- `tokenExpiry`: Timestamp de expiración en milisegundos
- `refreshToken`: Token para renovar la sesión (opcional)

## Pruebas Recomendadas

1. **Login normal**: Verificar que funciona correctamente
2. **Recarga de página**: Confirmar que el usuario permanece autenticado
3. **Token expirado**: Verificar que se cierra sesión automáticamente
4. **Error de red durante verificación**: Confirmar que mantiene la sesión
5. **Logout**: Verificar que limpia correctamente localStorage y cookies

## Notas Técnicas

- El backend usa cookies HttpOnly para mayor seguridad (`sb-access-token`, `sb-refresh-token`)
- El frontend usa localStorage para persistencia entre sesiones
- El token expira por defecto en 7 días (604800 segundos)
- El timer de expiración se reinicia al recargar la página