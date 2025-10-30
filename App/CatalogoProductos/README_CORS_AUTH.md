# Solución de Problemas CORS y Autenticación en Catálogo Productos API

Este documento proporciona instrucciones detalladas para resolver los problemas de CORS y autenticación en la API de Catálogo Productos.

## Problemas detectados

1. **Error CORS con dominios de Vercel**:
   - Las URL de previsualización generadas por Vercel (como `https://catalogo-productos-xxxxx.vercel.app`) son bloqueadas por la configuración CORS.
   
2. **Endpoint de autenticación no encontrado**:
   - El endpoint `/api/auth/login` devuelve error 404 cuando se intenta autenticar.

## Solución rápida

Se ha preparado un script para aplicar automáticamente una solución inmediata.

### Instrucciones para aplicación rápida

1. **Copia el archivo `cors-fix.js` al directorio raíz de tu API**

2. **Ejecuta el script**:
   ```bash
   node cors-fix.js
   ```

3. **Sigue las instrucciones en pantalla**:
   - Selecciona "s" para aplicar el parche de CORS
   - Selecciona "s" para crear los endpoints de autenticación

4. **Instala las dependencias necesarias**:
   ```bash
   npm install cookie-parser @types/cookie-parser --save
   ```

5. **Compila y reinicia el servidor**:
   ```bash
   npm run build
   pm2 restart all   # Si usas PM2
   ```

## Implementación completa

Para una solución más robusta y mantenible a largo plazo, se recomienda seguir estos pasos:

### 1. Actualizar estructura de directorios

Crea la carpeta de utilidades si no existe:

```bash
mkdir -p src/utils
```

### 2. Implementar utilidad CORS optimizada

Crea un archivo `src/utils/cors.ts` con el siguiente contenido:

```typescript
import { CorsOptions } from "cors";

/**
 * CORS Configuration Utility
 * Provides flexible CORS configuration for the API
 *
 * Features:
 * - Support for static allowed origins
 * - Dynamic pattern matching for Vercel preview URLs
 * - Environment variable configuration
 * - Detailed logging for debugging
 */

// Define known allowed origins
export const staticAllowedOrigins = [
  "http://localhost:4200",
  "http://localhost:3000",
  "https://productosdonjoaquin.vercel.app",
];

// Dynamic pattern matching for Vercel preview URLs
const vercelPatterns = [
  // Match all catalogo-productos-{hash}.vercel.app URLs
  /^https:\/\/catalogo-productos-[a-z0-9]+\.vercel\.app$/,
  // Match any subdomain of vercel.app with catalogo-productos in the path
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
];

/**
 * Get all allowed origins from environment variables or defaults
 * @returns Array of allowed origins
 */
export function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  // Combine environment origins with static origins, removing duplicates
  return [...new Set([...staticAllowedOrigins, ...envOrigins])];
}

/**
 * Check if origin is allowed by pattern matching
 * @param origin Origin URL to check
 * @returns boolean indicating if the origin is allowed
 */
export function isOriginAllowedByPattern(origin: string): boolean {
  if (!origin) return false;

  // Check against each pattern
  return vercelPatterns.some((pattern) => pattern.test(origin));
}

/**
 * Create CORS options object
 * @returns CORS options for Express
 */
export function createCorsOptions(): CorsOptions {
  const allowedOrigins = getAllowedOrigins();

  // If we're in development mode, be more permissive
  if (process.env.NODE_ENV === "development") {
    console.log("Using development CORS settings - allowing all origins");
    return {
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Log CORS request for debugging
      console.log(`CORS request from origin: ${origin}`);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log(`Origin ${origin} is allowed by CORS (exact match)`);
        return callback(null, true);
      }

      // Check if origin matches any of our patterns
      if (isOriginAllowedByPattern(origin)) {
        console.log(`Origin ${origin} is allowed by CORS (pattern match)`);
        return callback(null, true);
      }

      // Special case for Vercel deployment URLs that might not match our pattern
      if (
        origin &&
        (origin.includes("vercel.app") || origin.includes("netlify.app"))
      ) {
        console.log(
          `Origin ${origin} is allowed by CORS (deployment platform)`,
        );
        return callback(null, true);
      }

      // Otherwise, reject with CORS error
      console.log(`Origin ${origin} is NOT allowed by CORS`);
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
```

### 3. Actualizar app.ts para usar la utilidad CORS

Actualiza `src/app.ts` para utilizar la utilidad CORS:

```typescript
import { createCorsOptions } from "./utils/cors";

// ...

// Aplicar configuración CORS usando la utilidad
app.use(cors(createCorsOptions()));
```

### 4. Implementar endpoints de autenticación

#### 4.1 Crear servicio de autenticación

Crea un archivo `src/services/auth.service.ts`:

```typescript
import { supabase } from "../config/database";
import { User } from "../types";

/**
 * Service for handling authentication operations with Supabase
 */
export class AuthService {
  /**
   * Signs in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns User and session data on success, null on failure
   */
  async signIn(email: string, password: string) {
    try {
      // Using Supabase Auth API to sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }

      // Verify user data is returned
      if (!data || !data.session) {
        throw new Error("No se pudo establecer la sesión");
      }

      // Get user details to confirm authentication worked
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData) {
        throw new Error("Error al validar la sesión");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Signs out the current user
   */
  async signOut() {
    try {
      // Using Supabase Auth API to sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  /**
   * Gets the current user's session
   * @returns Session data if authenticated, null if not
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Get session error:", error);
      throw error;
    }
  }

  /**
   * Gets the current user data
   * @returns User data if authenticated, null if not
   */
  async getUser() {
    try {
      return await supabase.auth.getUser();
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const authService = new AuthService();
```

#### 4.2 Crear controlador de autenticación

Crea un archivo `src/controllers/auth.controller.ts`:

```typescript
import { Request, Response } from "express";
import { authService } from "../services/auth.service";

/**
 * Authentication controller
 * Handles all authentication-related requests
 */
export class AuthController {
  /**
   * Login endpoint handler
   * @param req Express request object
   * @param res Express response object
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email y contraseña son requeridos",
        });
      }

      // Authenticate user with Supabase
      const data = await authService.signIn(email, password);

      if (!data || !data.user || !data.session) {
        return res.status(401).json({
          success: false,
          error: "No se pudo establecer la sesión",
        });
      }

      // Format response to match what the frontend expects
      return res.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role || "user",
          nombre: data.user.user_metadata?.nombre || null,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: Date.now() + data.session.expires_in * 1000,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different error cases
      if (error.message?.includes("Invalid login credentials")) {
        return res.status(401).json({
          success: false,
          error: "Credenciales incorrectas. Intente de nuevo.",
        });
      }

      if (
        error.message?.includes("No se pudo establecer la sesión") ||
        error.message?.includes("Error al validar la sesión")
      ) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Error durante el inicio de sesión. Contacte al administrador.",
      });
    }
  }

  /**
   * Logout endpoint handler
   * @param req Express request object
   * @param res Express response object
   */
  async logout(req: Request, res: Response) {
    try {
      await authService.signOut();

      // Clear auth cookies if they exist
      if (req.cookies["sb-access-token"]) {
        res.clearCookie("sb-access-token", { path: "/" });
      }

      if (req.cookies["sb-refresh-token"]) {
        res.clearCookie("sb-refresh-token", { path: "/" });
      }

      return res.json({
        success: true,
        message: "Sesión cerrada correctamente",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error durante el cierre de sesión",
      });
    }
  }

  /**
   * Get current user session
   * @param req Express request object
   * @param res Express response object
   */
  async getSession(req: Request, res: Response) {
    try {
      const data = await authService.getSession();

      if (!data.session) {
        return res.status(401).json({
          success: false,
          error: "No hay una sesión activa",
        });
      }

      // Get user details to confirm authentication
      const { data: userData, error: userError } =
        await authService.getUser();

      if (userError || !userData.user) {
        return res.status(401).json({
          success: false,
          error: "Sesión inválida o expirada",
        });
      }

      return res.json({
        success: true,
        user: {
          id: data.session.user.id,
          email: data.session.user.email,
          role: data.session.user.user_metadata?.role || "user",
          nombre: data.session.user.user_metadata?.nombre || null,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at:
            Date.now() +
            (data.session.expires_at - Math.floor(Date.now() / 1000)) * 1000,
        },
      });
    } catch (error: any) {
      console.error("Get session error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error al obtener la sesión",
      });
    }
  }
}

// Create singleton instance
export const authController = new AuthController();
```

#### 4.3 Crear rutas de autenticación

Crea un archivo `src/routes/auth.routes.ts`:

```typescript
import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

/**
 * Authentication routes
 * All routes are prefixed with /auth
 */

// Login route
router.post("/login", authController.login);

// Logout route
router.post("/logout", authController.logout);

// Session route - get current user session
router.get("/session", authController.getSession);

export default router;
```

#### 4.4 Actualizar archivo de rutas principal

Actualiza `src/routes/index.ts` para incluir las rutas de autenticación:

```typescript
// Añadir importación
import authRoutes from "./auth.routes";

// ...

// Añadir después de las otras rutas
router.use("/auth", authRoutes);
```

#### 4.5 Actualizar tipos (si es necesario)

Asegúrate de que tengas la interfaz User definida en `src/types/index.ts`:

```typescript
/**
 * User entity - represents an authenticated user
 */
export interface User {
  id: string;
  email: string;
  role?: string;
  nombre?: string | null;
}
```

#### 4.6 Agregar soporte para cookies

Actualiza `src/app.ts` para incluir el middleware de cookie-parser:

```typescript
import cookieParser from "cookie-parser";

// ...

// Después de body parsing middleware
app.use(cookieParser());
```

Asegúrate de instalar la dependencia:

```bash
npm install cookie-parser @types/cookie-parser --save
```

### 5. Script para instalación y actualización

Para facilitar la configuración, puedes usar los siguientes scripts:

#### 5.1 Script de despliegue simple

```bash
#!/bin/bash

# Actualizar CORS y reiniciar servidor
echo "Actualizando configuración CORS y endpoints de autenticación..."

# Crear carpetas si no existen
mkdir -p src/utils
mkdir -p src/services
mkdir -p src/controllers
mkdir -p src/routes

# Copiar archivos (asumiendo que están en un directorio 'update')
cp update/cors.ts src/utils/
cp update/auth.service.ts src/services/
cp update/auth.controller.ts src/controllers/
cp update/auth.routes.ts src/routes/

# Instalar dependencias
npm install cookie-parser @types/cookie-parser --save

# Compilar TypeScript
npm run build

# Reiniciar servidor
pm2 restart all || echo "PM2 no está disponible, reinicia el servidor manualmente"

echo "Actualización completada. Verifica los logs del servidor para confirmar que todo funciona correctamente."
```

## Variables de Entorno

Para configurar dominios adicionales sin modificar el código, puedes establecer la variable de entorno `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://mi-dominio1.com,https://mi-dominio2.com
```

## Verificación de la Solución

Después de implementar estas soluciones, verifica:

1. **CORS**: 
   - Accede a tu aplicación desde diferentes dominios de Vercel
   - Revisa los logs del servidor para confirmar que se están permitiendo correctamente los orígenes

2. **Autenticación**:
   - Intenta iniciar sesión desde tu aplicación
   - Verifica que el endpoint `/api/auth/login` responde con código 200
   - Confirma que el token de acceso se almacena correctamente

## Solución de Problemas

Si encuentras problemas:

1. **CORS sigue fallando**:
   - Revisa los logs del servidor para ver qué origen está intentando conectarse
   - Asegúrate de que el servidor se reinició correctamente después de los cambios

2. **Endpoint de autenticación sigue retornando 404**:
   - Verifica que las rutas de autenticación se han agregado correctamente en `routes/index.ts`
   - Asegúrate de que la ruta completa es `/api/auth/login`

3. **Errores en la autenticación**:
   - Verifica las credenciales de Supabase (URL y claves)
   - Asegúrate de que la tabla de usuarios existe y tiene registros válidos

## Próximos Pasos

Para mejorar aún más tu sistema:

1. **Dominio personalizado**: Considera usar un dominio personalizado para evitar los problemas de CORS con URLs dinámicas

2. **Middleware de autenticación**: Implementa un middleware para proteger rutas que requieren autenticación

3. **Roles y permisos**: Extiende el sistema para manejar diferentes roles de usuario y permisos

4. **Refrescado de tokens**: Implementa un mecanismo para refrescar tokens automáticamente

5. **Tests de integración**: Crea tests para verificar que la autenticación y CORS funcionan correctamente