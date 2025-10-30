# Solución CORS para API de Catálogo Productos

Este documento explica cómo se ha implementado la solución para los problemas de CORS (Cross-Origin Resource Sharing) en la API de Catálogo Productos, especialmente para manejar las URLs de despliegue dinámicas de Vercel.

## Problema

El problema original era que cuando se desplegaba el frontend en Vercel, este generaba URLs dinámicas como:

- `https://catalogo-productos-2g21n7q5g.vercel.app`
- `https://catalogo-productos-m37e0j3h0.vercel.app`

Cada nueva implementación de Vercel generaba una URL diferente, lo que requería actualizar constantemente la configuración CORS en el backend.

## Solución implementada

Se ha desarrollado una solución que:

1. Utiliza patrones regex para permitir automáticamente todas las URLs de despliegue de Vercel
2. Mantiene una lista de dominios específicos permitidos
3. Soporta configuración mediante variables de entorno
4. Proporciona mejor logging para depuración

### Archivos modificados

- **src/utils/cors.ts**: Utilidad que maneja la configuración CORS
- **src/app.ts**: Actualizado para usar la utilidad CORS
- **deploy-cors.sh**: Script para facilitar el despliegue y configuración

## Cómo funciona

La solución implementa tres capas de verificación para los orígenes:

1. **Lista estática de dominios permitidos** - Dominios específicos que siempre se permiten
2. **Patrones regex** - Para permitir automáticamente URLs de Vercel con un patrón predecible
3. **Variables de entorno** - Para configuración adicional sin modificar código

## Cómo usar

### Agregar un nuevo dominio

Puedes agregar un nuevo dominio a la lista de orígenes permitidos usando el script `deploy-cors.sh`:

```bash
# Desde el directorio de la API
chmod +x deploy-cors.sh
./deploy-cors.sh https://mi-nuevo-dominio.com
```

Este script:
1. Agrega el dominio a la configuración en `utils/cors.ts`
2. Actualiza el archivo `.env` si existe
3. Opcionalmente reinicia el servidor

### Reiniciar el servidor

Para reiniciar el servidor después de hacer cambios:

```bash
./deploy-cors.sh -r
```

### Configuración manual

Si prefieres configurar manualmente:

1. Edita `src/utils/cors.ts` y agrega tu dominio a `staticAllowedOrigins`
2. Añade o modifica los patrones en `vercelPatterns` si necesitas otros formatos de URL
3. Configura la variable de entorno `ALLOWED_ORIGINS` con lista de dominios separados por comas

## Variables de entorno

- `ALLOWED_ORIGINS` - Lista separada por comas de dominios permitidos 
  
  Ejemplo:
  ```
  ALLOWED_ORIGINS=https://mi-dominio1.com,https://mi-dominio2.com
  ```

## Modo desarrollo

En modo desarrollo (`NODE_ENV=development`), la configuración es más permisiva y permite todos los orígenes para facilitar el desarrollo local.

## Diagnóstico

Si tienes problemas de CORS, verifica los logs del servidor, que ahora incluyen:

- El origen que está intentando hacer la solicitud
- Si el origen fue permitido y por qué método (coincidencia exacta o patrón)
- La lista de orígenes permitidos si la solicitud es rechazada

## Patrones soportados

Por defecto, la solución permite automáticamente:

- Todas las URLs con el formato `https://catalogo-productos-{hash}.vercel.app`
- Cualquier subdominio de `vercel.app` con "catalogo-productos" en la ruta
- Dominios de plataformas de despliegue conocidas (vercel.app, netlify.app)

## Recomendaciones para producción

1. Usa variables de entorno para configurar los dominios permitidos
2. Reinicia el servidor después de cambiar la configuración
3. Monitorea los logs para detectar problemas de CORS
4. Para dominios personalizados, agrégalos a la configuración