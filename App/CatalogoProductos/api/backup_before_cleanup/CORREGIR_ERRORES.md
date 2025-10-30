# Corrección de Errores de Compilación en la API de Catálogo Productos

Este documento proporciona instrucciones detalladas para corregir los errores de compilación que aparecieron después de añadir los archivos de autenticación y configuración CORS.

## Errores detectados

```
src/app.ts(5,26): error TS2307: Cannot find module 'cookie-parser' or its corresponding type declarations.
src/controllers/auth.controller.ts(117,20): error TS6133: 'req' is declared but its value is never read.
src/controllers/auth.controller.ts(130,15): error TS2304: Cannot find name 'supabase'.
src/controllers/auth.controller.ts(152,14): error TS18048: 'data.session.expires_at' is possibly 'undefined'.
src/services/auth.service.ts(2,1): error TS6133: 'User' is declared but its value is never read.
```

## Solución automática (Recomendada)

Hemos preparado un script que corrige automáticamente todos estos errores:

1. **Ejecuta el script de corrección**:
   ```bash
   node fix-build-errors.js
   ```

2. **Vuelve a ejecutar el build**:
   ```bash
   npm run build
   ```

## Correcciones manuales (Alternativa)

Si prefieres corregir los errores manualmente, sigue estos pasos:

### 1. Instalar cookie-parser y sus tipos

```bash
npm install cookie-parser @types/cookie-parser --save
```

### 2. Corregir `auth.controller.ts`

1. **Error: 'req' is declared but its value is never read (línea 117)**

   Cambia:
   ```typescript
   async logout(req: Request, res: Response) {
   ```

   Por:
   ```typescript
   async logout(_req: Request, res: Response) {
   ```

2. **Error: Cannot find name 'supabase' (línea 130)**

   Cambia:
   ```typescript
   const { data: userData, error: userError } = await supabase.auth.getUser();
   ```

   Por:
   ```typescript
   const { data: userData, error: userError } = await authService.getUser();
   ```

3. **Error: 'data.session.expires_at' is possibly 'undefined' (línea 152)**

   Cambia:
   ```typescript
   Date.now() + (data.session.expires_at - Math.floor(Date.now() / 1000)) * 1000,
   ```

   Por:
   ```typescript
   Date.now() + ((data.session.expires_at || Math.floor(Date.now() / 1000) + 3600) - Math.floor(Date.now() / 1000)) * 1000,
   ```

### 3. Corregir `auth.service.ts`

1. **Error: 'User' is declared but its value is never read (línea 2)**

   Cambia:
   ```typescript
   import { supabase } from '../config/database';
   import { User } from '../types';
   ```

   Por:
   ```typescript
   import { supabase } from '../config/database';
   ```

### 4. Verificar `routes/index.ts`

Asegúrate de que contiene la importación y uso de las rutas de autenticación:

```typescript
import authRoutes from "./auth.routes";

// ...

// Mount route modules
router.use("/productos", productoRoutes);
router.use("/pedidos", pedidoRoutes);
router.use("/auth", authRoutes);
```

## Verificación

Después de aplicar todas las correcciones, ejecuta:

```bash
npm run build
```

La compilación debería completarse sin errores.

## Solución de problemas adicionales

Si encuentras otros problemas:

1. **Error con la interfaz User**: 
   Si aparecen errores relacionados con la interfaz `User`, asegúrate de que esté definida en `src/types/index.ts`:

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

2. **Problemas con el middleware cookie-parser**:
   Verifica que está correctamente importado y aplicado en `src/app.ts`:

   ```typescript
   import cookieParser from 'cookie-parser';
   
   // ...
   
   // Después de body parsing middleware
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(cookieParser());
   ```

## Reinicio del servidor

Después de corregir los errores y compilar exitosamente, reinicia el servidor:

```bash
pm2 restart all  # Si usas PM2
# o el comando que uses habitualmente para reiniciar tu servidor
```
