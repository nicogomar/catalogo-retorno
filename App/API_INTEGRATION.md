# Integración del Frontend con la API

Este documento describe cómo el frontend de Catalogo KDN se ha integrado con la API REST del backend.

## 🔄 Cambios Realizados

### 1. Eliminación de Supabase del Frontend

Se han eliminado las siguientes dependencias y archivos relacionados con Supabase:

- ❌ `src/app/config/supabase.ts`
- ❌ `src/app/config/supabase-admin.ts`
- ❌ `src/app/services/supabase.service.ts`

### 2. Nuevos Servicios Creados

#### ApiService (`src/app/services/api.service.ts`)

Servicio genérico para manejar todas las peticiones HTTP a la API REST:

- **GET**: Obtener recursos
- **POST**: Crear recursos
- **PUT**: Actualizar recursos
- **DELETE**: Eliminar recursos

**Características:**
- Manejo centralizado de errores
- Transformación automática de respuestas
- Soporte para parámetros de consulta
- Mensajes de error descriptivos

#### Servicios Actualizados

- **ProductoService**: Ahora usa `ApiService` en lugar de `SupabaseService`
- **PedidoService**: Ahora usa `ApiService` en lugar de `SupabaseService`

### 3. Configuración de Entorno

Los archivos de entorno ahora solo contienen la URL de la API:

**`src/environments/environment.ts` (Desarrollo):**
```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api"
};
```

**`src/environments/environment.prod.ts` (Producción):**
```typescript
export const environment = {
  production: true,
  apiUrl: "https://your-production-api-url.com/api"
};
```

### 4. Configuración de la Aplicación

Se agregó `HttpClient` a la configuración de la aplicación (`app.config.ts`):

```typescript
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    // ... otros providers
  ],
};
```

## 📋 Uso de los Servicios

### ProductoService

```typescript
import { ProductoService, Producto } from './services/producto.service';

// Obtener todos los productos
this.productoService.getProductos().subscribe(productos => {
  console.log(productos);
});

// Obtener productos con filtros
this.productoService.getProductos({ 
  precioMin: 100, 
  precioMax: 500,
  orderBy: 'precio',
  orderDirection: 'asc'
}).subscribe(productos => {
  console.log(productos);
});

// Obtener productos paginados
this.productoService.getProductosPaginated(1, 10).subscribe(productos => {
  console.log(productos);
});

// Obtener producto por ID
this.productoService.getProductoById(1).subscribe(producto => {
  console.log(producto);
});

// Crear producto
const nuevoProducto: Producto = {
  nombre: 'Producto Nuevo',
  precio: 150,
  peso: '1kg',
  descripcion: 'Descripción del producto'
};
this.productoService.createProducto(nuevoProducto).subscribe(producto => {
  console.log('Producto creado:', producto);
});

// Actualizar producto
this.productoService.updateProducto(1, { precio: 200 }).subscribe(producto => {
  console.log('Producto actualizado:', producto);
});

// Eliminar producto
this.productoService.deleteProducto(1).subscribe(() => {
  console.log('Producto eliminado');
});

// Buscar por nombre
this.productoService.searchProductosByNombre('arroz').subscribe(productos => {
  console.log(productos);
});

// Obtener últimos productos
this.productoService.getLatestProductos(5).subscribe(productos => {
  console.log(productos);
});

// Ordenar por precio
this.productoService.getProductosOrderByPrecio(true).subscribe(productos => {
  console.log('Ordenados ascendente:', productos);
});
```

### PedidoService

```typescript
import { PedidoService, Pedido, NuevoPedido } from './services/pedido.service';

// Obtener todos los pedidos
this.pedidoService.getPedidos().subscribe(pedidos => {
  console.log(pedidos);
});

// Obtener pedidos con filtros
this.pedidoService.getPedidos({ 
  localidad: 'Buenos Aires',
  orderBy: 'created_at',
  orderDirection: 'desc'
}).subscribe(pedidos => {
  console.log(pedidos);
});

// Obtener pedidos paginados
this.pedidoService.getPedidosPaginated(1, 10).subscribe(pedidos => {
  console.log(pedidos);
});

// Obtener pedido por ID
this.pedidoService.getPedidoById(1).subscribe(pedido => {
  console.log(pedido);
});

// Crear pedido
const nuevoPedido: NuevoPedido = {
  nombre_comercio: 'Mi Comercio',
  telefóno: '123456789',
  email: 'comercio@example.com',
  localidad: 'Ciudad',
  productos: [
    {
      id: 1,
      nombre: 'Producto 1',
      precio: 100,
      quantity: 2
    }
  ]
};
this.pedidoService.createPedido(nuevoPedido).subscribe(pedido => {
  console.log('Pedido creado:', pedido);
});

// Actualizar pedido
this.pedidoService.updatePedido(1, { 
  localidad: 'Nueva Ciudad' 
}).subscribe(pedido => {
  console.log('Pedido actualizado:', pedido);
});

// Eliminar pedido
this.pedidoService.deletePedido(1).subscribe(() => {
  console.log('Pedido eliminado');
});

// Buscar por comercio
this.pedidoService.searchPedidosByComercio('Almacen').subscribe(pedidos => {
  console.log(pedidos);
});

// Buscar por email
this.pedidoService.searchPedidosByEmail('test@example.com').subscribe(pedidos => {
  console.log(pedidos);
});

// Buscar por localidad
this.pedidoService.searchPedidosByLocalidad('Buenos Aires').subscribe(pedidos => {
  console.log(pedidos);
});

// Obtener últimos pedidos
this.pedidoService.getLatestPedidos(10).subscribe(pedidos => {
  console.log(pedidos);
});

// Obtener por rango de fechas
const fechaInicio = new Date('2024-01-01');
const fechaFin = new Date('2024-12-31');
this.pedidoService.getPedidosByDateRange(fechaInicio, fechaFin).subscribe(pedidos => {
  console.log(pedidos);
});

// Obtener pedidos que contienen un producto
this.pedidoService.getPedidosByProducto(1).subscribe(pedidos => {
  console.log(pedidos);
});
```

## 🚀 Iniciar el Proyecto

### 1. Iniciar la API Backend

```bash
cd api
npm install
npm run dev
```

La API estará disponible en `http://localhost:3000`

### 2. Iniciar el Frontend

```bash
cd App
npm install
ng serve
```

El frontend estará disponible en `http://localhost:4200`

## 🔧 Configuración para Producción

### 1. Actualizar la URL de la API

Edita `src/environments/environment.prod.ts` y actualiza la URL de la API:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://tu-api-produccion.com/api"
};
```

### 2. Compilar el Frontend

```bash
ng build --configuration production
```

Los archivos compilados estarán en `dist/`.

## 🧪 Manejo de Errores

El `ApiService` maneja automáticamente los errores y proporciona mensajes descriptivos:

```typescript
this.productoService.getProductos().subscribe({
  next: (productos) => {
    console.log('Productos obtenidos:', productos);
  },
  error: (error) => {
    console.error('Error al obtener productos:', error.message);
    // Mostrar mensaje al usuario
    this.alertService.error(error.message);
  }
});
```

### Tipos de Errores Comunes

1. **Error de conexión** (Status 0):
   - Mensaje: "No se pudo conectar con el servidor. Verifica que la API esté ejecutándose."
   - Solución: Verificar que la API esté corriendo en el puerto correcto

2. **Error 404**:
   - Mensaje: "Recurso no encontrado"
   - Solución: Verificar que el endpoint de la API sea correcto

3. **Error 500**:
   - Mensaje: "Error interno del servidor"
   - Solución: Revisar los logs de la API backend

4. **CORS Error**:
   - Solución: Asegurarse que la API tenga configurado CORS correctamente con la URL del frontend

## 📝 Interfaces y Tipos

### Producto

```typescript
interface Producto {
  id?: number;
  created_at?: Date;
  nombre?: string | null;
  peso?: string | null;
  precio?: number | null;
  img_url?: string | null;
  descripcion?: string | null;
}
```

### Pedido

```typescript
interface ItemPedido {
  id: number;
  nombre: string;
  precio: number;
  quantity: number;
  peso?: string;
  img_url?: string;
}

interface Pedido {
  id?: number;
  created_at?: Date;
  nombre_comercio?: string | null;
  telefóno?: string | null;
  email?: string | null;
  localidad?: string | null;
  productos?: ItemPedido[] | null;
}
```

## 🔍 Ventajas de esta Arquitectura

1. **Separación de responsabilidades**: El frontend solo maneja la UI, el backend maneja los datos
2. **Seguridad mejorada**: Las credenciales de la base de datos solo están en el backend
3. **Escalabilidad**: Fácil de escalar frontend y backend independientemente
4. **Mantenibilidad**: Código más limpio y fácil de mantener
5. **Testing**: Más fácil de testear cada capa por separado
6. **Reutilización**: La API puede ser usada por otros clientes (móvil, etc.)

## 📚 Recursos Adicionales

- [Documentación de la API](../api/README.md)
- [Guía de Testing de la API](../api/API_TESTING.md)
- [Endpoints de la API](../api/README.md#api-endpoints)

## 🆘 Troubleshooting

### El frontend no puede conectarse a la API

1. Verificar que la API esté corriendo: `curl http://localhost:3000/api/health`
2. Verificar la URL en `environment.ts`
3. Revisar la consola del navegador para errores CORS
4. Verificar que no haya un firewall bloqueando el puerto 3000

### Los datos no se actualizan

1. Verificar que el componente esté suscrito correctamente al Observable
2. Usar `async` pipe en el template o `subscribe()` en el componente
3. Verificar que no haya errores en la consola del navegador

### Errores de tipo TypeScript

1. Asegurarse que las interfaces estén importadas correctamente
2. Verificar que los datos de la API coincidan con las interfaces
3. Usar el operador de navegación segura `?.` para propiedades opcionales

---

**¡La integración está completa!** 🎉

Ahora tu frontend está completamente desacoplado de Supabase y usa la API REST del backend.