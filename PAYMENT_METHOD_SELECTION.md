# Selección de Método de Pago

Esta documentación describe la funcionalidad de selección de método de pago implementada en el sistema de pedidos.

## Descripción General

El sistema ahora permite a los usuarios elegir entre dos métodos de pago al realizar un pedido:

1. **MercadoPago**: Pago online inmediato con tarjeta de crédito/débito
2. **Contra Entrega**: Pago en efectivo al recibir el pedido

## Flujo de Usuario

### 1. Agregar Productos al Carrito
El usuario navega por el catálogo y agrega productos a su carrito de compras.

### 2. Iniciar Checkout
Al hacer clic en "Finalizar Compra", se abre el modal de información del cliente.

### 3. Seleccionar Método de Pago
En el modal, el usuario ve dos opciones claramente diferenciadas:

```
💳 MercadoPago
   Pagar ahora con tarjeta

💵 Contra Entrega
   Pagar al recibir el pedido
```

### 4. Completar Información
El usuario completa:
- Nombre/Comercio
- Teléfono
- Email
- Localidad
- Detalles adicionales (opcional)

### 5. Confirmar Pedido

#### Si eligió MercadoPago:
1. El pedido se guarda en la base de datos con `metodo_pago: "mercadopago"`
2. Se crea una preferencia de pago en MercadoPago
3. El usuario es redirigido automáticamente a la página de pago de MercadoPago
4. Después del pago, MercadoPago redirige al usuario según el resultado:
   - Éxito → `/payment/success`
   - Fallo → `/payment/failure`
   - Pendiente → `/payment/pending`

#### Si eligió Contra Entrega:
1. El pedido se guarda en la base de datos con `metodo_pago: "contra_entrega"`
2. Se muestra un mensaje de confirmación
3. El carrito se limpia
4. El usuario puede continuar navegando

## Implementación Técnica

### Base de Datos

#### Tabla `pedidos`
Se agregó la columna `metodo_pago`:

```sql
ALTER TABLE pedidos
ADD COLUMN metodo_pago TEXT DEFAULT 'contra_entrega'
CHECK (metodo_pago IN ('mercadopago', 'contra_entrega'));
```

**Valores permitidos:**
- `mercadopago`: Pago procesado o a procesar por MercadoPago
- `contra_entrega`: Pago en efectivo al recibir el pedido

### Frontend (Angular)

#### Tipos TypeScript

```typescript
export type MetodoPagoPedido = "mercadopago" | "contra_entrega";

export interface NuevoPedido {
  nombre_comercio: string;
  telefóno: string;
  email?: string | null;
  localidad: string;
  productos: ItemPedido[];
  detalles?: string | null;
  estado?: EstadoPedido | null;
  metodo_pago?: MetodoPagoPedido | null;
}
```

#### Componente: `customer-modal.component.ts`

**Formulario actualizado:**
```typescript
this.customerForm = this.formBuilder.group({
  paymentMethod: ["mercadopago", [Validators.required]],
  name: ["", [Validators.required]],
  phone: ["", [Validators.required]],
  email: ["", [Validators.required, Validators.email]],
  location: ["", [Validators.required]],
  details: [""],
});
```

**Template HTML:**
- Radio buttons estilizados para seleccionar método de pago
- Iconos visuales (💳 y 💵)
- Descripciones claras de cada opción
- Validación requerida

#### Componente: `cart.component.ts`

**Método `handleOrderSubmission`:**
```typescript
handleOrderSubmission(orderData: any) {
  // ... preparar datos del pedido
  const pedidoData: NuevoPedido = {
    // ... otros campos
    metodo_pago: orderData.customer.paymentMethod,
  };

  this.pedidoService.createPedido(pedidoData).subscribe({
    next: (pedido) => {
      if (orderData.customer.paymentMethod === "mercadopago") {
        this.processMercadoPagoPayment(pedido, orderData);
      } else {
        // Mostrar mensaje de éxito para contra entrega
        this.alertService.showSuccess(
          "¡Gracias por su compra! Su pedido ha sido realizado con éxito. Pagarás al recibir la entrega."
        );
        this.close();
      }
    }
  });
}
```

**Método `processMercadoPagoPayment`:**
```typescript
processMercadoPagoPayment(pedido: any, orderData: any) {
  // Transformar items al formato de MercadoPago
  const items = orderData.items.map((item: CartItem) => ({
    title: item.name,
    description: `${item.weight} - ${item.name}`,
    picture_url: item.image,
    quantity: item.quantity,
    currency_id: "ARS",
    unit_price: item.priceNumeric,
  }));

  // Preparar información del pagador
  const payer = {
    name: orderData.customer.name.split(" ")[0],
    surname: orderData.customer.name.split(" ").slice(1).join(" "),
    email: orderData.customer.email,
    phone: {
      area_code: orderData.customer.phone.substring(0, 3),
      number: orderData.customer.phone.substring(3),
    },
  };

  // Crear preferencia de pago
  this.pagoService.createPago({
    pedido_id: pedido.id,
    items: items,
    payer: payer,
  }).subscribe({
    next: (response) => {
      window.location.href = response.data.init_point;
    },
    error: (error) => {
      this.alertService.showError(
        `Error al procesar el pago: ${error.message}`
      );
    }
  });
}
```

### Backend (Node.js/TypeScript)

#### Tipos TypeScript (`api/src/types/index.ts`)

```typescript
export type MetodoPagoPedido = "mercadopago" | "contra_entrega";

export interface Pedido {
  id?: number;
  created_at?: string;
  nombre_comercio?: string | null;
  telefóno?: string | null;
  email?: string | null;
  localidad?: string | null;
  productos?: ItemPedido[] | null;
  detalles?: string | null;
  estado?: EstadoPedido | null;
  metodo_pago?: MetodoPagoPedido | null;
}
```

#### Servicio de Pedidos

El servicio de pedidos (`pedido.service.ts`) ya maneja el campo `metodo_pago` automáticamente al crear o actualizar pedidos, ya que usa la interfaz `NuevoPedido` que incluye este campo.

## Estados del Pedido según Método de Pago

### Pedidos con MercadoPago
1. **Pendiente**: Pedido creado, esperando pago
2. **Aprobado**: Pago confirmado por MercadoPago
3. **En curso**: Pedido en preparación/envío
4. **Finalizado**: Pedido entregado

### Pedidos Contra Entrega
1. **Pendiente**: Pedido creado, pago pendiente para la entrega
2. **En curso**: Pedido en preparación/envío
3. **Finalizado**: Pedido entregado y pagado

## Migración de Base de Datos

### Aplicar la Migración

Ejecuta el siguiente SQL en tu base de datos Supabase:

```bash
psql -U your_user -d your_database -f api/sql/add_metodo_pago_to_pedidos.sql
```

O copia el contenido del archivo `api/sql/add_metodo_pago_to_pedidos.sql` y ejecútalo en el SQL Editor de Supabase.

### Verificación

Después de aplicar la migración, verifica:

```sql
-- Ver estructura de la tabla
\d pedidos

-- Ver distribución de métodos de pago
SELECT metodo_pago, COUNT(*) as total
FROM pedidos
GROUP BY metodo_pago;

-- Ver vista con descripciones
SELECT * FROM pedidos_con_metodo_pago LIMIT 5;
```

## Interfaz de Usuario

### Diseño del Selector

El selector de método de pago tiene:
- **Diseño claro**: Dos opciones grandes y fáciles de tocar
- **Iconos visuales**: 💳 para tarjeta, 💵 para efectivo
- **Descripciones**: Texto explicativo bajo cada opción
- **Feedback visual**: Borde y fondo destacados al seleccionar
- **Responsive**: Funciona bien en móviles y escritorio

### CSS Destacado

```css
.payment-option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: #4a1d4a;
  background-color: #f8f4ee;
}

.payment-option:has(input[type="radio"]:checked) {
  border-color: #4a1d4a;
  background-color: #f8f4ee;
}
```

## Mensajes al Usuario

### MercadoPago
- **Al crear pedido**: "Pedido creado. Redirigiendo a MercadoPago..."
- **Error en pago**: "Error al procesar el pago: [detalle]. Tu pedido fue guardado pero no se pudo iniciar el pago."

### Contra Entrega
- **Al crear pedido**: "¡Gracias por su compra! Su pedido ha sido realizado con éxito. Pagarás al recibir la entrega."

## Consultas Útiles

### Ver pedidos por método de pago

```sql
SELECT
  id,
  nombre_comercio,
  estado,
  metodo_pago,
  created_at
FROM pedidos
WHERE metodo_pago = 'contra_entrega'
ORDER BY created_at DESC;
```

### Estadísticas de métodos de pago

```sql
SELECT
  metodo_pago,
  estado,
  COUNT(*) as cantidad,
  SUM((productos::json->0->>'precio')::numeric * (productos::json->0->>'quantity')::numeric) as total_estimado
FROM pedidos
GROUP BY metodo_pago, estado
ORDER BY metodo_pago, estado;
```

### Pedidos pendientes de pago (contra entrega)

```sql
SELECT *
FROM pedidos
WHERE metodo_pago = 'contra_entrega'
  AND estado IN ('Pendiente', 'En curso')
ORDER BY created_at DESC;
```

## Próximas Mejoras

### Funcionalidades Futuras
- [ ] Notificación por email según método de pago seleccionado
- [ ] Panel de administración para ver métodos de pago
- [ ] Reportes de ventas por método de pago
- [ ] Opción de cambiar método de pago antes de envío
- [ ] Descuentos especiales por método de pago
- [ ] Recordatorio de pago pendiente para contra entrega
- [ ] Confirmación de pago recibido para contra entrega

### Integraciones Potenciales
- Sistema de facturación
- Sistema de logística (considerar método de pago al coordinar entrega)
- CRM para seguimiento de cobros contra entrega

## Troubleshooting

### El campo metodo_pago no se guarda
1. Verifica que la migración SQL se ejecutó correctamente
2. Verifica que el formulario incluye el campo `paymentMethod`
3. Revisa los logs del backend para ver si hay errores de validación

### Error al redirigir a MercadoPago
1. Verifica que `MERCADOPAGO_ACCESS_TOKEN` está configurado
2. Verifica que los items tienen precio > 0
3. Revisa los logs para ver el error específico de MercadoPago
4. Confirma que `FRONTEND_URL` está correctamente configurado para las URLs de retorno

### Los pedidos contra entrega no se crean
1. Verifica que el servicio `PedidoService` está inyectado correctamente
2. Revisa la consola del navegador para errores
3. Verifica que el backend puede recibir el campo `metodo_pago`

## Seguridad

### Consideraciones
- ✅ El método de pago se valida en el frontend con restricciones de tipo
- ✅ El método de pago tiene constraint CHECK en la base de datos
- ✅ Los pedidos con MercadoPago no se marcan como "Aprobado" hasta confirmar el pago
- ⚠️ Asegurar que solo usuarios autorizados pueden cambiar el método de pago de un pedido existente
- ⚠️ Implementar validación adicional en el backend para el campo metodo_pago

## Soporte

Para preguntas o problemas:
1. Revisa los logs del backend (`api/logs` o consola del servidor)
2. Revisa la consola del navegador (F12 → Console)
3. Verifica la configuración de variables de entorno
4. Consulta la documentación de MercadoPago en caso de errores de pago

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0