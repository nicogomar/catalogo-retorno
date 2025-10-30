# Instrucciones de Limpieza de Implementaciones Problemáticas

Este documento proporciona instrucciones detalladas para limpiar las implementaciones de autenticación y CORS que están causando problemas en el despliegue de la API de Catálogo Productos.

## Problema

Las implementaciones de autenticación con Supabase y la configuración CORS avanzada están causando errores durante la compilación y despliegue de la API. Estos errores impiden que la aplicación se despliegue correctamente.

## Solución: Eliminar Código Problemático

### Opción 1: Limpieza Automática (Recomendada)

Hemos creado un script que elimina automáticamente todos los archivos y configuraciones problemáticas.

1. **Ejecutar el script de limpieza**:

   ```bash
   node cleanup.js
   ```

   Este script:
   - Crea respaldos de todos los archivos eliminados
   - Elimina archivos relacionados con autenticación y CORS
   - Restaura las configuraciones en app.ts
   - Limpia las referencias en routes/index.ts

2. **Recompilar el proyecto**:

   ```bash
   npm run build
   ```

3. **Verificar que la compilación sea exitosa** antes de desplegar

### Opción 2: Limpieza Manual

Si prefieres hacer la limpieza manualmente, sigue estos pasos:

1. **Eliminar archivos**:
   - `src/utils/cors.ts` - Utilidad CORS avanzada
   - `src/services/auth.service.ts` - Servicio de autenticación
   - `src/controllers/auth.controller.ts` - Controlador de autenticación
   - `src/routes/auth.routes.ts` - Rutas de autenticación
   - Scripts de soporte: `cors-fix.js`, `fix-build-errors.js`, etc.

2. **Limpiar app.ts**:
   - Eliminar importación: `import cookieParser from 'cookie-parser';`
   - Eliminar importación: `import { createCorsOptions } from './utils/cors';`
   - Eliminar uso: `app.use(cookieParser());`
   - Restaurar configuración CORS:
     ```typescript
     app.use(cors({
       origin: ["http://localhost:4200", "http://localhost:3000", "https://productosdonjoaquin.vercel.app"],
       credentials: true,
       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
       allowedHeaders: ["Content-Type", "Authorization"]
     }));
     ```

3. **Limpiar routes/index.ts**:
   - Eliminar importación: `import authRoutes from './auth.routes';`
   - Eliminar uso: `router.use('/auth', authRoutes);`
   - Eliminar referencia en endpoints (si existe)

## Volver a Implementar Autenticación

Una vez que la aplicación esté desplegada correctamente, puedes volver a implementar la autenticación siguiendo estos consejos:

1. **Implementa de forma gradual**:
   - Primero configura solo el CORS básico
   - Confirma que el despliegue funciona
   - Luego agrega la autenticación paso a paso

2. **Mantén la configuración simple**:
   - Usa configuraciones CORS simples 
   - Maneja los dominios dinámicos de Vercel a través de variables de entorno

3. **Usa enfoque de ramas separadas**:
   - Desarrolla en una rama separada
   - Prueba localmente antes de desplegar

## Configuración CORS Simple pero Efectiva

Puedes usar esta configuración CORS simple que permite dominios dinámicos de Vercel:

```typescript
app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Permitir dominios locales y conocidos
    const allowedOrigins = [
      "http://localhost:4200", 
      "http://localhost:3000", 
      "https://productosdonjoaquin.vercel.app"
    ];
    
    // Permitir automáticamente dominios de Vercel para este proyecto
    if (origin.includes("vercel.app") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error("No permitido por CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

## Recuperación de Respaldos

Si necesitas recuperar algo del código eliminado, los respaldos se guardan en el directorio `backup_before_cleanup` cuando ejecutas el script de limpieza.

## Soporte

Si encuentras problemas después de la limpieza, revisa los logs de compilación y despliegue para identificar cualquier error restante.