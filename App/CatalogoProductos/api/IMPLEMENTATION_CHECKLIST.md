# Implementation Checklist - Backend Separation

Este checklist te guiará paso a paso para implementar la separación del backend y conectar tu frontend Angular con la nueva API.

## 📋 Phase 1: Setup del Backend API

### 1.1 Instalación Inicial

- [ ] Navegar a la carpeta `api`
  ```bash
  cd "Catalogo KDN/api"
  ```

- [ ] Instalar dependencias
  ```bash
  npm install
  ```

- [ ] Verificar que se instalaron correctamente
  ```bash
  npm list --depth=0
  ```

### 1.2 Configuración de Variables de Entorno

- [ ] El archivo `.env` ya existe con las credenciales
- [ ] Verificar que las credenciales de Supabase son correctas
- [ ] Opcional: Actualizar `PORT` si es necesario (default: 3000)
- [ ] Opcional: Agregar más orígenes a `ALLOWED_ORIGINS` si es necesario

### 1.3 Verificar el Backend

- [ ] Iniciar el servidor en modo desarrollo
  ```bash
  npm run dev
  ```

- [ ] Verificar que el servidor inicia sin errores
- [ ] Verificar mensaje: "✅ Database connection successful"
- [ ] Verificar mensaje: "✅ Server is running on port 3000"

- [ ] Probar endpoint de salud (en otra terminal o navegador)
  ```bash
  curl http://localhost:3000/api/health
  ```

- [ ] Verificar respuesta:
  ```json
  {
    "success": true,
    "message": "API is running",
    "timestamp": "..."
  }
  ```

### 1.4 Probar Endpoints Básicos

- [ ] Obtener productos
  ```bash
  curl http://localhost:3000/api/productos
  ```

- [ ] Obtener pedidos
  ```bash
  curl http://localhost:3000/api/pedidos
  ```

- [ ] Si hay errores, revisar:
  - [ ] Conexión a Supabase
  - [ ] Credenciales en `.env`
  - [ ] Logs del servidor

---

## 📋 Phase 2: Actualizar Frontend Angular

### 2.1 Actualizar Archivos de Entorno

- [ ] Abrir `CatalogoProductos/App/src/environments/environment.ts`

- [ ] Agregar la URL de la API:
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',  // ← AGREGAR ESTO
    supabase: {
      url: 'https://dgsacgbcgnyvgbkrvjmd.supabase.co',
      anonKey: '...'
    }
  };
  ```

- [ ] Hacer lo mismo en `environment.prod.ts` (si existe)
  ```typescript
  export const environment = {
    production: true,
    apiUrl: 'https://tu-api-produccion.com/api',  // URL de producción
    supabase: { ... }
  };
  ```

### 2.2 Verificar HttpClient

- [ ] Si usas Angular 17+ con standalone components:
  - [ ] Abrir `src/app/app.config.ts`
  - [ ] Verificar que `provideHttpClient()` está importado
  ```typescript
  import { provideHttpClient } from '@angular/common/http';
  
  export const appConfig: ApplicationConfig = {
    providers: [
      provideHttpClient(),  // ← Debe estar presente
      // ... otros providers
    ]
  };
  ```

- [ ] Si usas módulos tradicionales:
  - [ ] Abrir `src/app/app.module.ts`
  - [ ] Verificar que `HttpClientModule` está importado
  ```typescript
  import { HttpClientModule } from '@angular/common/http';
  
  @NgModule({
    imports: [
      HttpClientModule,  // ← Debe estar presente
      // ... otros imports
    ]
  })
  ```

### 2.3 Crear ApiService

- [ ] Crear el archivo `src/app/services/api.service.ts`

- [ ] Copiar el código del servicio desde `api/FRONTEND_INTEGRATION.md`

- [ ] Verificar imports correctos

- [ ] Guardar archivo

### 2.4 Actualizar ProductoService

- [ ] Hacer backup del archivo actual (opcional)
  ```bash
  cp src/app/services/producto.service.ts src/app/services/producto.service.ts.backup
  ```

- [ ] Actualizar `src/app/services/producto.service.ts`

- [ ] Reemplazar llamadas a `supabaseService` con `apiService`

- [ ] Importar `ApiService` y los tipos necesarios

- [ ] Ejemplo de cambio:
  ```typescript
  // ANTES
  return this.supabaseService.from<Producto>('producto');
  
  // DESPUÉS
  return this.apiService.get<ApiResponse<Producto[]>>('/productos')
    .pipe(map(response => response.data || []));
  ```

- [ ] Actualizar todos los métodos del servicio

- [ ] Guardar archivo

### 2.5 Actualizar PedidoService

- [ ] Hacer backup del archivo actual (opcional)
  ```bash
  cp src/app/services/pedido.service.ts src/app/services/pedido.service.ts.backup
  ```

- [ ] Actualizar `src/app/services/pedido.service.ts`

- [ ] Reemplazar llamadas a `supabaseService` con `apiService`

- [ ] Actualizar todos los métodos del servicio

- [ ] Guardar archivo

### 2.6 Remover Dependencias Antiguas (Opcional)

- [ ] Si ya no necesitas acceso directo a Supabase en el frontend:
  - [ ] Remover imports de `supabase.ts` y `supabase-admin.ts`
  - [ ] Remover `SupabaseService` si ya no se usa
  - [ ] Actualizar componentes que usaban estos servicios

---

## 📋 Phase 3: Testing de Integración

### 3.1 Preparar el Entorno

- [ ] Terminal 1: Backend API corriendo
  ```bash
  cd "Catalogo KDN/api"
  npm run dev
  ```

- [ ] Terminal 2: Frontend Angular corriendo
  ```bash
  cd "Catalogo KDN/CatalogoProductos/App"
  npm start
  ```

- [ ] Ambos servicios deben estar corriendo sin errores

### 3.2 Verificar Consola del Navegador

- [ ] Abrir la aplicación en el navegador: `http://localhost:4200`

- [ ] Abrir DevTools (F12)

- [ ] Ir a la pestaña Console

- [ ] Verificar que NO hay errores de CORS

- [ ] Verificar que NO hay errores de conexión

### 3.3 Probar Funcionalidades

#### Productos

- [ ] Listar productos
  - [ ] Los productos se muestran correctamente
  - [ ] Las imágenes cargan bien
  - [ ] Los precios se muestran correctamente

- [ ] Buscar productos
  - [ ] La búsqueda funciona
  - [ ] Los resultados son correctos

- [ ] Filtrar productos
  - [ ] Los filtros funcionan
  - [ ] El ordenamiento funciona

#### Pedidos

- [ ] Ver lista de pedidos (si aplica)
  - [ ] Los pedidos se muestran correctamente

- [ ] Crear un nuevo pedido
  - [ ] Agregar productos al carrito
  - [ ] Completar formulario de cliente
  - [ ] Enviar pedido
  - [ ] Verificar mensaje de éxito
  - [ ] Verificar en la API que el pedido se creó

- [ ] Verificar pedido creado
  ```bash
  # En terminal separada
  curl http://localhost:3000/api/pedidos/latest/1
  ```

### 3.4 Verificar Logs

- [ ] Revisar logs del backend
  - [ ] Las peticiones se registran correctamente
  - [ ] No hay errores inesperados

- [ ] Revisar Network en DevTools
  - [ ] Las peticiones van a `http://localhost:3000/api/*`
  - [ ] Los códigos de respuesta son 200 o 201
  - [ ] Las respuestas tienen el formato correcto

---

## 📋 Phase 4: Error Handling

### 4.1 Crear Interceptor de Errores

- [ ] Crear `src/app/interceptors/error.interceptor.ts`

- [ ] Copiar código desde `api/FRONTEND_INTEGRATION.md`

- [ ] Registrar el interceptor en `app.config.ts` o `app.module.ts`

- [ ] Probar con una petición que falle intencionalmente

### 4.2 Conectar con AlertService

- [ ] Si tienes un `AlertService`:
  - [ ] Importarlo en el interceptor
  - [ ] Mostrar errores al usuario
  - [ ] Probar que las notificaciones funcionan

---

## 📋 Phase 5: Optimizaciones (Opcional)

### 5.1 Loading States

- [ ] Agregar indicadores de carga en componentes
- [ ] Usar BehaviorSubject para estados de loading
- [ ] Mostrar spinners durante peticiones

### 5.2 Caching

- [ ] Implementar caché en el frontend para datos frecuentes
- [ ] Usar RxJS operators como `shareReplay()`
- [ ] Considerar service workers para caché offline

### 5.3 Pagination

- [ ] Implementar paginación en listados grandes
- [ ] Usar los parámetros `page` y `limit` de la API
- [ ] Agregar controles de navegación

---

## 📋 Phase 6: Producción

### 6.1 Backend en Producción

- [ ] Elegir plataforma de hosting
  - [ ] Vercel
  - [ ] Railway
  - [ ] Heroku
  - [ ] AWS
  - [ ] Otro

- [ ] Configurar variables de entorno en el hosting

- [ ] Configurar `NODE_ENV=production`

- [ ] Actualizar `ALLOWED_ORIGINS` con URL del frontend

- [ ] Hacer build de producción
  ```bash
  npm run build
  ```

- [ ] Desplegar

- [ ] Verificar que la API funciona
  ```bash
  curl https://tu-api.com/api/health
  ```

### 6.2 Frontend en Producción

- [ ] Actualizar `environment.prod.ts` con URL de producción de la API

- [ ] Hacer build de producción
  ```bash
  npm run build
  ```

- [ ] Desplegar en tu plataforma (Vercel, Netlify, etc.)

- [ ] Verificar que la aplicación funciona

- [ ] Probar todas las funcionalidades

---

## 📋 Phase 7: Limpieza y Documentación

### 7.1 Limpieza de Código

- [ ] Remover código comentado
- [ ] Remover imports no utilizados
- [ ] Remover archivos de backup si todo funciona
- [ ] Actualizar comentarios en el código

### 7.2 Documentación

- [ ] Actualizar README del proyecto
- [ ] Documentar cualquier cambio específico de tu implementación
- [ ] Agregar notas sobre deployment
- [ ] Documentar endpoints personalizados si agregaste alguno

### 7.3 Git

- [ ] Hacer commit de los cambios
  ```bash
  git add .
  git commit -m "feat: separate backend API from frontend"
  ```

- [ ] Verificar que `.env` NO está en el commit
- [ ] Push a tu repositorio

---

## 🎯 Verificación Final

### Checklist de Verificación Completa

- [ ] ✅ Backend API corriendo sin errores
- [ ] ✅ Frontend Angular conectado a la API
- [ ] ✅ Productos se listan correctamente
- [ ] ✅ Pedidos se crean correctamente
- [ ] ✅ Búsquedas funcionan
- [ ] ✅ Filtros funcionan
- [ ] ✅ No hay errores en consola
- [ ] ✅ No hay errores de CORS
- [ ] ✅ Manejo de errores implementado
- [ ] ✅ Loading states funcionan (si aplica)
- [ ] ✅ Todo funciona en localhost
- [ ] ✅ Configurado para producción
- [ ] ✅ Documentación actualizada

---

## 🚨 Troubleshooting Rápido

### Backend no inicia

1. [ ] Verificar que Node.js está instalado
2. [ ] Verificar que `npm install` se ejecutó
3. [ ] Revisar el archivo `.env`
4. [ ] Revisar logs de error en la terminal

### CORS Error

1. [ ] Verificar que el backend está corriendo
2. [ ] Revisar `ALLOWED_ORIGINS` en `.env`
3. [ ] Reiniciar el servidor backend
4. [ ] Limpiar caché del navegador

### 404 en peticiones

1. [ ] Verificar `apiUrl` en `environment.ts`
2. [ ] Asegurarse de que incluye `/api`
3. [ ] Revisar que el endpoint existe en la API
4. [ ] Consultar `API_TESTING.md`

### Datos no se muestran

1. [ ] Verificar Network en DevTools
2. [ ] Revisar response de las peticiones
3. [ ] Verificar que el mapeo de datos es correcto
4. [ ] Revisar logs del backend

---

## 📚 Recursos Adicionales

- 📖 [api/README.md](api/README.md) - Documentación completa
- 🧪 [api/API_TESTING.md](api/API_TESTING.md) - Guía de testing
- 🔗 [api/FRONTEND_INTEGRATION.md](api/FRONTEND_INTEGRATION.md) - Integración detallada
- 📋 [BACKEND_SEPARATION.md](BACKEND_SEPARATION.md) - Resumen del proyecto

---

## ✅ ¡Todo Listo!

Una vez completado este checklist, tu proyecto estará completamente separado con:

- ✨ Backend API independiente y escalable
- 🎨 Frontend Angular consumiendo la API
- 🔒 Configuración segura de variables de entorno
- 📡 Comunicación REST estandarizada
- 🚀 Listo para desarrollo y producción

**¡Felicitaciones! 🎉**