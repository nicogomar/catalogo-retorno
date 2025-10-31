# Configuración de Métodos de Pago

Este documento describe los pasos necesarios para configurar la nueva funcionalidad de selección de método de pago en el sistema.

## 📋 Requisitos Previos

- Base de datos Supabase configurada y funcionando
- Backend API ejecutándose
- Frontend Angular configurado
- Variables de entorno de MercadoPago configuradas (si se usará pago online)

## 🚀 Pasos de Instalación

### 1. Migración de Base de Datos

Primero, necesitas agregar el campo `metodo_pago` a la tabla `pedidos` en Supabase.

#### Opción A: Usando SQL Editor de Supabase

1. Accede a tu proyecto en [Supabase](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `api/sql/add_metodo_pago_to_pedidos.sql`
5. Haz clic en **Run** para ejecutar la migración

#### Opción B: Usando CLI de Supabase (si tienes configurado)

```bash
cd api
supabase db push
```

#### Opción C: Manualmente con psql

```bash
cd api/sql
psql -U your_username -d your_database -f add_metodo_pago_to_pedidos.sql
```

### 2. Verificar la Migración

Ejecuta la siguiente query en el SQL Editor de Supabase para verificar que la columna se agregó correctamente:

```sql
-- Verificar estructura de la tabla
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'pedidos' AND column_name = 'metodo_pago';

-- Verificar constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'check_metodo_pago';

-- Ver vista creada
SELECT * FROM pedidos_con_metodo_pago LIMIT 1;
```

**Resultado esperado:**
```
column_name  | data_type | column_default
-------------+-----------+------------------
metodo_pago  | text      | 'contra_entrega'
```

### 3. Actualizar Pedidos Existentes (Opcional)

Si tienes pedidos existentes en la base de datos, se les asignará automáticamente el método de pago `contra_entrega`. Si deseas cambiar algunos a `mercadopago`, ejecuta:

```sql
-- Actualizar pedidos específicos
UPDATE pedidos
SET metodo_pago = 'mercadopago'
WHERE id IN (1, 2, 3); -- IDs de los pedidos que fueron pagados con MercadoPago

-- O actualizar todos los pedidos con estado "Aprobado" que tienen pago asociado
UPDATE pedidos p
SET metodo_pago = 'mercadopago'
FROM pagos pg
WHERE p.id = pg.pedido_id
  AND pg.estado = 'approved';
```

### 4. Instalar Dependencias del Frontend (si es necesario)

```bash
cd App/CatalogoProductos/App
npm install
```

### 5. Verificar Variables de Entorno

#### Backend (`api/.env`)

Asegúrate de que estas variables estén configuradas:

```env
# MercadoPago (requerido para pagos online)
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here

# URLs para redirección
FRONTEND_URL=http://localhost:4200
API_URL=http://localhost:3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Frontend (`App/CatalogoProductos/App/src/environments/`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 6. Reiniciar Servicios

#### Backend
```bash
cd api
npm run dev
```

#### Frontend
```bash
cd App/CatalogoProductos/App
npm start
```

## ✅ Verificación de la Instalación

### Test 1: Crear Pedido con Contra Entrega

1. Abre la aplicación en tu navegador: `http://localhost:4200`
2. Agrega productos al carrito
3. Haz clic en "Finalizar Compra"
4. Selecciona **"Contra Entrega"**
5. Completa el formulario
6. Haz clic en "Realizar pedido"
7. **Esperado:** Mensaje de éxito sin redirección a MercadoPago

Verificar en la base de datos:
```sql
SELECT id, nombre_comercio, metodo_pago, estado
FROM pedidos
ORDER BY created_at DESC
LIMIT 1;
```

Debe mostrar: `metodo_pago = 'contra_entrega'`

### Test 2: Crear Pedido con MercadoPago

1. Agrega productos al carrito
2. Haz clic en "Finalizar Compra"
3. Selecciona **"MercadoPago"**
4. Completa el formulario
5. Haz clic en "Realizar pedido"
6. **Esperado:** Redirección a página de pago de MercadoPago

Verificar en la base de datos:
```sql
SELECT p.id, p.nombre_comercio, p.metodo_pago, pg.mercadopago_preference_id
FROM pedidos p
LEFT JOIN pagos pg ON p.id = pg.pedido_id
ORDER BY p.created_at DESC
LIMIT 1;
```

Debe mostrar: `metodo_pago = 'mercadopago'` y un `mercadopago_preference_id` válido

### Test 3: Verificar Logs

**Backend:**
```bash
# Deberías ver logs como:
# "Creating MercadoPago preference: {...}"
# "Pedido guardado exitosamente: X"
```

**Frontend (Consola del navegador):**
```bash
# Para MercadoPago:
# "Pedido guardado exitosamente: {...}"
# "Pago creado exitosamente: {...}"

# Para Contra Entrega:
# "Pedido guardado exitosamente: {...}"
```

## 🎨 Personalización

### Modificar Mensajes de Confirmación

Edita: `App/CatalogoProductos/App/src/app/components/cart/cart.component.ts`

```typescript
// Para contra entrega (línea ~501)
this.alertService.showSuccess(
  "¡Tu mensaje personalizado aquí!"
);

// Para MercadoPago (línea ~547)
this.alertService.showSuccess(
  "Tu mensaje antes de redirección"
);
```

### Modificar Estilos del Selector

Edita: `App/CatalogoProductos/App/src/app/components/customer-modal/customer-modal.component.ts`

Busca la sección de estilos `.payment-option` y ajusta colores, tamaños, etc.

### Cambiar Método de Pago por Defecto

Edita: `App/CatalogoProductos/App/src/app/components/customer-modal/customer-modal.component.ts`

```typescript
// Línea ~387
paymentMethod: ["contra_entrega", [Validators.required]], // Cambiar a "contra_entrega"
```

## 📊 Consultas Útiles

### Estadísticas de Métodos de Pago

```sql
SELECT
  metodo_pago,
  COUNT(*) as total_pedidos,
  COUNT(CASE WHEN estado = 'Aprobado' THEN 1 END) as aprobados,
  COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as pendientes
FROM pedidos
GROUP BY metodo_pago;
```

### Pedidos Pendientes por Método

```sql
SELECT *
FROM pedidos_con_metodo_pago
WHERE estado = 'Pendiente'
ORDER BY created_at DESC;
```

### Verificar Pagos Asociados

```sql
SELECT
  p.id as pedido_id,
  p.nombre_comercio,
  p.metodo_pago as metodo_pedido,
  pg.estado as estado_pago,
  pg.monto,
  pg.mercadopago_payment_id
FROM pedidos p
LEFT JOIN pagos pg ON p.id = pg.pedido_id
WHERE p.metodo_pago = 'mercadopago'
ORDER BY p.created_at DESC;
```

## 🐛 Troubleshooting

### Error: "column metodo_pago does not exist"

**Causa:** La migración no se ejecutó correctamente.

**Solución:**
1. Verifica que ejecutaste el script SQL
2. Verifica la conexión a la base de datos
3. Ejecuta manualmente:
   ```sql
   ALTER TABLE pedidos ADD COLUMN metodo_pago TEXT DEFAULT 'contra_entrega';
   ```

### Error: "Cannot find module 'pago.service'"

**Causa:** El servicio de pagos no está en el directorio correcto.

**Solución:**
1. Verifica que existe: `App/CatalogoProductos/App/src/app/services/pago.service.ts`
2. Si no existe, cópialo desde `App/src/app/services/pago.service.ts`

### No se Redirige a MercadoPago

**Causa:** Posibles problemas con la configuración de MercadoPago.

**Solución:**
1. Verifica `MERCADOPAGO_ACCESS_TOKEN` en `.env`
2. Revisa logs del backend para errores
3. Verifica que `FRONTEND_URL` esté correctamente configurado
4. En desarrollo, asegúrate de que auto_return esté deshabilitado para localhost

### Pedidos se Crean pero no se Guarda el metodo_pago

**Causa:** El tipo no coincide entre frontend y backend.

**Solución:**
1. Verifica que ambos servicios usen los mismos tipos:
   - `"mercadopago"` (no `"MercadoPago"` o `"mercado_pago"`)
   - `"contra_entrega"` (no `"contraEntrega"` o `"cash_on_delivery"`)
2. Verifica el constraint en la base de datos:
   ```sql
   SELECT * FROM information_schema.check_constraints
   WHERE constraint_name = 'check_metodo_pago';
   ```

## 📝 Rollback (Revertir Cambios)

Si necesitas revertir la funcionalidad:

```sql
-- Eliminar constraint
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS check_metodo_pago;

-- Eliminar índice
DROP INDEX IF EXISTS idx_pedidos_metodo_pago;

-- Eliminar vista
DROP VIEW IF EXISTS pedidos_con_metodo_pago;

-- Eliminar columna (CUIDADO: esto borrará los datos)
ALTER TABLE pedidos DROP COLUMN IF EXISTS metodo_pago;
```

## 📚 Documentación Adicional

- [PAYMENT_METHOD_SELECTION.md](./PAYMENT_METHOD_SELECTION.md) - Documentación técnica completa
- [api/MERCADOPAGO_INTEGRATION.md](./api/MERCADOPAGO_INTEGRATION.md) - Integración con MercadoPago
- [Documentación de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs)

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs:**
   - Backend: Terminal donde corre `npm run dev`
   - Frontend: Consola del navegador (F12)

2. **Verifica la base de datos:**
   - SQL Editor de Supabase
   - Ejecuta las queries de verificación

3. **Consulta la documentación:**
   - Lee PAYMENT_METHOD_SELECTION.md
   - Revisa los comentarios en el código

4. **Debug paso a paso:**
   - Pon breakpoints en `cart.component.ts`
   - Revisa los valores del formulario
   - Verifica la respuesta del API

## ✨ Próximos Pasos

Una vez que la funcionalidad esté funcionando:

- [ ] Configurar notificaciones por email según método de pago
- [ ] Crear panel de administración para filtrar por método de pago
- [ ] Implementar reportes de ventas por método
- [ ] Agregar opción de descuento para pagos online
- [ ] Configurar recordatorios para pagos contra entrega pendientes

---

**Última actualización:** Enero 2024
**Versión:** 1.0.0