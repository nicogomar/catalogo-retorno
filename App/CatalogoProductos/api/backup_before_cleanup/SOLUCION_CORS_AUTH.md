# Solución Rápida para Problemas de CORS y Endpoint de Autenticación

Este documento proporciona instrucciones para solucionar dos problemas detectados en la API:

1. Error CORS con dominios de Vercel
2. Endpoint de autenticación `/api/auth/login` no encontrado (Error 404)

## Solución Inmediata

Hemos preparado un script que aplica ambas soluciones de forma automática.

### Instrucciones

1. **Copia el archivo `cors-fix.js` al directorio raíz de tu API**

2. **Ejecuta el script**:
   ```bash
   node cors-fix.js
   ```

3. **Sigue las instrucciones en pantalla**:
   - Selecciona "s" cuando te pregunte si deseas aplicar el parche de CORS
   - Selecciona "s" cuando te pregunte si deseas crear los endpoints de autenticación

4. **Instala las dependencias necesarias**:
   ```bash
   npm install cookie-parser @types/cookie-parser --save
   ```

5. **Compila el código TypeScript**:
   ```bash
   npm run build
   ```
   
6. **Reinicia el servidor**:
   Si usas PM2:
   ```bash
   pm2 restart all
   ```
   Si usas otro método, reinicia tu aplicación de la forma habitual.

## ¿Qué hace el script?

### 1. Solución CORS
- Reemplaza la configuración CORS existente con una versión mejorada
- Permite automáticamente todos los dominios de Vercel y localhost
- Mantiene soporte para el dominio principal (productosdonjoaquin.vercel.app)
- Crea un respaldo de tu configuración original

### 2. Endpoints de Autenticación
- Crea los archivos necesarios para la autenticación con Supabase:
  - `src/routes/auth.routes.ts`
  - `src/controllers/auth.controller.ts`
  - `src/services/auth.service.ts`
- Actualiza `src/routes/index.ts` para incluir las rutas de autenticación

## Verificación

Después de aplicar la solución, verifica que:

1. Los dominios de Vercel son aceptados sin errores CORS
2. El endpoint `/api/auth/login` responde correctamente
3. Las peticiones de autenticación funcionan desde el frontend

## Solución Manual

Si prefieres aplicar los cambios manualmente:

### 1. Para CORS:
Edita `src/app.ts` y reemplaza la configuración CORS existente con:

```typescript
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    console.log(`CORS request from origin: ${origin}`);

    // Check if it's a Vercel preview URL for Catalogo Productos
    if (origin.includes('vercel.app') ||
        origin.includes('localhost') ||
        origin === 'https://productosdonjoaquin.vercel.app') {
      console.log(`Origin ${origin} is allowed by CORS (matched by pattern)`);
      return callback(null, true);
    }

    console.log(`Origin ${origin} is NOT allowed by CORS`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

### 2. Para la autenticación:
Crea los archivos necesarios según las instrucciones del script `cors-fix.js`.

## Problemas Comunes

Si encuentras problemas:

1. **Error de compilación TypeScript**: 
   - Verifica que hayas instalado cookie-parser y sus tipos
   
2. **Error 404 persiste**:
   - Verifica que `src/routes/index.ts` incluye correctamente `router.use("/auth", authRoutes);`
   
3. **Errores CORS persisten**:
   - Revisa los logs para ver si la solicitud está siendo rechazada y por qué
   - Asegúrate de que el servidor se haya reiniciado correctamente

## Soporte

Si necesitas ayuda adicional, contacta al equipo de desarrollo.