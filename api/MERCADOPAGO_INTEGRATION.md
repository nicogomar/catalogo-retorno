# Integración de MercadoPago

## Descripción

Este documento describe la integración completa de MercadoPago como pasarela de pagos en la aplicación Catalogo KDN.

## Tabla de Contenidos

1. [Configuración](#configuración)
2. [Arquitectura](#arquitectura)
3. [Endpoints de la API](#endpoints-de-la-api)
4. [Flujo de Pago](#flujo-de-pago)
5. [Webhooks](#webhooks)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Testing](#testing)
8. [Seguridad](#seguridad)

---

## Configuración

### 1. Variables de Entorno

Agrega las siguientes variables de entorno a tu archivo `.env`:

```env
# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui (opcional para el frontend)

# URLs for callbacks
FRONTEND_URL=http://localhost:4200
API_URL=http://localhost:3000
```

### 2. Obtener Credenciales de MercadoPago

1. Crea una cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Ve a "Tus integraciones" → "Credenciales"
3. Copia tu **Access Token** (para testing usa el de prueba)
4. Agrega el token a tu archivo `.env`

### 3. Configurar Base de Datos

Crea la tabla `pagos` en Supabase ejecutando el siguiente SQL:

```sql
CREATE TABLE IF NOT EXISTS pagos (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pedido_id BIGINT REFERENCES pedidos(id) ON DELETE CASCADE,
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  estado TEXT DEFAULT 'pending',
  metodo_pago TEXT,
  monto NUMERIC(10, 2),
  moneda TEXT DEFAULT 'ARS',
  external_reference TEXT UNIQUE,
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  detalles JSONB
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_pagos_pedido_id ON pagos(pedido_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_pagos_external_reference ON pagos(external_reference);
CREATE INDEX idx_pagos_mercadopago_payment_id ON pagos(mercadopago_payment_id);
```

---

## Arquitectura

### Estructura de Archivos

```
api/src/
├── controllers/
│   └── pago.controller.ts       # Controlador de pagos
├── services/
│   ├── pago.service.ts          # Lógica de negocio de pagos
│   └── mercadopago.service.ts   # Integración con MercadoPago API
├── routes/
│   └── pago.routes.ts           # Rutas de pagos
└── types/
    └── index.ts                 # Tipos TypeScript para pagos
```

### Componentes Principales

1. **MercadoPagoService**: Maneja la comunicación con la API de MercadoPago
2. **PagoService**: Gestiona las operaciones de base de datos para pagos
3. **PagoController**: Controlador HTTP para endpoints de pagos
4. **Tipos**: Interfaces TypeScript para type safety

---

## Endpoints de la API

### Base URL: `/api/pagos`

### 1. Crear un Pago

**POST** `/api/pagos`

Crea un nuevo pago y genera una preferencia de pago en MercadoPago.

**Request Body:**
```json
{
  "pedido_id": 123,
  "items": [
    {
      "title": "Producto 1",
      "description": "Descripción del producto",
      "quantity": 2,
      "unit_price": 100.50,
      "currency_id": "ARS"
    }
  ],
  "payer": {
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan@example.com",
    "phone": {
      "area_code": "11",
      "number": "12345678"
    }
  },
  "external_reference": "PEDIDO-123-1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "pago_id": 1,
    "preference_id": "123456789-abc123-def456",
    "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
    "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
  },
  "message": "Payment created successfully"
}
```

### 2. Obtener un Pago por ID

**GET** `/api/pagos/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "pedido_id": 123,
    "mercadopago_payment_id": "123456789",
    "mercadopago_preference_id": "abc-123-def",
    "estado": "approved",
    "metodo_pago": "credit_card",
    "monto": 201.00,
    "moneda": "ARS",
    "external_reference": "PEDIDO-123-1234567890",
    "fecha_aprobacion": "2024-01-15T10:35:00Z",
    "detalles": {}
  }
}
```

### 3. Listar Pagos

**GET** `/api/pagos`

**Query Parameters:**
- `estado`: Filtrar por estado (pending, approved, rejected, etc.)
- `pedido_id`: Filtrar por ID de pedido
- `fecha_inicio`: Fecha de inicio (ISO 8601)
- `fecha_fin`: Fecha de fin (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "pedido_id": 123,
      "estado": "approved",
      "monto": 201.00
    }
  ]
}
```

### 4. Obtener Pagos por Pedido

**GET** `/api/pagos/pedido/:pedidoId`

Obtiene todos los pagos asociados a un pedido específico.

### 5. Obtener Información de Pago desde MercadoPago

**GET** `/api/pagos/mercadopago/:paymentId`

Consulta la información actualizada de un pago directamente desde MercadoPago.

### 6. Webhook de MercadoPago

**POST** `/api/pagos/webhook`

Endpoint para recibir notificaciones de MercadoPago sobre cambios en los pagos.

**⚠️ Este endpoint debe ser público y accesible desde internet.**

### 7. Reembolsar un Pago

**POST** `/api/pagos/:id/refund`

**Request Body:**
```json
{
  "amount": 100.50  // Opcional: monto parcial a reembolsar
}
```

### 8. Estadísticas de Pagos

**GET** `/api/pagos/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "approved": 120,
    "pending": 20,
    "rejected": 10,
    "total_amount": 150000.00,
    "approved_amount": 125000.00
  }
}
```

### 9. Verificar Configuración

**GET** `/api/pagos/check-config`

Verifica si MercadoPago está correctamente configurado.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "configured": true,
    "message": "MercadoPago is properly configured"
  }
}
```

---

## Flujo de Pago

### Flujo Completo de un Pago

```
1. Cliente → Frontend: Selecciona productos y crea pedido
2. Frontend → API: POST /api/pedidos (crea el pedido)
3. API → Database: Guarda el pedido
4. Frontend → API: POST /api/pagos (crea preferencia de pago)
5. API → MercadoPago: Crea preference
6. MercadoPago → API: Devuelve preference_id e init_point
7. API → Database: Guarda registro de pago
8. API → Frontend: Devuelve init_point
9. Frontend → MercadoPago: Redirige al usuario a init_point
10. Usuario → MercadoPago: Completa el pago
11. MercadoPago → API: Envía webhook notification
12. API → Database: Actualiza estado del pago
13. API → Database: Actualiza estado del pedido (si approved)
14. MercadoPago → Frontend: Redirige a success/failure URL
```

### Diagrama de Estados

```
pending → approved ✓
pending → rejected ✗
pending → in_process → approved ✓
approved → refunded (reembolso)
approved → charged_back (contracargo)
```

---

## Webhooks

### Configuración de Webhooks

1. **En MercadoPago:**
   - Ve a "Tus integraciones" → "Webhooks"
   - Agrega la URL: `https://tu-dominio.com/api/pagos/webhook`
   - Selecciona eventos: "Pagos"

2. **En tu aplicación:**
   - El endpoint `/api/pagos/webhook` ya está configurado
   - Procesa automáticamente las notificaciones de MercadoPago

### Eventos de Webhook

```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "123456789"
  },
  "date_created": "2024-01-15T10:35:00Z",
  "id": 987654321,
  "live_mode": true,
  "type": "payment",
  "user_id": "123456"
}
```

### Procesamiento Automático

Cuando se recibe un webhook:
1. ✅ Valida la notificación
2. ✅ Obtiene información actualizada del pago desde MercadoPago
3. ✅ Actualiza el registro de pago en la base de datos
4. ✅ Si el pago es aprobado, actualiza el estado del pedido a "Aprobado"

---

## Ejemplos de Uso

### Ejemplo 1: Crear un Pago desde el Frontend (JavaScript)

```javascript
// 1. Crear el pedido primero
const pedidoResponse = await fetch('https://api.ejemplo.com/api/pedidos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nombre_comercio: 'Mi Comercio',
    telefóno: '1234567890',
    localidad: 'Buenos Aires',
    productos: [
      {
        id: 1,
        nombre: 'Producto 1',
        precio: 100.50,
        quantity: 2
      }
    ]
  })
});

const pedido = await pedidoResponse.json();

// 2. Crear el pago con MercadoPago
const pagoResponse = await fetch('https://api.ejemplo.com/api/pagos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pedido_id: pedido.data.id,
    items: [
      {
        title: 'Producto 1',
        quantity: 2,
        unit_price: 100.50,
        currency_id: 'ARS'
      }
    ],
    payer: {
      name: 'Juan',
      surname: 'Pérez',
      email: 'juan@example.com'
    }
  })
});

const pago = await pagoResponse.json();

// 3. Redirigir al usuario a MercadoPago
window.location.href = pago.data.init_point;
```

### Ejemplo 2: Consultar Estado de un Pago

```javascript
const pagoId = 123;

const response = await fetch(`https://api.ejemplo.com/api/pagos/${pagoId}`);
const result = await response.json();

if (result.data.estado === 'approved') {
  console.log('¡Pago aprobado!');
  console.log('Monto:', result.data.monto);
  console.log('Método:', result.data.metodo_pago);
}
```

### Ejemplo 3: Listar Pagos Aprobados

```javascript
const response = await fetch('https://api.ejemplo.com/api/pagos?estado=approved');
const result = await response.json();

result.data.forEach(pago => {
  console.log(`Pago #${pago.id}: $${pago.monto} - ${pago.estado}`);
});
```

### Ejemplo 4: Integración con Angular

```typescript
// pago.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = 'https://api.ejemplo.com/api/pagos';

  constructor(private http: HttpClient) {}

  crearPago(pagoData: any): Observable<any> {
    return this.http.post(this.apiUrl, pagoData);
  }

  obtenerPago(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  obtenerPagosPorPedido(pedidoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedido/${pedidoId}`);
  }
}

// checkout.component.ts
export class CheckoutComponent {
  constructor(private pagoService: PagoService) {}

  procesarPago(pedidoId: number, items: any[]) {
    const pagoData = {
      pedido_id: pedidoId,
      items: items.map(item => ({
        title: item.nombre,
        quantity: item.quantity,
        unit_price: item.precio,
        currency_id: 'ARS'
      })),
      payer: {
        email: this.userEmail,
        name: this.userName
      }
    };

    this.pagoService.crearPago(pagoData).subscribe(
      response => {
        // Redirigir a MercadoPago
        window.location.href = response.data.init_point;
      },
      error => {
        console.error('Error al crear el pago:', error);
      }
    );
  }
}
```

---

## Testing

### 1. Testing con Credenciales de Prueba

MercadoPago proporciona credenciales de prueba. Úsalas en desarrollo:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abc123def456-789012345
```

### 2. Tarjetas de Prueba

| Tarjeta | Número | CVV | Fecha |
|---------|--------|-----|-------|
| Mastercard (Aprobado) | 5031 7557 3453 0604 | 123 | 11/25 |
| Visa (Rechazado) | 4509 9535 6623 3704 | 123 | 11/25 |
| Mastercard (Pendiente) | 5031 4332 1540 6351 | 123 | 11/25 |

### 3. Testing de Webhooks Localmente

Usa **ngrok** para exponer tu servidor local:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3000
ngrok http 3000

# Usar la URL de ngrok en la configuración de webhooks de MercadoPago
# Ejemplo: https://abc123.ngrok.io/api/pagos/webhook
```

### 4. Testing Manual

```bash
# Verificar configuración
curl http://localhost:3000/api/pagos/check-config

# Crear un pago
curl -X POST http://localhost:3000/api/pagos \
  -H "Content-Type: application/json" \
  -d '{
    "pedido_id": 1,
    "items": [{
      "title": "Test Product",
      "quantity": 1,
      "unit_price": 100
    }]
  }'

# Obtener estadísticas
curl http://localhost:3000/api/pagos/stats
```

---

## Seguridad

### Recomendaciones de Seguridad

1. **Variables de Entorno**
   - ✅ Nunca commitees el archivo `.env` al repositorio
   - ✅ Usa diferentes tokens para desarrollo y producción
   - ✅ Mantén tu Access Token privado

2. **Validación de Webhooks**
   - ✅ Valida la firma del webhook (x-signature header)
   - ✅ Verifica que la notificación venga de MercadoPago
   - ✅ Implementa rate limiting en el endpoint de webhooks

3. **Autenticación en Endpoints**
   - ⚠️ Los endpoints marcados como "should be protected" deben requerir autenticación
   - ✅ Implementa middleware de autenticación para endpoints administrativos
   - ✅ Solo usuarios autorizados deberían poder ver todos los pagos

4. **HTTPS**
   - ✅ Siempre usa HTTPS en producción
   - ✅ MercadoPago requiere HTTPS para webhooks

5. **Logging**
   - ✅ Registra todas las transacciones de pago
   - ✅ No registres información sensible (tarjetas, CVV, etc.)
   - ✅ Monitorea pagos sospechosos

### Ejemplo de Middleware de Autenticación

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  // Validar token aquí
  // ...
  
  next();
};

// Aplicar a rutas protegidas
router.get('/stats', requireAuth, pagoController.getPagoStats);
router.delete('/:id', requireAuth, pagoController.deletePago);
```

---

## Troubleshooting

### Error: "MERCADOPAGO_ACCESS_TOKEN is not configured"

**Solución:** Verifica que hayas configurado la variable de entorno en tu archivo `.env`:
```env
MERCADOPAGO_ACCESS_TOKEN=tu_token_aqui
```

### Error: "Payment record not found for MercadoPago payment ID"

**Causa:** El webhook llegó antes de que se creara el registro en la base de datos, o el external_reference no coincide.

**Solución:** Asegúrate de que el `external_reference` sea único y se guarde correctamente al crear el pago.

### Webhook no se recibe

**Soluciones:**
1. Verifica que la URL del webhook esté configurada correctamente en MercadoPago
2. Asegúrate de que tu servidor sea accesible desde internet (usa ngrok en desarrollo)
3. Verifica que el endpoint `/api/pagos/webhook` responda con código 200

### Pago no se actualiza después del webhook

**Solución:** Verifica los logs del servidor. El webhook debe:
1. Recibir la notificación correctamente
2. Consultar el pago en MercadoPago
3. Actualizar el registro en la base de datos

---

## Recursos Adicionales

- [Documentación oficial de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs)
- [SDK de MercadoPago para Node.js](https://github.com/mercadopago/sdk-nodejs)
- [API Reference](https://www.mercadopago.com.ar/developers/es/reference)
- [Ejemplos de integración](https://github.com/mercadopago/checkout-payment-sample)

---

## Soporte

Para problemas o dudas:
1. Revisa la documentación oficial de MercadoPago
2. Consulta los logs de tu aplicación
3. Verifica el endpoint `/api/pagos/check-config`
4. Contacta al equipo de desarrollo

---

**Última actualización:** Enero 2024
**Versión:** 1.0.0