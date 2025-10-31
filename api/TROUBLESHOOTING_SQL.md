# Guía de Solución de Problemas - SQL y MercadoPago

Esta guía te ayudará a resolver problemas comunes al configurar la integración de MercadoPago.

---

## 📋 Tabla de Contenidos

1. [Problemas con la Base de Datos](#problemas-con-la-base-de-datos)
2. [Problemas con MercadoPago](#problemas-con-mercadopago)
3. [Problemas con la API](#problemas-con-la-api)
4. [Problemas con Webhooks](#problemas-con-webhooks)

---

## Problemas con la Base de Datos

### ❌ Error: "relation 'pedidos' does not exist" o "relation 'pedido' does not exist"

**Causa:** El script SQL intenta crear una foreign key a una tabla de pedidos que no existe o tiene un nombre diferente.

**Nota:** La tabla correcta se llama `pedido` (singular), no `pedidos` (plural).

**Solución 1 - Usar el script simplificado (sin foreign key):**

```bash
# Ejecuta este script en lugar del completo
api/sql/create_pagos_simple.sql
```

Este script NO crea la foreign key constraint y funcionará sin la tabla `pedido`.

**Solución 2 - Usar el script con foreign key:**

Si ya tienes la tabla `pedido` creada, usa este script que incluye la relación:

```bash
# Ejecuta este script en Supabase
api/sql/create_pagos_with_fk.sql
```

Este script crea la tabla con la foreign key a `pedido(id)` correctamente configurada.

**Solución 3 - Agregar la foreign key después:**

Ejecuta primero el script simplificado, luego cuando tengas la tabla `pedido`:

```sql
-- Agregar foreign key después
ALTER TABLE pagos
ADD CONSTRAINT fk_pagos_pedido
FOREIGN KEY (pedido_id)
REFERENCES pedido(id)
ON DELETE CASCADE;
```

**Verificar que existe la tabla pedido:**

```sql
-- Ver si la tabla existe
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'pedido';

-- Ver estructura de la tabla pedido
\d pedido
```

---

### ❌ Error: "permission denied for schema public"

**Causa:** No tienes permisos suficientes en Supabase.

**Solución:**

1. Ve a tu proyecto en Supabase
2. Asegúrate de estar usando el **SQL Editor** del dashboard
3. Si persiste, verifica que tu usuario tenga permisos:

```sql
-- Verificar permisos
SELECT has_schema_privilege('public', 'CREATE');

-- Si necesitas otorgar permisos (ejecuta como superusuario)
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
```

---

### ❌ Error: "duplicate key value violates unique constraint"

**Causa:** Intentas insertar un registro con un `external_reference` que ya existe.

**Solución:**

```sql
-- Ver registros existentes
SELECT * FROM pagos WHERE external_reference = 'tu_referencia';

-- Eliminar duplicados si es necesario
DELETE FROM pagos WHERE external_reference = 'tu_referencia';
```

En tu código, asegúrate de generar referencias únicas:

```javascript
external_reference: `PEDIDO-${pedido_id}-${Date.now()}`
```

---

### ❌ Error: "policy for table 'pagos' already exists"

**Causa:** Intentas crear políticas RLS que ya existen.

**Solución:**

El script actualizado ya incluye `DROP POLICY IF EXISTS`. Si aún falla:

```sql
-- Eliminar todas las políticas de pagos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver pagos" ON pagos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear pagos" ON pagos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar pagos" ON pagos;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar pagos" ON pagos;
DROP POLICY IF EXISTS "Permitir lectura pública para webhooks" ON pagos;
DROP POLICY IF EXISTS "allow_all_operations" ON pagos;

-- Luego ejecuta nuevamente el script
```

---

### ❌ Error: "new row violates row-level security policy"

**Causa:** Las políticas RLS están bloqueando la inserción.

**Solución:**

```sql
-- Opción 1: Deshabilitar RLS temporalmente (solo para desarrollo)
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;

-- Opción 2: Crear política permisiva
DROP POLICY IF EXISTS "allow_all" ON pagos;
CREATE POLICY "allow_all"
ON pagos
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
```

---

## Problemas con MercadoPago

### ❌ Error: "MERCADOPAGO_ACCESS_TOKEN is not configured"

**Causa:** Falta configurar el token de MercadoPago en las variables de entorno.

**Solución:**

1. Obtén tu token en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Agrégalo a tu archivo `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abc123def456-789012345
```

3. Reinicia el servidor:

```bash
cd api
npm run dev
```

4. Verifica:

```bash
curl http://localhost:3000/api/pagos/check-config
```

---

### ❌ Error: "Invalid access token"

**Causa:** El token de MercadoPago es inválido o expiró.

**Solución:**

1. Verifica que el token sea correcto (copia y pega nuevamente)
2. Para testing, usa el token de **prueba** (empieza con `TEST-`)
3. Para producción, usa el token de **producción** (empieza con `APP_USR-`)
4. Verifica que no haya espacios extra en el `.env`

```env
# ❌ Incorrecto (espacios)
MERCADOPAGO_ACCESS_TOKEN = TEST-123...

# ✅ Correcto
MERCADOPAGO_ACCESS_TOKEN=TEST-123...
```

---

### ❌ Error: "At least one item is required"

**Causa:** El array de items está vacío o mal formado.

**Solución:**

Verifica que cada item tenga todos los campos requeridos:

```javascript
{
  "items": [
    {
      "title": "Producto 1",        // ✅ Requerido
      "quantity": 1,                 // ✅ Requerido
      "unit_price": 100.50,          // ✅ Requerido
      "currency_id": "ARS",          // Opcional (default: ARS)
      "description": "Descripción",  // Opcional
      "picture_url": "https://..."   // Opcional
    }
  ]
}
```

---

### ❌ Error: "400 Bad Request" al crear preferencia

**Causa:** Datos inválidos en la preferencia.

**Solución:**

Valida los datos antes de enviar:

```javascript
// Validación básica
const validarItem = (item) => {
  if (!item.title || item.title.trim() === '') {
    throw new Error('title es requerido');
  }
  if (!item.quantity || item.quantity <= 0) {
    throw new Error('quantity debe ser mayor a 0');
  }
  if (!item.unit_price || item.unit_price <= 0) {
    throw new Error('unit_price debe ser mayor a 0');
  }
  return true;
};

items.forEach(validarItem);
```

---

## Problemas con la API

### ❌ Error: "Cannot POST /api/pagos"

**Causa:** Las rutas no están configuradas correctamente.

**Solución:**

1. Verifica que las rutas estén importadas en `api/src/routes/index.ts`:

```typescript
import pagoRoutes from "./pago.routes";
// ...
router.use("/pagos", pagoRoutes);
```

2. Reinicia el servidor:

```bash
npm run dev
```

3. Verifica que el endpoint esté disponible:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/pagos/check-config
```

---

### ❌ Error: "500 Internal Server Error"

**Causa:** Error no manejado en el código.

**Solución:**

1. Revisa los logs del servidor en la consola
2. Verifica que todas las variables de entorno estén configuradas
3. Compila nuevamente el código:

```bash
cd api
npm run build
npm run dev
```

4. Si usas TypeScript, verifica errores de compilación:

```bash
npx tsc --noEmit
```

---

### ❌ Error de CORS

**Causa:** El frontend no tiene permisos para acceder a la API.

**Solución:**

Verifica la configuración de CORS en `api/src/app.ts`:

```typescript
app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "http://localhost:3000",
      "https://tu-frontend.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);
```

---

## Problemas con Webhooks

### ❌ No recibo notificaciones de webhook

**Causa:** MercadoPago no puede acceder a tu servidor local o la URL no está configurada.

**Solución para Desarrollo Local:**

1. Instala ngrok:

```bash
npm install -g ngrok
```

2. Expón tu servidor:

```bash
ngrok http 3000
```

3. Copia la URL (ej: `https://abc123.ngrok.io`)

4. Configura en MercadoPago:
   - Ve a "Tus integraciones" → "Webhooks"
   - Agrega: `https://abc123.ngrok.io/api/pagos/webhook`

5. Verifica que el endpoint responda:

```bash
curl -X POST https://abc123.ngrok.io/api/pagos/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Solución para Producción:**

Asegúrate de que:
- Tu servidor esté usando HTTPS
- El endpoint `/api/pagos/webhook` sea público
- El firewall permita conexiones de MercadoPago

---

### ❌ Error: "Payment record not found for MercadoPago payment ID"

**Causa:** El webhook llegó antes de que se creara el registro en la base de datos.

**Solución:**

Esto es normal. El sistema lo manejará automáticamente cuando:
1. El webhook se reintente (MercadoPago lo hace automáticamente)
2. O cuando consultes el estado del pago manualmente

Para debugging:

```sql
-- Verificar si el pago existe
SELECT * FROM pagos 
WHERE external_reference = 'PEDIDO-123-...';

-- Ver todos los pagos
SELECT id, external_reference, estado, created_at 
FROM pagos 
ORDER BY created_at DESC 
LIMIT 10;
```

---

### ❌ Webhook se recibe pero no actualiza el pago

**Causa:** Error en el procesamiento del webhook.

**Solución:**

1. Verifica los logs del servidor cuando llega el webhook
2. Prueba manualmente:

```bash
# Simular webhook
curl -X POST http://localhost:3000/api/pagos/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.updated",
    "data": {
      "id": "123456789"
    },
    "type": "payment"
  }'
```

3. Verifica que el pago se actualice:

```bash
curl http://localhost:3000/api/pagos/1
```

---

## Comandos Útiles para Debugging

### Verificar Estado de la Base de Datos

```sql
-- Ver todas las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Ver estructura de la tabla pagos
\d pagos

-- Ver últimos pagos creados
SELECT id, pedido_id, estado, monto, created_at 
FROM pagos 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver pagos con información del pedido
SELECT 
  pag.id, 
  pag.estado, 
  pag.monto, 
  ped.nombre_comercio,
  ped.localidad
FROM pagos pag
LEFT JOIN pedido ped ON pag.pedido_id = ped.id
ORDER BY pag.created_at DESC
LIMIT 10;

-- Ver estadísticas
SELECT estado, COUNT(*), SUM(monto) 
FROM pagos 
GROUP BY estado;

-- Ver pagos pendientes
SELECT * FROM pagos WHERE estado = 'pending';
```

### Verificar Estado de la API

```bash
# Health check
curl http://localhost:3000/api/health

# Verificar configuración de MercadoPago
curl http://localhost:3000/api/pagos/check-config

# Ver estadísticas de pagos
curl http://localhost:3000/api/pagos/stats

# Crear pago de prueba
curl -X POST http://localhost:3000/api/pagos \
  -H "Content-Type: application/json" \
  -d '{
    "pedido_id": 1,
    "items": [{"title": "Test", "quantity": 1, "unit_price": 100}]
  }'
```

### Limpiar Datos de Prueba

```sql
-- Eliminar todos los pagos de prueba
DELETE FROM pagos WHERE detalles->>'test' = 'true';

-- Eliminar pagos pendientes antiguos (más de 7 días)
DELETE FROM pagos 
WHERE estado = 'pending' 
AND created_at < NOW() - INTERVAL '7 days';

-- Reiniciar secuencia de IDs
ALTER SEQUENCE pagos_id_seq RESTART WITH 1;
```

---

## Contacto y Soporte

Si ninguna de estas soluciones funciona:

1. **Revisa los logs** del servidor para ver el error exacto
2. **Verifica las variables de entorno** están correctamente configuradas
3. **Consulta la documentación oficial** de MercadoPago
4. **Contacta soporte** de MercadoPago si el problema es con su API

---

**Enlaces Útiles:**

- [Documentación MercadoPago](https://www.mercadopago.com.ar/developers)
- [Supabase Docs](https://supabase.com/docs)
- [Postman Collection](https://www.postman.com/mercadopago)

---

**Última actualización:** Enero 2024