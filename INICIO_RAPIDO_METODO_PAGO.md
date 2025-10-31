# 🚀 Inicio Rápido - Método de Pago

## ¿Qué se implementó?

Al realizar un pedido, el usuario ahora puede elegir entre:

```
┌─────────────────────────────────────────┐
│  💳 MercadoPago                         │
│     Pagar ahora con tarjeta             │
│                                          │
│  💵 Contra Entrega                      │
│     Pagar al recibir el pedido          │
└─────────────────────────────────────────┘
```

## ⚡ Activación en 3 Pasos

### 1️⃣ Migrar Base de Datos (2 minutos)

1. Abre [Supabase](https://app.supabase.com)
2. Ve a **SQL Editor** → **New query**
3. Copia y pega esto:

```sql
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'contra_entrega';

ALTER TABLE pedidos ADD CONSTRAINT check_metodo_pago 
CHECK (metodo_pago IN ('mercadopago', 'contra_entrega'));

CREATE INDEX IF NOT EXISTS idx_pedidos_metodo_pago ON pedidos(metodo_pago);

UPDATE pedidos SET metodo_pago = 'contra_entrega' WHERE metodo_pago IS NULL;
```

4. Click **Run** ▶️

### 2️⃣ Verificar Variables de Entorno

Archivo: `api/.env`

```env
MERCADOPAGO_ACCESS_TOKEN=tu_token_aqui
FRONTEND_URL=http://localhost:4200
API_URL=http://localhost:3000
```

### 3️⃣ Reiniciar Servicios

```bash
# Terminal 1 - Backend
cd api
npm run dev

# Terminal 2 - Frontend  
cd App/CatalogoProductos/App
npm start
```

## ✅ Probar Funcionalidad

1. Abrir `http://localhost:4200`
2. Agregar productos al carrito
3. Click "Finalizar Compra"
4. **¡Verás las 2 opciones de pago!** 🎉

### Opción A: MercadoPago
```
Usuario elige MercadoPago
    ↓
Pedido se guarda
    ↓
Preference MercadoPago creada
    ↓
🆕 Modal de Confirmación aparece
    ↓
    ┌─────────────────────────────────┐
    │ ¿Ir a MercadoPago o Cambiar    │
    │ a Contra Entrega?               │
    └─────────────────────────────────┘
    ↓                    ↓
Ir a MercadoPago    Pagar Contra Entrega
    ↓                    ↓
Redirige           Pedido actualizado
    ↓                    ↓
Paga con tarjeta   Mensaje de éxito
    ↓
Pedido actualizado
```

### Opción B: Contra Entrega
```
Usuario elige Contra Entrega
    ↓
Pedido se guarda
    ↓
Mensaje: "Pagarás al recibir"
    ↓
Carrito se limpia
    ↓
Listo ✓

(No se muestra modal de confirmación)
```

## 🔍 Verificar que Funciona

### En Supabase:

```sql
SELECT id, nombre_comercio, metodo_pago, estado 
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 5;
```

Deberías ver la columna `metodo_pago` con valores:
- `mercadopago` 
- `contra_entrega`

### En el Navegador:

1. Abrir consola (F12)
2. Crear un pedido
3. Ver logs:
   - `"Pedido guardado exitosamente: {...}"`
   - Si MercadoPago: `"Pago creado exitosamente: {...}"`

## 🎨 Lo que Cambió en el Código

### Frontend (Angular)

**`customer-modal.component.ts`**
- ✅ Agregado selector de método de pago
- ✅ Radio buttons con iconos 💳 💵
- ✅ Validación requerida

**`payment-confirmation-modal.component.ts`** 🆕
- ✅ Modal de confirmación para MercadoPago
- ✅ Opción para cambiar a contra entrega
- ✅ Diseño atractivo con animaciones
- ✅ Botones claros: "Ir a MercadoPago" / "Pagar Contra Entrega"

**`cart.component.ts`**
- ✅ Lógica condicional según método elegido
- ✅ Integración con MercadoPago para pagos online
- ✅ Modal de confirmación antes de redirigir
- ✅ Actualización de pedido si usuario cambia de opinión
- ✅ Mensaje de éxito para contra entrega

**`pedido.service.ts`**
- ✅ Tipo `MetodoPagoPedido` agregado
- ✅ Campo `metodo_pago` en interfaces

### Backend (Node.js)

**`types/index.ts`**
- ✅ Tipo `MetodoPagoPedido` agregado
- ✅ Campo en interfaces de Pedido

**Base de Datos**
- ✅ Columna `metodo_pago` en tabla `pedidos`
- ✅ Constraint para validar valores
- ✅ Índice para mejor performance

## 🐛 ¿Algo no Funciona?

### ❌ "column metodo_pago does not exist"
➡️ Ejecuta el SQL del Paso 1 en Supabase

### ❌ No aparece el selector de método de pago
➡️ Limpia caché del navegador (Ctrl+Shift+R)

### ❌ No redirige a MercadoPago
➡️ Verifica `MERCADOPAGO_ACCESS_TOKEN` en `.env`

### ❌ Error al crear pedido
➡️ Revisa consola del navegador (F12) y logs del backend

## 📊 Consultas Útiles

### Ver distribución de métodos:
```sql
SELECT metodo_pago, COUNT(*) 
FROM pedidos 
GROUP BY metodo_pago;
```

### Ver pedidos pendientes de pago:
```sql
SELECT * FROM pedidos 
WHERE metodo_pago = 'contra_entrega' 
AND estado = 'Pendiente';
```

### Ver pedidos con MercadoPago:
```sql
SELECT p.*, pg.estado as estado_pago
FROM pedidos p
LEFT JOIN pagos pg ON p.id = pg.pedido_id
WHERE p.metodo_pago = 'mercadopago'
ORDER BY p.created_at DESC;
```

## 📚 Documentación Completa

- `CAMBIOS_METODO_PAGO.md` - Resumen de cambios
- `SETUP_PAYMENT_METHOD.md` - Guía detallada de instalación
- `PAYMENT_METHOD_SELECTION.md` - Documentación técnica completa

## 🎯 Testing Rápido

```
✅ Crear pedido con MercadoPago
   → ¿Aparece el modal de confirmación?
   → Opción "Ir a MercadoPago" → ¿Redirige correctamente?
   → Opción "Contra Entrega" → ¿Actualiza el pedido?
   
✅ Crear pedido con Contra Entrega
   → ¿Muestra mensaje de éxito sin modal?
   
✅ Verificar en Supabase
   → ¿Campo metodo_pago guardado correctamente?
   → ¿Se actualiza si usuario cambia de opinión?
   
✅ Probar en mobile
   → ¿Modal se ve bien en pantalla pequeña?
   → ¿Botones fáciles de tocar?
```

## 💡 Tips

- **Por defecto** se selecciona MercadoPago
- Para cambiar el default, edita `customer-modal.component.ts` línea 387
- Los mensajes se pueden personalizar en `cart.component.ts`
- El diseño del selector está en `customer-modal.component.ts` (estilos)
- El diseño del modal de confirmación está en `payment-confirmation-modal.component.ts` (estilos)
- El modal aparece **solo para MercadoPago**, no para contra entrega

## 🚀 ¡Listo!

La funcionalidad está **100% implementada y lista para usar**.

Solo falta:
1. ✅ Ejecutar SQL en Supabase
2. ✅ Reiniciar servicios
3. ✅ Probar ambas opciones
4. ✅ Verificar modal de confirmación (MercadoPago)

---

**¿Dudas?** Revisa los otros archivos de documentación o los logs del sistema.

**Última actualización:** Enero 2024