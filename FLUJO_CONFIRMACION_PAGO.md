# 🔄 Flujo de Confirmación de Pago

Este documento describe el flujo completo del sistema de selección de método de pago con confirmación adicional.

## 📊 Diagrama de Flujo General

```
                    INICIO
                      │
                      ▼
        ┌─────────────────────────┐
        │  Usuario agrega         │
        │  productos al carrito   │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Click "Finalizar       │
        │  Compra"                │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Modal: Información     │
        │  del Cliente            │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Seleccionar Método     │
        │  de Pago                │
        └─────────────────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
            ▼                   ▼
    ┌──────────────┐    ┌──────────────┐
    │ MercadoPago  │    │   Contra     │
    │              │    │   Entrega    │
    └──────────────┘    └──────────────┘
            │                   │
            ▼                   ▼
      FLUJO A               FLUJO B
```

---

## 🅰️ FLUJO A: MercadoPago (CON CONFIRMACIÓN)

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario completa formulario                 │
│    - Nombre/Comercio                            │
│    - Teléfono                                   │
│    - Email                                      │
│    - Localidad                                  │
│    - Detalles (opcional)                        │
│    ✅ Método: MercadoPago                       │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 2. Click "Realizar pedido"                     │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 3. Backend: Guardar Pedido en DB                │
│    Estado: "Pendiente"                          │
│    Método: "mercadopago"                        │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 4. Backend: Crear Preference en MercadoPago    │
│    - Items                                      │
│    - Payer info                                 │
│    - Back URLs                                  │
│    → Obtiene: init_point (URL de pago)          │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 5. 🆕 MODAL DE CONFIRMACIÓN APARECE             │
│                                                 │
│   ╔═══════════════════════════════════════╗     │
│   ║  💳 Confirmar Método de Pago         ║     │
│   ╠═══════════════════════════════════════╣     │
│   ║                                       ║     │
│   ║  Tu pedido ha sido registrado        ║     │
│   ║  exitosamente.                       ║     │
│   ║                                       ║     │
│   ║  ¿Deseas ser redirigido a            ║     │
│   ║  MercadoPago para completar el       ║     │
│   ║  pago ahora?                         ║     │
│   ║                                       ║     │
│   ║  ┌─────────────────────────────────┐ ║     │
│   ║  │  💳 Ir a MercadoPago            │ ║     │
│   ║  └─────────────────────────────────┘ ║     │
│   ║                                       ║     │
│   ║  ┌─────────────────────────────────┐ ║     │
│   ║  │  💵 Pagar Contra Entrega        │ ║     │
│   ║  └─────────────────────────────────┘ ║     │
│   ╚═══════════════════════════════════════╝     │
└─────────────────────────────────────────────────┘
                     │
           ┌─────────┴──────────┐
           │                    │
           ▼                    ▼
    ┌──────────────┐    ┌────────────────┐
    │ Opción 1:    │    │  Opción 2:     │
    │ Ir a         │    │  Cambiar a     │
    │ MercadoPago  │    │  Contra Entrega│
    └──────────────┘    └────────────────┘
           │                    │
           │                    │
           ▼                    ▼
    ┌──────────────┐    ┌────────────────┐
    │ 6a. Mensaje: │    │ 6b. Backend:   │
    │ "Redirigiendo│    │ Actualizar     │
    │ a MercadoPago"│   │ Pedido en DB   │
    └──────────────┘    │ metodo_pago =  │
           │            │ "contra_entrega"│
           ▼            └────────────────┘
    ┌──────────────┐            │
    │ 7a. window.  │            ▼
    │ location =   │    ┌────────────────┐
    │ init_point   │    │ 7b. Mensaje:   │
    └──────────────┘    │ "Pagarás al    │
           │            │ recibir entrega"│
           ▼            └────────────────┘
    ┌──────────────┐            │
    │ 8a. Página   │            ▼
    │ MercadoPago  │    ┌────────────────┐
    │ - Tarjeta    │    │ 8b. Carrito    │
    │ - Otros      │    │ limpiado       │
    └──────────────┘    └────────────────┘
           │                    │
           ▼                    ▼
    ┌──────────────┐         [FIN]
    │ 9a. Usuario  │
    │ completa pago│
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ 10a. Webhook │
    │ actualiza    │
    │ estado pedido│
    └──────────────┘
           │
           ▼
         [FIN]
```

---

## 🅱️ FLUJO B: Contra Entrega (SIN CONFIRMACIÓN)

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario completa formulario                 │
│    - Nombre/Comercio                            │
│    - Teléfono                                   │
│    - Email                                      │
│    - Localidad                                  │
│    - Detalles (opcional)                        │
│    ✅ Método: Contra Entrega                    │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 2. Click "Realizar pedido"                     │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 3. Backend: Guardar Pedido en DB                │
│    Estado: "Pendiente"                          │
│    Método: "contra_entrega"                     │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 4. Mensaje de Éxito:                           │
│    "¡Gracias por su compra!                     │
│     Pagarás al recibir la entrega."            │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 5. Carrito limpiado                             │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 6. Modal cerrado automáticamente                │
└─────────────────────────────────────────────────┘
                     │
                     ▼
                   [FIN]

📝 NOTA: No se crea preference de MercadoPago
📝 NOTA: No aparece modal de confirmación
📝 NOTA: Flujo más simple y directo
```

---

## 🎯 Decisiones Clave del Usuario

### Decisión 1: Método de Pago Inicial
**Cuándo:** En el modal de información del cliente  
**Opciones:**
- 💳 MercadoPago - Pagar ahora con tarjeta
- 💵 Contra Entrega - Pagar al recibir el pedido

**Impacto:**
- Si elige MercadoPago → Continúa al modal de confirmación
- Si elige Contra Entrega → Flujo simple sin confirmación adicional

### Decisión 2: Confirmación Final (Solo MercadoPago)
**Cuándo:** Después de crear el pedido y la preference  
**Opciones:**
- 💳 Ir a MercadoPago - Mantener decisión inicial
- 💵 Pagar Contra Entrega - Cambiar de opinión

**Impacto:**
- Si confirma MercadoPago → Redirige a página de pago
- Si cambia a Contra Entrega → Pedido se actualiza en DB

---

## 🔄 Estados del Pedido en Base de Datos

### Estado Inicial (Ambos métodos)
```sql
INSERT INTO pedidos (
  nombre_comercio,
  telefono,
  email,
  localidad,
  productos,
  detalles,
  estado,
  metodo_pago,
  created_at
) VALUES (
  'Comercio X',
  '123456789',
  'email@ejemplo.com',
  'Montevideo',
  '[{...}]',
  'Detalles adicionales',
  'Pendiente',        -- Estado inicial
  'mercadopago',      -- o 'contra_entrega'
  NOW()
);
```

### Si Usuario Cambia de Opinión
```sql
-- El pedido YA fue creado con metodo_pago = 'mercadopago'
-- Usuario elige "Pagar Contra Entrega" en el modal

UPDATE pedidos
SET metodo_pago = 'contra_entrega'
WHERE id = 123;

-- Resultado:
-- ✅ Pedido actualizado
-- ✅ No se usa la preference de MercadoPago
-- ✅ Usuario no es redirigido
```

---

## 📱 Componentes del Frontend

### 1. CustomerModalComponent
**Responsabilidad:** Capturar información del cliente y método de pago inicial

**Inputs:**
- isOpen: boolean

**Outputs:**
- closeEvent: void
- orderSubmitted: {customer, items, totalPrice, date}

**Datos enviados:**
```typescript
{
  customer: {
    name: string,
    phone: string,
    email: string,
    location: string,
    details: string,
    paymentMethod: 'mercadopago' | 'contra_entrega'
  },
  items: CartItem[],
  totalPrice: number,
  date: Date
}
```

### 2. PaymentConfirmationModalComponent 🆕
**Responsabilidad:** Confirmar método de pago antes de redirigir a MercadoPago

**Inputs:**
- isOpen: boolean

**Outputs:**
- confirm: void (Usuario elige ir a MercadoPago)
- changePaymentMethod: void (Usuario cambia a contra entrega)
- closeEvent: void

**Cuándo aparece:**
- Solo si paymentMethod === 'mercadopago'
- Después de crear pedido y preference
- Antes de redirigir a MercadoPago

**Cuándo NO aparece:**
- Si paymentMethod === 'contra_entrega'

### 3. CartComponent
**Responsabilidad:** Orquestar todo el flujo de checkout

**Estado interno:**
```typescript
{
  isCustomerModalOpen: boolean,
  isPaymentConfirmationModalOpen: boolean,
  tempPaymentData: any,        // Datos de MercadoPago
  tempPedidoData: any          // Datos del pedido
}
```

**Métodos principales:**
- `handleOrderSubmission()` - Procesar formulario del cliente
- `createMercadoPagoPreference()` - Crear preference de pago
- `proceedToMercadoPago()` - Redirigir a pago
- `changeToContraEntrega()` - Actualizar pedido

---

## 🎨 Experiencia de Usuario

### Escenario 1: Usuario Seguro de Pagar Online
```
1. Selecciona "MercadoPago" ✅
2. Completa formulario
3. Click "Realizar pedido"
4. Ve modal de confirmación
5. Click "Ir a MercadoPago" 💳
6. Redirigido a página de pago
7. Completa transacción
8. ✅ Pedido pagado
```

### Escenario 2: Usuario Indeciso
```
1. Selecciona "MercadoPago" 💭
2. Completa formulario
3. Click "Realizar pedido"
4. Ve modal de confirmación
5. Piensa: "Mejor pago al recibir" 🤔
6. Click "Pagar Contra Entrega" 💵
7. Pedido actualizado automáticamente
8. ✅ Pedido registrado para pago contra entrega
```

### Escenario 3: Usuario Prefiere Efectivo
```
1. Selecciona "Contra Entrega" ✅
2. Completa formulario
3. Click "Realizar pedido"
4. NO ve modal de confirmación
5. Mensaje de éxito directo
6. ✅ Pedido registrado para pago contra entrega
```

---

## 💡 Ventajas de Este Flujo

### ✅ Para el Usuario
1. **Flexibilidad:** Puede cambiar de opinión hasta el último momento
2. **Transparencia:** Sabe exactamente qué va a pasar antes de la redirección
3. **Sin presión:** Tiene tiempo para decidir
4. **Confirmación visual:** Sabe que su pedido está guardado

### ✅ Para el Negocio
1. **Menos abandonos:** Usuario puede elegir pagar después si no quiere usar tarjeta ahora
2. **Pedidos guardados:** Aunque no pague online, el pedido está registrado
3. **Datos capturados:** Información del cliente guardada en ambos casos
4. **Conversión mejorada:** Más opciones = más probabilidad de completar pedido

### ✅ Técnicas
1. **Pedido ya guardado:** No se pierde información si usuario cancela
2. **Preference creada:** MercadoPago ya está listo si usuario confirma
3. **Actualización simple:** Solo un UPDATE si cambia de opinión
4. **Sin riesgo:** Si algo falla en MercadoPago, pedido ya existe

---

## 🔐 Seguridad y Validación

### Validaciones Frontend
```typescript
// En CustomerModalComponent
paymentMethod: ['mercadopago', [Validators.required]]

// Valores permitidos
type MetodoPagoPedido = 'mercadopago' | 'contra_entrega';
```

### Validaciones Backend
```sql
-- Constraint en base de datos
ALTER TABLE pedidos ADD CONSTRAINT check_metodo_pago
CHECK (metodo_pago IN ('mercadopago', 'contra_entrega'));
```

### Verificaciones en Tiempo Real
```typescript
// Antes de redirigir
if (!response.data?.init_point && !response.init_point) {
  console.error('No init_point found');
  this.alertService.showError('Error: No se pudo obtener el link de pago');
  return;
}
```

---

## 📊 Métricas Sugeridas

### Conversión
- % usuarios que seleccionan MercadoPago inicialmente
- % usuarios que confirman ir a MercadoPago
- % usuarios que cambian a contra entrega en modal
- % usuarios que completan pago en MercadoPago

### Comportamiento
- Tiempo promedio en modal de confirmación
- Tasa de abandono en cada paso
- Dispositivos más usados (mobile vs desktop)

### Negocio
- Total pedidos por método de pago
- Valor promedio por método
- Conversión a pago completado

---

## 🛠️ Personalización

### Cambiar Textos del Modal
Editar: `payment-confirmation-modal.component.ts`
```typescript
// Línea ~28
<p class="question">
  ¿Deseas ser redirigido a <strong>MercadoPago</strong>...
</p>
```

### Agregar Timeout Automático
```typescript
// En PaymentConfirmationModalComponent
private timeout?: any;

ngOnInit() {
  // Auto-confirmar después de 30 segundos
  this.timeout = setTimeout(() => {
    this.confirmPayment();
  }, 30000);
}

ngOnDestroy() {
  if (this.timeout) {
    clearTimeout(this.timeout);
  }
}
```

### Deshabilitar Modal de Confirmación
Si prefieres redirección directa sin confirmación:
```typescript
// En cart.component.ts, método createMercadoPagoPreference
// Reemplazar esto:
this.isPaymentConfirmationModalOpen = true;

// Por esto:
this.proceedToMercadoPago();
```

---

## 🐛 Troubleshooting

### Modal no aparece
- ✅ Verificar que `isPaymentConfirmationModalOpen = true`
- ✅ Verificar z-index del modal (debe ser > 1000)
- ✅ Verificar imports en `cart.component.ts`

### Usuario cambia pero pedido no se actualiza
- ✅ Verificar `tempPedidoData.id` existe
- ✅ Verificar logs de `updatePedido()`
- ✅ Verificar permisos en Supabase

### No redirige a MercadoPago
- ✅ Verificar `init_point` en response
- ✅ Verificar logs de consola
- ✅ Verificar que no hay pop-up blocker

---

**Última actualización:** Enero 2024  
**Versión:** 2.0.0 (Con modal de confirmación)