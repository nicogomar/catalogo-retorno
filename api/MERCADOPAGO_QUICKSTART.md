# 🚀 Guía Rápida: Integración MercadoPago

Esta guía te ayudará a configurar MercadoPago en tu aplicación en **menos de 10 minutos**.

---

## 📋 Requisitos Previos

- ✅ Cuenta de MercadoPago Developers
- ✅ Node.js y npm instalados
- ✅ Base de datos Supabase configurada
- ✅ API funcionando

---

## 🔧 Paso 1: Obtener Credenciales de MercadoPago

### Para Testing (Modo Prueba)

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Inicia sesión o crea una cuenta
3. Ve a **"Tus integraciones"** → **"Credenciales"**
4. Copia tu **Access Token de Prueba**

### Para Producción

1. En la misma sección, cambia a **"Credenciales de producción"**
2. Completa el formulario de activación
3. Copia tu **Access Token de Producción**

---

## 🗄️ Paso 2: Configurar Base de Datos

Ejecuta el siguiente SQL en tu panel de Supabase:

```sql
-- Crear tabla pagos
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

-- Crear índices
CREATE INDEX idx_pagos_pedido_id ON pagos(pedido_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_pagos_external_reference ON pagos(external_reference);
CREATE INDEX idx_pagos_mercadopago_payment_id ON pagos(mercadopago_payment_id);
```

**Nota:** El script completo está en `api/sql/create_pagos_table.sql`

---

## ⚙️ Paso 3: Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abc123def456-789012345

# URLs for callbacks and webhooks
FRONTEND_URL=http://localhost:4200
API_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Para testing usa el token que empiece con `TEST-`
- Para producción usa el token que empiece con `APP_USR-`
- ¡NUNCA subas el archivo `.env` a Git!

---

## 📦 Paso 4: Instalar Dependencias

La dependencia ya está instalada, pero si necesitas reinstalar:

```bash
cd api
npm install mercadopago
```

---

## ✅ Paso 5: Verificar Configuración

Inicia tu servidor y verifica que todo esté configurado:

```bash
# Iniciar el servidor
npm run dev

# En otra terminal, verificar configuración
curl http://localhost:3000/api/pagos/check-config
```

Deberías ver:

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

## 🎯 Paso 6: Crear tu Primer Pago

### Desde el Frontend (JavaScript/TypeScript)

```javascript
// 1. Crear el pedido
const pedidoResponse = await fetch('http://localhost:3000/api/pedidos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre_comercio: 'Mi Tienda',
    telefóno: '1234567890',
    localidad: 'Buenos Aires',
    productos: [
      {
        id: 1,
        nombre: 'Producto Demo',
        precio: 100,
        quantity: 1
      }
    ]
  })
});
const pedido = await pedidoResponse.json();

// 2. Crear el pago
const pagoResponse = await fetch('http://localhost:3000/api/pagos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pedido_id: pedido.data.id,
    items: [
      {
        title: 'Producto Demo',
        quantity: 1,
        unit_price: 100,
        currency_id: 'ARS'
      }
    ],
    payer: {
      email: 'test@example.com'
    }
  })
});
const pago = await pagoResponse.json();

// 3. Redirigir a MercadoPago
window.location.href = pago.data.init_point;
```

### Usando cURL (Testing)

```bash
# Crear un pago
curl -X POST http://localhost:3000/api/pagos \
  -H "Content-Type: application/json" \
  -d '{
    "pedido_id": 1,
    "items": [
      {
        "title": "Producto de Prueba",
        "quantity": 1,
        "unit_price": 100,
        "currency_id": "ARS"
      }
    ],
    "payer": {
      "email": "test@example.com"
    }
  }'
```

---

## 💳 Paso 7: Probar con Tarjetas de Prueba

Cuando MercadoPago te redirija a la página de pago, usa estas tarjetas:

### ✅ Pago Aprobado
- **Tarjeta:** 5031 7557 3453 0604
- **CVV:** 123
- **Fecha:** 11/25
- **Nombre:** APRO

### ❌ Pago Rechazado
- **Tarjeta:** 4509 9535 6623 3704
- **CVV:** 123
- **Fecha:** 11/25
- **Nombre:** OTHE

### ⏳ Pago Pendiente
- **Tarjeta:** 5031 4332 1540 6351
- **CVV:** 123
- **Fecha:** 11/25
- **Nombre:** CALL

---

## 🔔 Paso 8: Configurar Webhooks (Producción)

### En Desarrollo Local (Usando ngrok)

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer tu servidor local
ngrok http 3000

# Copiar la URL (ejemplo: https://abc123.ngrok.io)
```

### En MercadoPago

1. Ve a **"Tus integraciones"** → **"Webhooks"**
2. Click en **"Agregar URL de notificación"**
3. Agrega: `https://tu-dominio.com/api/pagos/webhook`
4. Selecciona evento: **"Pagos"**
5. Guarda

---

## 📊 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/pagos` | Crear un nuevo pago |
| GET | `/api/pagos/:id` | Obtener pago por ID |
| GET | `/api/pagos/pedido/:pedidoId` | Pagos de un pedido |
| GET | `/api/pagos/stats` | Estadísticas de pagos |
| POST | `/api/pagos/webhook` | Recibir notificaciones MP |
| POST | `/api/pagos/:id/refund` | Reembolsar un pago |
| GET | `/api/pagos/check-config` | Verificar configuración |

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "MERCADOPAGO_ACCESS_TOKEN is not configured"

**Solución:** Verifica que el token esté en tu archivo `.env`

```bash
# Ver variables de entorno cargadas
npm run dev

# Verificar que se cargó
curl http://localhost:3000/api/pagos/check-config
```

### ❌ Error: "Payment record not found"

**Solución:** El webhook llegó antes que el registro de pago. Esto es normal, el sistema lo manejará en el próximo intento.

### ❌ No recibo webhooks

**Soluciones:**
1. ✅ Verifica que la URL sea accesible desde internet
2. ✅ Usa ngrok en desarrollo local
3. ✅ Verifica que el endpoint responda con código 200
4. ✅ Revisa los logs de tu servidor

---

## 🔒 Seguridad en Producción

Antes de ir a producción, asegúrate de:

- [ ] Usar Access Token de producción (no el de prueba)
- [ ] Habilitar HTTPS en tu servidor
- [ ] Proteger endpoints administrativos con autenticación
- [ ] No exponer información sensible en logs
- [ ] Validar firmas de webhooks (implementado)
- [ ] Configurar CORS correctamente
- [ ] Establecer rate limiting en webhooks

---

## 📚 Próximos Pasos

1. **Integrar en tu Frontend**
   - Crea un servicio de pagos
   - Implementa páginas de éxito/error
   - Muestra estado de pagos en tiempo real

2. **Personalizar Experiencia**
   - Configura URLs de EJEMPLO personalizadas
   - Agrega información del cliente (payer)
   - Personaliza items con imágenes

3. **Monitoreo**
   - Implementa logging de transacciones
   - Configura alertas de pagos fallidos
   - Revisa estadísticas regularmente

---

## 📖 Documentación Completa

Para información detallada, consulta:
- `MERCADOPAGO_INTEGRATION.md` - Documentación completa
- `sql/create_pagos_table.sql` - Script SQL completo
- [Documentación oficial MercadoPago](https://www.mercadopago.com.ar/developers)

---

## 🆘 ¿Necesitas Ayuda?

- 📧 Soporte MercadoPago: developers@mercadopago.com
- 📚 Docs oficiales: https://www.mercadopago.com.ar/developers
- 💬 Comunidad: https://www.mercadopago.com.ar/developers/es/support

---

**¡Listo! 🎉 Tu integración con MercadoPago está completa.**

Ahora puedes procesar pagos de forma segura y confiable.