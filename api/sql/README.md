# Scripts SQL para Integración de MercadoPago

Este directorio contiene los scripts SQL necesarios para crear la tabla de pagos en Supabase.

---

## 📋 ¿Qué Script Debo Usar?

### ✅ **Opción 1: Script con Foreign Key (RECOMENDADO)**

**Archivo:** `create_pagos_with_fk.sql`

**Úsalo si:**
- ✅ Ya tienes la tabla `pedido` creada en tu base de datos
- ✅ Quieres que los pagos estén relacionados con pedidos
- ✅ Quieres integridad referencial (eliminar el pedido elimina sus pagos)

**Características:**
- Crea foreign key a `pedido(id)`
- Incluye `ON DELETE CASCADE`
- Incluye vista `vista_pagos_completa` con información del pedido
- Índices optimizados
- RLS configurado

---

### ✅ **Opción 2: Script Simple (SIN Foreign Key)**

**Archivo:** `create_pagos_simple.sql`

**Úsalo si:**
- ✅ No tienes la tabla `pedido` todavía
- ✅ Tu tabla de pedidos tiene otro nombre
- ✅ Quieres crear la tabla rápidamente sin dependencias
- ✅ Prefieres agregar la foreign key más adelante

**Características:**
- Sin dependencias de otras tablas
- Más simple y rápido de ejecutar
- Puedes agregar la foreign key después
- Índices básicos
- RLS configurado

---

### ✅ **Opción 3: Script Completo (Documentación)**

**Archivo:** `create_pagos_table.sql`

**Úsalo para:**
- 📚 Referencia completa
- 📚 Ver todas las opciones disponibles
- 📚 Entender la estructura completa

Este es el script más completo con comentarios extensivos.

---

## 🚀 Cómo Ejecutar

### Paso 1: Abrir Supabase

1. Ve a tu proyecto en [Supabase](https://app.supabase.com)
2. Haz clic en el icono **SQL Editor** en el menú lateral
3. Haz clic en **+ New query**

### Paso 2: Copiar y Pegar el Script

1. Abre el archivo SQL que elegiste (ver arriba)
2. Copia TODO el contenido
3. Pégalo en el editor SQL de Supabase

### Paso 3: Ejecutar

1. Haz clic en el botón **RUN** (o presiona `Ctrl/Cmd + Enter`)
2. Espera a que termine (verás mensajes de confirmación)
3. Deberías ver: `✓ Tabla "pagos" creada exitosamente`

---

## ✅ Verificación

Después de ejecutar el script, verifica que todo funcionó:

```sql
-- 1. Verificar que la tabla existe
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'pagos';

-- 2. Ver estructura de la tabla
\d pagos

-- 3. Ver índices
SELECT indexname FROM pg_indexes 
WHERE tablename = 'pagos';

-- 4. Ver políticas RLS
SELECT policyname FROM pg_policies 
WHERE tablename = 'pagos';

-- 5. Ver vistas creadas
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%pago%';
```

---

## 🔧 Agregar Foreign Key Después

Si ejecutaste el script simple y ahora quieres agregar la relación con `pedido`:

```sql
-- Verificar que la tabla pedido existe
SELECT tablename FROM pg_tables 
WHERE tablename = 'pedido';

-- Agregar foreign key
ALTER TABLE pagos
ADD CONSTRAINT fk_pagos_pedido
FOREIGN KEY (pedido_id)
REFERENCES pedido(id)
ON DELETE CASCADE;

-- Verificar que se creó
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'pagos'::regclass;
```

---

## 📊 Estructura de la Tabla

La tabla `pagos` incluye:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGSERIAL | ID único (clave primaria) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |
| `pedido_id` | BIGINT | ID del pedido relacionado |
| `mercadopago_payment_id` | TEXT | ID del pago en MercadoPago |
| `mercadopago_preference_id` | TEXT | ID de la preferencia |
| `estado` | TEXT | Estado del pago |
| `metodo_pago` | TEXT | Método de pago usado |
| `monto` | NUMERIC | Monto del pago |
| `moneda` | TEXT | Moneda (default: ARS) |
| `external_reference` | TEXT | Referencia única |
| `fecha_aprobacion` | TIMESTAMP | Fecha de aprobación |
| `detalles` | JSONB | Detalles adicionales |

---

## 🎯 Estados de Pago

La columna `estado` puede contener:

- `pending` - Pendiente de pago
- `approved` - Aprobado
- `authorized` - Autorizado
- `in_process` - En proceso
- `in_mediation` - En mediación
- `rejected` - Rechazado
- `cancelled` - Cancelado
- `refunded` - Reembolsado
- `charged_back` - Contracargo

---

## 🔐 Row Level Security (RLS)

Las políticas configuradas permiten:

- ✅ Lectura pública (necesario para webhooks de MercadoPago)
- ✅ Creación pública (necesario para la API)
- ✅ Actualización pública (necesario para webhooks)
- ⚠️ Eliminación solo para usuarios autenticados

**IMPORTANTE para Producción:**
En producción, deberías ajustar estas políticas para ser más restrictivas según tus necesidades de seguridad.

---

## 📈 Vistas y Funciones

El script crea automáticamente:

### Vista: `vista_estadisticas_pagos`
```sql
SELECT * FROM vista_estadisticas_pagos;
```
Retorna:
- total_pagos
- pagos_aprobados
- pagos_pendientes
- pagos_rechazados
- monto_total
- monto_aprobado
- monto_promedio
- primer_pago
- ultimo_pago

### Función: `obtener_pagos_por_pedido(pedido_id)`
```sql
SELECT * FROM obtener_pagos_por_pedido(123);
```

### Función: `obtener_pagos_por_estado(estado)`
```sql
SELECT * FROM obtener_pagos_por_estado('approved');
```

### Vista: `vista_pagos_completa` (solo con foreign key)
```sql
SELECT * FROM vista_pagos_completa;
```
Incluye información del pedido asociado.

---

## 🧪 Datos de Prueba

Para insertar un pago de prueba:

```sql
INSERT INTO pagos (
  pedido_id,
  mercadopago_preference_id,
  external_reference,
  estado,
  monto,
  moneda,
  detalles
) VALUES (
  1, -- Asegúrate de que este pedido existe
  'TEST-PREF-123',
  'PEDIDO-1-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'pending',
  100.00,
  'ARS',
  '{"test": true, "environment": "development"}'::jsonb
);
```

---

## ❌ Solución de Problemas

### Error: "relation 'pedido' does not exist"

**Solución:**
- Usa el script simple (`create_pagos_simple.sql`)
- O verifica que la tabla `pedido` exista:
  ```sql
  SELECT * FROM pedido LIMIT 1;
  ```

### Error: "permission denied"

**Solución:**
- Asegúrate de ejecutar el script en el SQL Editor de Supabase
- Verifica que tu usuario tenga permisos de creación

### Error: "policy already exists"

**Solución:**
- El script incluye `DROP POLICY IF EXISTS`
- Si falla, elimina las políticas manualmente:
  ```sql
  DROP POLICY IF EXISTS "nombre_politica" ON pagos;
  ```

---

## 📚 Próximos Pasos

Después de crear la tabla:

1. ✅ Configura las variables de entorno (`.env`)
2. ✅ Obtén tus credenciales de MercadoPago
3. ✅ Inicia tu API backend
4. ✅ Verifica la configuración: `GET /api/pagos/check-config`
5. ✅ Crea tu primer pago de prueba

---

## 📖 Documentación Relacionada

- `../MERCADOPAGO_QUICKSTART.md` - Guía rápida de inicio
- `../MERCADOPAGO_INTEGRATION.md` - Documentación completa
- `../TROUBLESHOOTING_SQL.md` - Solución de problemas SQL

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. Lee el archivo `TROUBLESHOOTING_SQL.md`
2. Verifica los logs de Supabase
3. Revisa que la tabla `pedido` exista
4. Consulta la documentación de MercadoPago

---

**Última actualización:** Enero 2024
**Versión:** 1.0.0