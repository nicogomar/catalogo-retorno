# 🔧 Troubleshooting - Método de Pago

## Problema: "Siempre redirige a MercadoPago, no me da a elegir"

### 🔍 Diagnóstico

Si al realizar un pedido SIEMPRE redirige a MercadoPago sin importar qué opción selecciones, sigue estos pasos:

---

## ✅ Solución Paso a Paso

### 1. Verificar Valor por Defecto del Formulario

**Problema:** El formulario puede tener "mercadopago" como valor por defecto.

**Solución:**

Editar: `App/CatalogoProductos/App/src/app/components/customer-modal/customer-modal.component.ts`

```typescript
// Línea ~387
private initForm() {
  this.customerForm = this.formBuilder.group({
    paymentMethod: ["", [Validators.required]], // ← Debe estar vacío ""
    name: ["", [Validators.required]],
    phone: ["", [Validators.required]],
    // ...
  });
}
```

**NO debe ser:**
```typescript
paymentMethod: ["mercadopago", [Validators.required]] // ❌ INCORRECTO
```

**Debe ser:**
```typescript
paymentMethod: ["", [Validators.required]] // ✅ CORRECTO
```

---

### 2. Verificar Logs en la Consola

**Abrir consola del navegador (F12) y buscar:**

```javascript
// Al hacer clic en "Realizar pedido"
Payment method selected: mercadopago  // o contra_entrega
Full form value: {paymentMethod: "...", name: "...", ...}
Order object created: {...}
Payment method in order: mercadopago  // o contra_entrega

// Al guardar el pedido
Payment method received: mercadopago  // o contra_entrega
Checking payment method: mercadopago
Is mercadopago? true  // o false
```

**Si ves que SIEMPRE dice "mercadopago" aunque seleccionaste "contra_entrega":**
- El formulario no está capturando la selección correctamente

---

### 3. Verificar que los Radio Buttons Funcionen

**Probar manualmente:**

1. Abrir la aplicación
2. Agregar productos al carrito
3. Click "Finalizar Compra"
4. **ANTES de completar el formulario:**
   - Click en "💳 MercadoPago"
   - ¿Se marca visualmente?
   - Click en "💵 Contra Entrega"
   - ¿Se marca visualmente?
   - ¿Solo uno puede estar seleccionado a la vez?

**Si ambos se pueden seleccionar o ninguno se marca:**
- Hay un problema con el `formControlName`

---

### 4. Limpiar Caché del Navegador

A veces el navegador cachea la versión antigua del código.

**Solución:**

1. **Chrome/Edge:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

2. **Firefox:**
   - `Ctrl + F5` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

3. **O manualmente:**
   - F12 → Network tab
   - Check "Disable cache"
   - Recargar página

---

### 5. Verificar que el Componente se Importó Correctamente

**Archivo:** `cart.component.ts`

Verificar imports:
```typescript
import { CustomerModalComponent } from "../customer-modal/customer-modal.component";
import { PaymentConfirmationModalComponent } from "../payment-confirmation-modal/payment-confirmation-modal.component";
```

Verificar que esté en el array `imports`:
```typescript
@Component({
  selector: "app-cart",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomerModalComponent,          // ✅ Debe estar
    AlertComponent,
    PaymentConfirmationModalComponent, // ✅ Debe estar
  ],
  // ...
})
```

---

### 6. Reiniciar el Servidor de Desarrollo

**Matar el proceso y reiniciar:**

```bash
# Presiona Ctrl+C en la terminal donde corre npm start

# Luego reinicia:
cd App/CatalogoProductos/App
npm start
```

---

### 7. Verificar el HTML del Radio Button

**Si los radio buttons no responden, verificar el HTML:**

```html
<!-- Debe verse así: -->
<label class="payment-option">
  <input
    type="radio"
    formControlName="paymentMethod"  <!-- ✅ IMPORTANTE -->
    value="mercadopago"               <!-- ✅ Valor correcto -->
  />
  <div class="payment-option-content">
    <span class="payment-icon">💳</span>
    <div class="payment-info">
      <strong>MercadoPago</strong>
      <small>Pagar ahora con tarjeta</small>
    </div>
  </div>
</label>

<label class="payment-option">
  <input
    type="radio"
    formControlName="paymentMethod"  <!-- ✅ MISMO nombre -->
    value="contra_entrega"           <!-- ✅ Valor correcto -->
  />
  <!-- ... -->
</label>
```

**Verificar que:**
- ✅ `type="radio"` en ambos
- ✅ `formControlName="paymentMethod"` (mismo nombre en ambos)
- ✅ `value` diferente en cada uno
- ✅ Están dentro del mismo `<form>`

---

## 🧪 Test Rápido

### Test 1: Verificar Visualmente

1. Abrir DevTools (F12)
2. Ir a "Elements" / "Elementos"
3. Buscar los radio buttons:
   ```html
   <input type="radio" ... value="mercadopago">
   <input type="radio" ... value="contra_entrega">
   ```
4. Click en cada uno
5. Verificar que el atributo `checked` cambia:
   ```html
   <input type="radio" checked ...>  <!-- ← Debe aparecer/desaparecer -->
   ```

### Test 2: Ver Valor del Formulario en Tiempo Real

En la consola del navegador, después de abrir el modal:

```javascript
// Ver el valor actual del formulario
// (Esto es solo para debug, no lo dejes en el código)
```

---

## 📊 Checklist de Verificación

- [ ] Valor por defecto del formulario es `""` (vacío)
- [ ] Radio buttons son tipo `type="radio"`
- [ ] Ambos tienen el mismo `formControlName="paymentMethod"`
- [ ] Valores son `"mercadopago"` y `"contra_entrega"` (exactos)
- [ ] Solo uno puede estar seleccionado a la vez
- [ ] Logs en consola muestran el valor correcto
- [ ] Caché del navegador limpiado
- [ ] Servidor reiniciado
- [ ] Componente importado correctamente

---

## 🔍 Debug Avanzado

### Agregar Indicador Visual Temporal

Para verificar qué método está seleccionado, agregar esto temporalmente:

**En `customer-modal.component.ts`, template:**

```html
<!-- Agregar esto DESPUÉS de los radio buttons -->
<div style="padding: 10px; background: #f0f0f0; margin-top: 10px;">
  <strong>Debug - Método seleccionado:</strong> 
  {{ customerForm.value.paymentMethod || 'Ninguno' }}
</div>
```

Ahora verás en tiempo real qué valor tiene el formulario.

---

## 🐛 Problemas Comunes y Soluciones

### Problema: "Los radio buttons no responden al click"

**Causa:** CSS está bloqueando los clicks o el z-index es incorrecto.

**Solución:**
```css
.payment-option input[type="radio"] {
  cursor: pointer;
  pointer-events: auto; /* Asegurar que recibe clicks */
  z-index: 1;
}
```

### Problema: "Dice 'undefined' o 'null' en los logs"

**Causa:** El valor no se está capturando.

**Solución:** Verificar que el `formControlName` coincide exactamente con el nombre en `initForm()`.

### Problema: "Aparece error de validación aunque seleccioné un método"

**Causa:** El valor no se está enviando correctamente.

**Solución:**
1. Verificar que los radio buttons están dentro del `<form>`
2. Verificar que el form tiene `[formGroup]="customerForm"`

---

## 💡 Solución Rápida (Si nada funciona)

Si después de todo sigue sin funcionar, puedes hacer esto temporalmente:

**En `customer-modal.component.ts`:**

```typescript
// Línea ~387
private initForm() {
  this.customerForm = this.formBuilder.group({
    paymentMethod: ["contra_entrega", [Validators.required]], // ← Cambiar default
    // ...
  });
}
```

Esto hará que el default sea "Contra Entrega" en lugar de "MercadoPago".

**Pero la solución correcta es que el usuario elija, no forzar un default.**

---

## 📞 Si Sigue Sin Funcionar

1. **Verificar versión de Angular:**
   ```bash
   cd App/CatalogoProductos/App
   ng version
   ```

2. **Reinstalar dependencias:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Verificar que ReactiveFormsModule esté importado:**
   ```typescript
   import { ReactiveFormsModule } from "@angular/forms";
   
   @Component({
     imports: [
       CommonModule,
       ReactiveFormsModule, // ✅ Debe estar
       // ...
     ]
   })
   ```

---

## ✅ Confirmación de que Funciona

Cuando esté funcionando correctamente, deberías ver esto:

### Flujo Correcto - Contra Entrega
```
1. Seleccionar "💵 Contra Entrega"
2. Completar formulario
3. Click "Realizar pedido"
4. Consola: "Payment method received: contra_entrega"
5. Consola: "Payment method is contra_entrega, showing success message"
6. Mensaje: "Pagarás al recibir la entrega"
7. NO aparece modal de confirmación
8. NO redirige a MercadoPago
```

### Flujo Correcto - MercadoPago
```
1. Seleccionar "💳 MercadoPago"
2. Completar formulario
3. Click "Realizar pedido"
4. Consola: "Payment method received: mercadopago"
5. Consola: "Creating MercadoPago preference..."
6. Aparece modal de confirmación
7. Click "Ir a MercadoPago"
8. Redirige a página de pago
```

---

## 📚 Documentación Relacionada

- **README_METODO_PAGO_V2.md** - Documentación completa
- **FLUJO_CONFIRMACION_PAGO.md** - Diagramas de flujo
- **INICIO_RAPIDO_METODO_PAGO.md** - Guía rápida

---

**Última actualización:** Enero 2024  
**Versión:** 2.0.0