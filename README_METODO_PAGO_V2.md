# 🛒 Sistema de Selección de Método de Pago v2.0

## 🎯 Descripción

Sistema completo de checkout con selección de método de pago y **confirmación adicional antes de redirigir a MercadoPago**.

## ✨ Características Principales

### 1. Selección de Método de Pago
Los usuarios pueden elegir entre:
- 💳 **MercadoPago** - Pago online con tarjeta
- 💵 **Contra Entrega** - Pago en efectivo al recibir

### 2. 🆕 Modal de Confirmación (MercadoPago)
Después de crear el pedido con MercadoPago, aparece un modal preguntando:
> ¿Deseas ser redirigido a MercadoPago o prefieres cambiar a pago contra entrega?

**Opciones:**
- **Ir a MercadoPago** → Redirige a página de pago
- **Pagar Contra Entrega** → Actualiza el pedido automáticamente

### 3. Flujo Simplificado (Contra Entrega)
Si el usuario elige contra entrega desde el inicio:
- ✅ No aparece modal de confirmación
- ✅ Mensaje de éxito directo
- ✅ Flujo más rápido

## 🚀 Flujo de Usuario

### Opción A: MercadoPago
```
1. Agregar productos al carrito
2. Click "Finalizar Compra"
3. Seleccionar "💳 MercadoPago"
4. Completar formulario
5. Click "Realizar pedido"
6. ✅ Pedido guardado
7. 🆕 Modal aparece:
   ┌─────────────────────────────────┐
   │ ¿Ir a MercadoPago o cambiar a  │
   │ Contra Entrega?                 │
   │                                  │
   │ [💳 Ir a MercadoPago]           │
   │ [💵 Pagar Contra Entrega]       │
   └─────────────────────────────────┘
8. Usuario elige:
   - Si "Ir a MercadoPago" → Redirige
   - Si "Contra Entrega" → Pedido actualizado
```

### Opción B: Contra Entrega
```
1. Agregar productos al carrito
2. Click "Finalizar Compra"
3. Seleccionar "💵 Contra Entrega"
4. Completar formulario
5. Click "Realizar pedido"
6. ✅ Pedido guardado
7. Mensaje: "Pagarás al recibir la entrega"
8. (No aparece modal)
```

## 📦 Componentes Implementados

### Frontend (Angular)

#### 1. `CustomerModalComponent`
- Formulario de información del cliente
- Selector de método de pago (radio buttons)
- Validación de campos
- Iconos visuales 💳 💵

#### 2. 🆕 `PaymentConfirmationModalComponent`
- Modal de confirmación para MercadoPago
- Diseño atractivo con animaciones
- Dos botones grandes y claros
- No se puede cerrar haciendo clic afuera (debe elegir)

#### 3. `CartComponent`
- Orquestación del flujo completo
- Lógica condicional según método elegido
- Integración con servicios
- Manejo de estado temporal

#### 4. `PedidoService`
- Tipo `MetodoPagoPedido`
- CRUD de pedidos con método de pago
- Actualización de pedidos

#### 5. `PagoService`
- Integración con MercadoPago API
- Creación de preferences
- Manejo de respuestas

### Backend (Node.js/TypeScript)

#### 1. Types
```typescript
export type MetodoPagoPedido = "mercadopago" | "contra_entrega";
```

#### 2. Services
- `PedidoService` - CRUD de pedidos
- `MercadoPagoService` - Integración con MercadoPago
- `PagoService` - Gestión de pagos

### Base de Datos (Supabase)

```sql
-- Tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN metodo_pago TEXT DEFAULT 'contra_entrega'
CHECK (metodo_pago IN ('mercadopago', 'contra_entrega'));
```

## 🛠️ Instalación

### 1. Migración de Base de Datos

**Opción A: SQL Editor de Supabase**
```sql
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'contra_entrega';

ALTER TABLE pedidos ADD CONSTRAINT check_metodo_pago 
CHECK (metodo_pago IN ('mercadopago', 'contra_entrega'));

CREATE INDEX IF NOT EXISTS idx_pedidos_metodo_pago ON pedidos(metodo_pago);

UPDATE pedidos SET metodo_pago = 'contra_entrega' WHERE metodo_pago IS NULL;
```

**Opción B: Script Completo**
```bash
# Ejecutar en Supabase
api/sql/add_metodo_pago_to_pedidos.sql
```

**Opción C: Script Rápido**
```bash
# Ejecutar en Supabase
api/sql/quick_add_metodo_pago.sql
```

### 2. Variables de Entorno

#### Backend (`api/.env`)
```env
MERCADOPAGO_ACCESS_TOKEN=your_token_here
FRONTEND_URL=http://localhost:4200
API_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

#### Frontend (`App/CatalogoProductos/App/src/environments/`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 3. Instalar Dependencias

```bash
# Backend
cd api
npm install

# Frontend
cd App/CatalogoProductos/App
npm install
```

### 4. Iniciar Servicios

```bash
# Terminal 1 - Backend
cd api
npm run dev

# Terminal 2 - Frontend
cd App/CatalogoProductos/App
npm start
```

### 5. Verificar

1. Abrir `http://localhost:4200`
2. Agregar productos al carrito
3. Click "Finalizar Compra"
4. ✅ Verificar que aparecen las 2 opciones de pago
5. ✅ Probar flujo con MercadoPago (debe aparecer modal)
6. ✅ Probar flujo con Contra Entrega (sin modal)

## 📊 Estructura de Archivos

```
CatalogoRetorno/
├── api/
│   ├── sql/
│   │   ├── add_metodo_pago_to_pedidos.sql     ✅ Migración completa
│   │   └── quick_add_metodo_pago.sql          ✅ Migración rápida
│   ├── src/
│   │   ├── types/index.ts                     ✅ Tipos actualizados
│   │   ├── services/
│   │   │   ├── pedido.service.ts              ✅ CRUD pedidos
│   │   │   ├── pago.service.ts                ✅ Gestión pagos
│   │   │   └── mercadopago.service.ts         ✅ MercadoPago API
│   │   └── controllers/
│   │       └── pago.controller.ts
│   └── .env                                   ⚙️ Variables entorno
│
├── App/CatalogoProductos/App/
│   └── src/app/
│       ├── components/
│       │   ├── cart/
│       │   │   └── cart.component.ts          ✅ Orquestador
│       │   ├── customer-modal/
│       │   │   └── customer-modal.component.ts ✅ Formulario
│       │   └── payment-confirmation-modal/    🆕 NUEVO
│       │       └── payment-confirmation-modal.component.ts
│       └── services/
│           ├── pedido.service.ts              ✅ Servicio pedidos
│           └── pago.service.ts                ✅ Servicio pagos
│
└── Documentación/
    ├── README_METODO_PAGO_V2.md              📖 Este archivo
    ├── INICIO_RAPIDO_METODO_PAGO.md          🚀 Guía rápida
    ├── CAMBIOS_METODO_PAGO.md                📝 Resumen cambios
    ├── SETUP_PAYMENT_METHOD.md               ⚙️ Setup detallado
    ├── PAYMENT_METHOD_SELECTION.md           📚 Doc técnica
    └── FLUJO_CONFIRMACION_PAGO.md            🔄 Diagramas flujo
```

## 🎨 Personalización

### Cambiar Método por Defecto
**Archivo:** `customer-modal.component.ts` línea ~387
```typescript
paymentMethod: ["contra_entrega", [Validators.required]] // Cambiar aquí
```

### Modificar Textos del Modal
**Archivo:** `payment-confirmation-modal.component.ts`
```typescript
// Líneas 28-31
<p class="question">
  Tu mensaje personalizado aquí
</p>
```

### Ajustar Estilos del Modal
**Archivo:** `payment-confirmation-modal.component.ts`
```css
.btn-primary {
  background-color: #4a1d4a; /* Cambiar color */
}
```

### Agregar Timeout Automático
```typescript
// En PaymentConfirmationModalComponent
private autoConfirmTimeout = 30000; // 30 segundos

ngOnInit() {
  setTimeout(() => this.confirmPayment(), this.autoConfirmTimeout);
}
```

### Deshabilitar Modal de Confirmación
Si prefieres redirección directa:
```typescript
// En cart.component.ts, método createMercadoPagoPreference
// Comentar estas líneas:
// this.isPaymentConfirmationModalOpen = true;
// this.closeCustomerModal();

// Y agregar:
this.proceedToMercadoPago();
```

## 📊 Base de Datos

### Consultas Útiles

#### Ver distribución de métodos de pago
```sql
SELECT 
  metodo_pago,
  COUNT(*) as total,
  COUNT(CASE WHEN estado = 'Aprobado' THEN 1 END) as aprobados,
  COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as pendientes
FROM pedidos
GROUP BY metodo_pago;
```

#### Pedidos con cambio de método
```sql
-- Buscar pedidos que tienen preference pero son contra_entrega
SELECT p.*, pg.mercadopago_preference_id
FROM pedidos p
LEFT JOIN pagos pg ON p.id = pg.pedido_id
WHERE p.metodo_pago = 'contra_entrega'
  AND pg.mercadopago_preference_id IS NOT NULL;
```

#### Estadísticas por día
```sql
SELECT 
  DATE(created_at) as fecha,
  metodo_pago,
  COUNT(*) as cantidad
FROM pedidos
GROUP BY DATE(created_at), metodo_pago
ORDER BY fecha DESC;
```

## 🧪 Testing

### Test Manual - Checklist

#### Flujo MercadoPago Completo
- [ ] Seleccionar MercadoPago en formulario
- [ ] Completar datos del cliente
- [ ] Click "Realizar pedido"
- [ ] ✅ Verificar que pedido se guarda en DB
- [ ] ✅ Verificar que aparece modal de confirmación
- [ ] Click "Ir a MercadoPago"
- [ ] ✅ Verificar redirección correcta
- [ ] Completar pago en sandbox
- [ ] ✅ Verificar webhook actualiza estado

#### Flujo MercadoPago con Cambio
- [ ] Seleccionar MercadoPago en formulario
- [ ] Completar datos del cliente
- [ ] Click "Realizar pedido"
- [ ] ✅ Verificar que aparece modal
- [ ] Click "Pagar Contra Entrega"
- [ ] ✅ Verificar mensaje de éxito
- [ ] ✅ Verificar en DB: metodo_pago = 'contra_entrega'

#### Flujo Contra Entrega
- [ ] Seleccionar Contra Entrega en formulario
- [ ] Completar datos del cliente
- [ ] Click "Realizar pedido"
- [ ] ✅ Verificar que NO aparece modal
- [ ] ✅ Verificar mensaje de éxito directo
- [ ] ✅ Verificar en DB: metodo_pago = 'contra_entrega'

#### Responsive
- [ ] Probar en desktop (> 1024px)
- [ ] Probar en tablet (768px - 1024px)
- [ ] Probar en mobile (< 768px)
- [ ] Verificar que modal se ve bien en todos los tamaños
- [ ] Verificar que botones son fáciles de tocar en mobile

## 🐛 Troubleshooting

### Modal no aparece
**Síntoma:** Usuario selecciona MercadoPago pero no ve el modal

**Solución:**
1. Verificar consola del navegador (F12)
2. Verificar que `isPaymentConfirmationModalOpen = true`
3. Verificar imports en `cart.component.ts`
4. Limpiar caché del navegador (Ctrl+Shift+R)

### Pedido no se actualiza al cambiar método
**Síntoma:** Usuario elige "Contra Entrega" en modal pero DB no se actualiza

**Solución:**
1. Verificar logs de `updatePedido()` en backend
2. Verificar permisos de UPDATE en Supabase
3. Verificar que `tempPedidoData.id` existe
4. Ejecutar query manual:
```sql
SELECT id, metodo_pago FROM pedidos WHERE id = X;
```

### No redirige a MercadoPago
**Síntoma:** Usuario confirma pero no es redirigido

**Solución:**
1. Verificar `init_point` en response
2. Verificar pop-up blocker del navegador
3. Verificar `MERCADOPAGO_ACCESS_TOKEN` en `.env`
4. Revisar logs del backend:
```bash
# Buscar:
# "Error creating MercadoPago preference"
```

### Error: "column metodo_pago does not exist"
**Síntoma:** Error al guardar pedido

**Solución:**
Ejecutar migración en Supabase:
```sql
ALTER TABLE pedidos ADD COLUMN metodo_pago TEXT DEFAULT 'contra_entrega';
```

## 📈 Métricas Sugeridas

### Conversión
- Tasa de selección inicial (MercadoPago vs Contra Entrega)
- Tasa de confirmación en modal
- Tasa de cambio de método en modal
- Tasa de abandono en cada paso

### Comportamiento
- Tiempo promedio en modal de confirmación
- % usuarios que cambian de opinión
- Dispositivo más usado para cada método
- Hora del día con más pedidos

### Negocio
- Valor promedio de pedido por método
- Total de ventas por método
- % de pagos completados (MercadoPago)
- Tiempo de conversión a pago

## 📚 Documentación Adicional

- **[INICIO_RAPIDO_METODO_PAGO.md](./INICIO_RAPIDO_METODO_PAGO.md)** - Guía visual de 5 minutos
- **[FLUJO_CONFIRMACION_PAGO.md](./FLUJO_CONFIRMACION_PAGO.md)** - Diagramas de flujo detallados
- **[CAMBIOS_METODO_PAGO.md](./CAMBIOS_METODO_PAGO.md)** - Lista completa de cambios
- **[SETUP_PAYMENT_METHOD.md](./SETUP_PAYMENT_METHOD.md)** - Configuración paso a paso
- **[PAYMENT_METHOD_SELECTION.md](./PAYMENT_METHOD_SELECTION.md)** - Documentación técnica completa

## 🔄 Actualizaciones

### v2.0.0 (Actual)
- ✅ Modal de confirmación antes de redirigir a MercadoPago
- ✅ Opción de cambiar a contra entrega después de crear pedido
- ✅ Actualización automática de pedido en DB
- ✅ Diseño mejorado con animaciones
- ✅ Flujo simplificado para contra entrega

### v1.0.0
- ✅ Selección de método de pago
- ✅ Integración con MercadoPago
- ✅ Pago contra entrega
- ✅ Migración de base de datos

## 🎯 Próximas Mejoras

- [ ] Analytics integrado (Google Analytics / Mixpanel)
- [ ] A/B testing del modal de confirmación
- [ ] Descuentos por método de pago
- [ ] Notificaciones por email según método
- [ ] Panel admin con filtros por método
- [ ] Recordatorios automáticos (contra entrega)
- [ ] Opción de cambiar método después del pedido
- [ ] Integración con sistema de logística

## 🆘 Soporte

### Logs Útiles

**Backend:**
```bash
# Ver en la terminal donde corre npm run dev
# Buscar:
# - "Pedido guardado exitosamente"
# - "Creating MercadoPago preference"
# - "Error creating MercadoPago preference"
```

**Frontend:**
```javascript
// Abrir consola del navegador (F12)
// Buscar:
// - "Pedido guardado exitosamente"
// - "Pago creado exitosamente"
// - "Error al guardar el pedido"
// - "Error al crear el pago"
```

### Contacto
Para problemas técnicos:
1. Revisar documentación completa
2. Verificar logs del sistema
3. Consultar sección de Troubleshooting
4. Revisar issues en el repositorio

## 📄 Licencia

Este proyecto es parte del sistema CatalogoRetorno.

---

**Versión:** 2.0.0  
**Última actualización:** Enero 2024  
**Estado:** ✅ Producción Ready