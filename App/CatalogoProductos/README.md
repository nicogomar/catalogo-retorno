# Catalogo KDN - Proyecto Completo

Sistema de catálogo de productos con gestión de pedidos, ahora con arquitectura **Backend-Frontend separada**.

## 🎯 Estado del Proyecto

✅ **Integración Completada** - El frontend ahora consume una API REST independiente

## 📁 Estructura del Proyecto

```
Catalogo KDN/CatalogoProductos/
├── api/                          # 🔧 Backend API REST
│   ├── src/                      # Código fuente TypeScript
│   ├── .env                      # Variables de entorno
│   ├── package.json              # Dependencias backend
│   └── README.md                 # Documentación de la API
│
├── App/                          # 🎨 Frontend Angular
│   ├── src/                      # Código fuente Angular
│   │   ├── app/
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts        # ✨ Servicio HTTP genérico
│   │   │   │   ├── producto.service.ts   # ✅ Usa API REST
│   │   │   │   └── pedido.service.ts     # ✅ Usa API REST
│   │   │   └── ...
│   │   └── environments/         # Configuración (apiUrl)
│   ├── package.json              # Dependencias frontend
│   └── API_INTEGRATION.md        # Guía de uso
│
├── start-dev.sh                  # 🚀 Script de inicio automático
├── BACKEND_SEPARATION.md         # 📚 Documentación completa
└── README.md                     # Este archivo
```

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
cd CatalogoProductos
./start-dev.sh
```

Este script inicia automáticamente:
- ✅ API Backend en `http://localhost:3000`
- ✅ Frontend Angular en `http://localhost:4200`

### Opción 2: Manual

**Terminal 1 - Backend:**
```bash
cd CatalogoProductos/api
npm install
cp .env.example .env  # Configurar credenciales
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd CatalogoProductos/App
npm install
npm start
```

## 🔧 Configuración Necesaria

### 1. Variables de Entorno (api/.env)

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

### 2. Environment Frontend (App/src/environments/environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api"
};
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Productos
- `GET /productos` - Listar productos
- `GET /productos/:id` - Obtener producto
- `POST /productos` - Crear producto
- `PUT /productos/:id` - Actualizar producto
- `DELETE /productos/:id` - Eliminar producto
- `GET /productos/search/:nombre` - Buscar por nombre
- `GET /productos/latest/:limit` - Últimos productos
- `GET /productos/order-by-precio/:direction` - Ordenar por precio

### Pedidos
- `GET /pedidos` - Listar pedidos
- `GET /pedidos/:id` - Obtener pedido
- `POST /pedidos` - Crear pedido
- `PUT /pedidos/:id` - Actualizar pedido
- `DELETE /pedidos/:id` - Eliminar pedido
- `GET /pedidos/search/comercio/:nombre` - Buscar por comercio
- `GET /pedidos/search/email/:email` - Buscar por email
- `GET /pedidos/latest/:limit` - Últimos pedidos
- `GET /pedidos/date-range` - Por rango de fechas

### Utilidad
- `GET /` - Información de la API
- `GET /health` - Health check

## 💻 Stack Tecnológico

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **Supabase** (PostgreSQL)
- Helmet, CORS, Morgan

### Frontend
- **Angular 19**
- **TypeScript**
- **RxJS**
- **HttpClient**

## ✨ Características

### Backend API
- ✅ RESTful API completa
- ✅ TypeScript con tipado completo
- ✅ Integración con Supabase
- ✅ CORS configurado
- ✅ Manejo de errores centralizado
- ✅ Paginación y filtrado
- ✅ Respuestas estandarizadas

### Frontend
- ✅ Servicio HTTP genérico (`ApiService`)
- ✅ Eliminación completa de Supabase del frontend
- ✅ Servicios actualizados (`ProductoService`, `PedidoService`)
- ✅ Interfaces TypeScript
- ✅ Manejo de errores mejorado

## 🧪 Verificar la Instalación

### Health Check
```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API is running"
}
```

### Obtener Productos
```bash
curl http://localhost:3000/api/productos
```

### Crear un Pedido
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_comercio": "Mi Comercio",
    "telefóno": "123456789",
    "email": "test@example.com",
    "localidad": "Córdoba",
    "productos": [
      {
        "id": 1,
        "nombre": "Producto 1",
        "precio": 100,
        "quantity": 2
      }
    ]
  }'
```

## 📚 Documentación Completa

- **[BACKEND_SEPARATION.md](BACKEND_SEPARATION.md)** - Documentación completa de la migración
- **[api/README.md](api/README.md)** - Documentación de la API
- **[api/API_TESTING.md](api/API_TESTING.md)** - Ejemplos de pruebas
- **[api/FRONTEND_INTEGRATION.md](api/FRONTEND_INTEGRATION.md)** - Guía de integración
- **[App/API_INTEGRATION.md](App/API_INTEGRATION.md)** - Uso de servicios

## 🔍 Uso de los Servicios (Frontend)

### ProductoService

```typescript
import { ProductoService } from './services/producto.service';

// Obtener todos los productos
this.productoService.getProductos().subscribe(productos => {
  console.log(productos);
});

// Con filtros
this.productoService.getProductos({ 
  precioMin: 100, 
  precioMax: 500,
  orderBy: 'precio',
  orderDirection: 'asc'
}).subscribe(productos => {
  console.log(productos);
});

// Crear producto
const nuevo = {
  nombre: 'Arroz',
  precio: 150,
  peso: '1kg'
};
this.productoService.createProducto(nuevo).subscribe(producto => {
  console.log('Creado:', producto);
});
```

### PedidoService

```typescript
import { PedidoService } from './services/pedido.service';

// Crear pedido
const nuevoPedido = {
  nombre_comercio: 'Mi Comercio',
  telefóno: '123456789',
  email: 'comercio@example.com',
  localidad: 'Córdoba',
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

// Buscar por comercio
this.pedidoService.searchPedidosByComercio('Almacen').subscribe(pedidos => {
  console.log(pedidos);
});
```

## 🐛 Solución de Problemas

### Error de CORS
**Solución:** Verifica que `ALLOWED_ORIGINS` en `api/.env` incluya `http://localhost:4200`

### No se puede conectar a la API
**Solución:** 
1. Verifica que la API esté corriendo: `curl http://localhost:3000/api/health`
2. Revisa que `apiUrl` en `environment.ts` sea correcto

### Error 404
**Solución:** Asegúrate de incluir `/api` en la URL base: `http://localhost:3000/api/productos`

## 🔒 Seguridad

⚠️ **Importante:**
- Nunca subas el archivo `.env` a Git
- El `SUPABASE_SERVICE_ROLE_KEY` bypassa Row Level Security
- En producción, implementa autenticación JWT
- Configura CORS solo con dominios necesarios
- Usa HTTPS en producción

## 📦 Scripts Disponibles

### Backend (api/)
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Compilar TypeScript
npm start        # Iniciar en producción
```

### Frontend (App/)
```bash
npm start        # Iniciar desarrollo (ng serve)
npm run build    # Compilar para producción
npm test         # Ejecutar tests
```

## 🎯 Ventajas de la Nueva Arquitectura

- 🔄 **Escalabilidad:** Backend y frontend escalan independientemente
- 🧪 **Testing:** Más fácil probar cada capa por separado
- 👥 **Desarrollo en equipo:** Equipos pueden trabajar en paralelo
- 🔐 **Seguridad:** Credenciales sensibles solo en el backend
- 🌐 **Múltiples clientes:** La API puede servir web, mobile, desktop
- 📱 **Reutilización:** La misma API para diferentes frontends

## 📈 Próximos Pasos Sugeridos

1. ✅ Implementar autenticación JWT
2. ✅ Agregar tests unitarios e integración
3. ✅ Implementar caché (Redis)
4. ✅ Rate limiting en producción
5. ✅ Monitoreo y alertas (Sentry)
6. ✅ CI/CD con GitHub Actions
7. ✅ Documentación con Swagger/OpenAPI

## 🤝 Contribuir

1. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios
3. Prueba exhaustivamente
4. Crea un Pull Request

## 📄 Licencia

ISC

---

## 🆘 Ayuda

Para más información:
- Consulta [BACKEND_SEPARATION.md](BACKEND_SEPARATION.md)
- Revisa la documentación de la API en [api/README.md](api/README.md)
- Lee los ejemplos en [App/API_INTEGRATION.md](App/API_INTEGRATION.md)

---

**✨ Proyecto migrado exitosamente a arquitectura Backend-Frontend separada**

**Creado con ❤️ para Catalogo KDN**

_Última actualización: 2024_