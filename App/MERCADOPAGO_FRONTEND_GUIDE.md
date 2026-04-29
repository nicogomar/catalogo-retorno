# 🎨 Guía de Implementación Frontend - MercadoPago

Esta guía explica cómo está integrado MercadoPago en el frontend Angular y cómo usarlo.

---

## 📋 Tabla de Contenidos

1. [Resumen de la Integración](#resumen-de-la-integración)
2. [Archivos Creados](#archivos-creados)
3. [Flujo de Pago](#flujo-de-pago)
4. [Servicios](#servicios)
5. [Componentes](#componentes)
6. [Rutas](#rutas)
7. [Uso Básico](#uso-básico)
8. [Personalización](#personalización)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen de la Integración

### ¿Qué se ha implementado?

✅ **Servicio de Pagos** - `pago.service.ts`
- Comunicación con la API de pagos
- Métodos para crear y consultar pagos
- Helpers para formatear datos

✅ **Flujo en el Carrito** - `cart.component.ts`
- Integración automática al finalizar compra
- Creación de pedido + pago en un solo flujo
- Redirección automática a MercadoPago

✅ **Páginas de Resultado** - `payment-success/failure/pending`
- Página de éxito con detalles del pago
- Página de rechazo con opciones
- Página de pago pendiente con timeline

✅ **Rutas Configuradas**
- `/payment/success` - Pago exitoso
- `/payment/failure` - Pago rechazado
- `/payment/pending` - Pago pendiente

---

## 📁 Archivos Creados

```
App/src/app/
├── services/
│   └── pago.service.ts                    # ⭐ Servicio principal
├── components/
│   ├── cart/
│   │   └── cart.component.ts              # ✅ Modificado
│   ├── payment-success/
│   │   └── payment-success.component.ts   # 🆕 Nuevo
│   ├── payment-failure/
│   │   └── payment-failure.component.ts   # 🆕 Nuevo
│   └── payment-pending/
│       └── payment-pending.component.ts   # 🆕 Nuevo
└── app.routes.ts                          # ✅ Actualizado
```

---

## 🔄 Flujo de Pago

### Diagrama del Flujo Completo

```
1. Usuario agrega productos al carrito
   ↓
2. Click en "Finalizar Compra"
   ↓
3. Modal de información del cliente
   ↓
4. Usuario completa datos (nombre, email, teléfono, etc.)
   ↓
5. Submit del formulario
   ↓
6. [BACKEND] Se crea el pedido en la BD
   ↓
7. [BACKEND] Se crea el pago en MercadoPago
   ↓
8. [BACKEND] Se devuelve init_point
   ↓
9. [FRONTEND] Se limpia el carrito
   ↓
10. [FRONTEND] Redirección a MercadoPago (init_point)
    ↓
11. Usuario completa el pago en MercadoPago
    ↓
12. MercadoPago envía webhook al backend
    ↓
13. Backend actualiza el estado del pago
    ↓
14. MercadoPago redirige al usuario
    ↓
15. Usuario llega a /payment/success o /payment/failure
```

### Código del Flujo (cart.component.ts)

```typescript
handleOrderSubmission(orderData: any) {
  // 1. Preparar datos del pedido
  const pedidoData: NuevoPedido = {
    nombre_comercio: orderData.customer.name,
    telefóno: orderData.customer.phone,
    email: orderData.customer.email,
    localidad: orderData.customer.location,
    productos: transformedProducts,
    estado: "Pendiente"
  };

  // 2. Crear pedido y luego pago
  this.pedidoService.createPedido(pedidoData)
    .pipe(
      switchMap((pedido) => {
        // 3. Preparar datos del pago
        const pagoData: NuevoPago = {
          pedido_id: pedido.id!,
          items: mercadoPagoItems,
          payer: payerInfo
        };
        // 4. Crear pago
        return this.pagoService.createPago(pagoData);
      })
    )
    .subscribe({
      next: (pagoResponse) => {
        // 5. Limpiar carrito
        this.cartService.clearCart();
        // 6. Redirigir a MercadoPago
        this.pagoService.redirectToMercadoPago(pagoResponse.init_point);
      },
      error: (error) => {
        this.alertService.showError(error.message);
      }
    });
}
```

---

## 🛠️ Servicios

### PagoService

**Ubicación:** `src/app/services/pago.service.ts`

#### Métodos Principales

```typescript
// Crear un pago
createPago(pagoData: NuevoPago): Observable<PagoResponse>

// Obtener pago por ID
getPagoById(id: number): Observable<Pago>

// Obtener pagos de un pedido
getPagosByPedidoId(pedidoId: number): Observable<Pago[]>

// Obtener pago por referencia externa
getPagoByExternalReference(reference: string): Observable<Pago>

// Obtener estadísticas
getPagoStats(): Observable<PagoStats>

// Verificar configuración
checkConfig(): Observable<{ configured: boolean; message: string }>

// Redirigir a MercadoPago
redirectToMercadoPago(initPoint: string): void

// Formatear estado
formatEstado(estado: EstadoPago): string

// Obtener color del estado
getEstadoColor(estado: EstadoPago): string
```

#### Ejemplo de Uso

```typescript
import { PagoService, NuevoPago } from './services/pago.service';

constructor(private pagoService: PagoService) {}

crearPago() {
  const pagoData: NuevoPago = {
    pedido_id: 123,
    items: [
      {
        title: 'Producto 1',
        quantity: 1,
        unit_price: 100.50,
        currency_id: 'ARS'
      }
    ],
    payer: {
      email: 'cliente@example.com',
      name: 'Juan',
      surname: 'Pérez'
    }
  };

  this.pagoService.createPago(pagoData).subscribe({
    next: (response) => {
      console.log('Pago creado:', response);
      // Redirigir a MercadoPago
      this.pagoService.redirectToMercadoPago(response.init_point);
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}
```

---

## 🧩 Componentes

### 1. PaymentSuccessComponent

**Ubicación:** `src/app/components/payment-success/`

**Propósito:** Mostrar confirmación de pago exitoso

**Características:**
- ✅ Muestra detalles del pago
- ✅ Información del pedido
- ✅ Botones de acción (volver al inicio, ver pedido)
- ✅ Diseño responsive
- ✅ Animaciones suaves

**Query Params Esperados:**
- `payment_id` - ID del pago en MercadoPago
- `external_reference` - Referencia del pedido
- `collection_status` - Estado de la cobranza

**Ejemplo de URL:**
```
http://localhost:4200/payment/success?payment_id=123456&external_reference=PEDIDO-1-1234567890
```

### 2. PaymentFailureComponent

**Ubicación:** `src/app/components/payment-failure/`

**Propósito:** Informar sobre pago rechazado

**Características:**
- ❌ Muestra razones posibles del rechazo
- 🔄 Botón para intentar nuevamente
- 📞 Opción de contactar soporte
- ℹ️ Consejos para resolver el problema

**Razones Comunes Mostradas:**
- Fondos insuficientes
- Datos incorrectos
- Límite excedido
- Tarjeta bloqueada

### 3. PaymentPendingComponent

**Ubicación:** `src/app/components/payment-pending/`

**Propósito:** Mostrar estado de pago en proceso

**Características:**
- ⏳ Timeline visual del proceso
- 🔄 Botón para verificar estado
- ℹ️ Información sobre tiempos de espera
- 📧 Indicación sobre notificaciones

**Timeline Mostrado:**
1. ✅ Pedido creado
2. ⏳ Pago en proceso (actual)
3. ⏸️ Pago confirmado
4. ⏸️ Pedido enviado

---

## 🛣️ Rutas

### Configuración en app.routes.ts

```typescript
export const routes: Routes = [
  // ... otras rutas
  { 
    path: "payment/success", 
    component: PaymentSuccessComponent 
  },
  { 
    path: "payment/failure", 
    component: PaymentFailureComponent 
  },
  { 
    path: "payment/pending", 
    component: PaymentPendingComponent 
  },
];
```

### URLs de EJEMPLO de MercadoPago

Configuradas en el backend (`mercadopago.service.ts`):

```typescript
back_urls: {
  success: `${FRONTEND_URL}/payment/success`,
  failure: `${FRONTEND_URL}/payment/failure`,
  pending: `${FRONTEND_URL}/payment/pending`
}
```

**Variable de Entorno Necesaria:**
```env
FRONTEND_URL=http://localhost:4200
```

---

## 💡 Uso Básico

### Paso 1: Verificar Configuración del Backend

```typescript
ngOnInit() {
  this.pagoService.checkConfig().subscribe({
    next: (config) => {
      if (config.configured) {
        console.log('✅ MercadoPago configurado');
      } else {
        console.warn('⚠️ MercadoPago no configurado');
      }
    }
  });
}
```

### Paso 2: Crear un Pago (Ya implementado en el carrito)

El flujo ya está integrado en `CartComponent`. Cuando el usuario finaliza la compra:

```typescript
// Automáticamente:
// 1. Crea el pedido
// 2. Crea el pago
// 3. Redirige a MercadoPago
```

### Paso 3: Manejar el EJEMPLO (Ya implementado)

Los componentes de pago manejan automáticamente el EJEMPLO de MercadoPago.

---

## 🎨 Personalización

### Cambiar Colores de las Páginas de Pago

**PaymentSuccessComponent:**
```css
.payment-card.success {
  border-top: 6px solid #28a745; /* Verde de éxito */
}

.success-icon {
  color: #28a745; /* Color del ícono */
}
```

**PaymentFailureComponent:**
```css
.payment-card.failure {
  border-top: 6px solid #dc3545; /* Rojo de error */
}
```

**PaymentPendingComponent:**
```css
.payment-card.pending {
  border-top: 6px solid #ffc107; /* Amarillo de pendiente */
}
```

### Agregar Información de Contacto

En `payment-failure.component.ts`:

```typescript
export class PaymentFailureComponent {
  supportPhone = '+54 11 1234-5678';
  supportEmail = 'soporte@tuempresa.com';
  
  // ...
}
```

### Personalizar Mensajes

Edita los templates de cada componente para cambiar textos:

```html
<!-- payment-success.component.ts -->
<h1>¡Tu pedido está confirmado!</h1>
<p class="subtitle">Gracias por tu compra</p>
```

---

## 🧪 Testing

### Testing Manual

#### 1. Flujo Completo de Pago

```bash
# 1. Inicia el backend
cd api && npm run dev

# 2. Inicia el frontend
cd App && ng serve

# 3. Abre el navegador
http://localhost:4200
```

**Pasos:**
1. Agrega productos al carrito
2. Click en "Finalizar Compra"
3. Completa el formulario
4. Deberías ver el mensaje "Redirigiendo a MercadoPago..."
5. Serás redirigido a MercadoPago

#### 2. Usar Tarjetas de Prueba

En MercadoPago, usa:

**Pago Aprobado:**
- Tarjeta: `5031 7557 3453 0604`
- CVV: `123`
- Vencimiento: `11/25`
- Nombre: `APRO`

**Pago Rechazado:**
- Tarjeta: `4509 9535 6623 3704`
- CVV: `123`
- Vencimiento: `11/25`
- Nombre: `OTHE`

#### 3. Verificar Páginas de EJEMPLO

Después de completar el pago, verifica que:
- ✅ La URL sea correcta (`/payment/success`, `/payment/failure`, etc.)
- ✅ Se muestren los datos del pago
- ✅ Los botones funcionen correctamente

### Testing de Desarrollo

#### Simular EJEMPLO de MercadoPago

Puedes probar las páginas directamente:

```
http://localhost:4200/payment/success?external_reference=PEDIDO-1-1234567890&payment_id=123456

http://localhost:4200/payment/failure?external_reference=PEDIDO-1-1234567890

http://localhost:4200/payment/pending?external_reference=PEDIDO-1-1234567890
```

---

## 🐛 Troubleshooting

### Problema 1: No se crea el pago

**Error:** `Error al procesar su pedido`

**Soluciones:**
1. Verifica que el backend esté corriendo
2. Verifica la configuración de MercadoPago en el backend
3. Revisa la consola del navegador para errores
4. Verifica que el pedido se haya creado correctamente

```typescript
// En cart.component.ts, agrega logs:
console.log('Pedido creado:', pedido);
console.log('Pago creado:', pagoResponse);
```

### Problema 2: No redirige a MercadoPago

**Síntomas:** El usuario se queda en la página

**Soluciones:**
1. Verifica que `init_point` esté en la respuesta
2. Revisa la consola por errores de CORS
3. Verifica el timeout de redirección

```typescript
// Aumentar el delay si es necesario
setTimeout(() => {
  this.pagoService.redirectToMercadoPago(pagoResponse.init_point);
}, 2000); // 2 segundos
```

### Problema 3: La página de EJEMPLO no muestra datos

**Error:** "No se encontró información del pago"

**Soluciones:**
1. Verifica que los query params estén presentes en la URL
2. Verifica que el `external_reference` sea correcto
3. Revisa que el webhook haya actualizado el pago

```typescript
// En payment-success.component.ts, agrega:
ngOnInit(): void {
  console.log('Query params:', this.route.snapshot.queryParams);
  console.log('External reference:', this.externalReference);
}
```

### Problema 4: Error de CORS

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solución:** Verifica la configuración de CORS en el backend:

```typescript
// api/src/app.ts
cors({
  origin: [
    "http://localhost:4200",
    "https://tu-dominio.vercel.app"
  ],
  credentials: true
})
```

### Problema 5: El carrito no se limpia

**Síntoma:** Después del pago, los productos siguen en el carrito

**Solución:** Verifica que se llame a `clearCart()`:

```typescript
.subscribe({
  next: (pagoResponse) => {
    this.cartService.clearCart(); // ✅ Asegúrate que esto se ejecute
    // ...
  }
});
```

---

## 📱 Responsive Design

Todos los componentes están optimizados para mobile:

```css
@media (max-width: 768px) {
  .payment-card {
    padding: 24px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  /* Ajustes específicos para cada componente */
}
```

---

## 🔐 Seguridad

### Mejores Prácticas Implementadas

✅ **No se exponen datos sensibles**
- Los datos de la tarjeta nunca pasan por tu frontend
- Todo el procesamiento se hace en MercadoPago

✅ **Validación de datos**
- El backend valida todos los datos antes de crear el pago

✅ **Webhook seguro**
- El backend verifica las notificaciones de MercadoPago

✅ **Estados consistentes**
- El estado del pago se actualiza automáticamente via webhook

---

## 🚀 Deploy a Producción

### Checklist Pre-Deploy

- [ ] Cambiar URLs de desarrollo a producción
- [ ] Configurar variable `FRONTEND_URL` en el backend
- [ ] Usar Access Token de producción (no de prueba)
- [ ] Configurar webhooks en MercadoPago con URL de producción
- [ ] Probar flujo completo en staging
- [ ] Verificar que HTTPS esté habilitado

### Variables de Entorno

**Backend (.env):**
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-production-token
FRONTEND_URL=https://tu-dominio.com
API_URL=https://api.tu-dominio.com
```

**Frontend (environment.prod.ts):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tu-dominio.com'
};
```

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- `../api/MERCADOPAGO_README.md` - README principal del backend
- `../api/MERCADOPAGO_QUICKSTART.md` - Guía rápida del backend
- `../api/MERCADOPAGO_INTEGRATION.md` - Documentación completa

### Documentación Oficial

- [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
- [Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)
- [API Reference](https://www.mercadopago.com.ar/developers/es/reference)

---

## 🎉 Resumen

### Lo que ya está funcionando:

✅ Servicio de pagos completo
✅ Integración en el flujo del carrito
✅ Páginas de resultado (éxito, error, pendiente)
✅ Rutas configuradas
✅ Diseño responsive
✅ Manejo de errores
✅ Redirección automática

### Próximos pasos sugeridos:

1. **Personalizar diseño** según tu marca
2. **Agregar analytics** para seguimiento de conversiones
3. **Implementar notificaciones** por email
4. **Crear dashboard** de pagos en administración
5. **Agregar pruebas unitarias**

---

## 💬 Soporte

Si tienes problemas:

1. Revisa esta guía
2. Consulta los logs del navegador (F12)
3. Verifica los logs del backend
4. Revisa la documentación del backend en `../api/`

---

**¡Tu integración de MercadoPago en el frontend está completa!** 🎉

Ahora los usuarios pueden finalizar sus compras con pagos seguros procesados por MercadoPago.

---

**Última actualización:** Enero 2024
**Versión:** 1.0.0
**Autor:** Sistema de desarrollo