# Ejemplos de Integración Frontend - MercadoPago

Esta guía proporciona ejemplos prácticos de cómo integrar MercadoPago en tu frontend (Angular, React, Vue.js o JavaScript vanilla).

---

## 📋 Tabla de Contenidos

1. [Angular](#angular)
2. [React](#react)
3. [Vue.js](#vuejs)
4. [JavaScript Vanilla](#javascript-vanilla)
5. [TypeScript Types](#typescript-types)
6. [Componentes de UI](#componentes-de-ui)

---

## Angular

### 1. Servicio de Pagos (pago.service.ts)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface PagoRequest {
  pedido_id: number;
  items: PagoItem[];
  payer?: PayerInfo;
  external_reference?: string;
}

export interface PagoItem {
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
  picture_url?: string;
}

export interface PayerInfo {
  name?: string;
  surname?: string;
  email?: string;
  phone?: {
    area_code?: string;
    number?: string;
  };
}

export interface PagoResponse {
  success: boolean;
  data: {
    pago_id: number;
    preference_id: string;
    init_point: string;
    sandbox_init_point?: string;
  };
  message?: string;
  error?: string;
}

export interface Pago {
  id: number;
  created_at: string;
  pedido_id: number;
  mercadopago_payment_id?: string;
  mercadopago_preference_id?: string;
  estado: string;
  metodo_pago?: string;
  monto?: number;
  moneda?: string;
  external_reference?: string;
  fecha_aprobacion?: string;
  detalles?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = `${environment.apiUrl}/api/pagos`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo pago
   */
  crearPago(pagoData: PagoRequest): Observable<PagoResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<PagoResponse>(this.apiUrl, pagoData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener pago por ID
   */
  obtenerPago(id: number): Observable<Pago> {
    return this.http.get<{ success: boolean; data: Pago }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener pagos por pedido ID
   */
  obtenerPagosPorPedido(pedidoId: number): Observable<Pago[]> {
    return this.http.get<{ success: boolean; data: Pago[] }>(`${this.apiUrl}/pedido/${pedidoId}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener pago por external reference
   */
  obtenerPagoPorExternalReference(reference: string): Observable<Pago> {
    return this.http.get<{ success: boolean; data: Pago }>(`${this.apiUrl}/external-reference/${reference}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener estadísticas de pagos
   */
  obtenerEstadisticas(): Observable<any> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/stats`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Verificar configuración de MercadoPago
   */
  verificarConfiguracion(): Observable<boolean> {
    return this.http.get<{ success: boolean; data: { configured: boolean } }>(`${this.apiUrl}/check-config`)
      .pipe(
        map(response => response.data.configured),
        catchError(() => throwError(() => new Error('Error verificando configuración')))
      );
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: any) {
    console.error('Error en PagoService:', error);
    const errorMessage = error.error?.error || error.message || 'Error desconocido';
    return throwError(() => new Error(errorMessage));
  }
}
```

### 2. Componente de Checkout (checkout.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService, PagoRequest } from '../services/pago.service';
import { PedidoService } from '../services/pedido.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  pedido: any;
  loading = false;
  error: string | null = null;
  userEmail = '';
  userName = '';
  userPhone = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    const pedidoId = this.route.snapshot.paramMap.get('id');
    if (pedidoId) {
      this.cargarPedido(+pedidoId);
    }
  }

  cargarPedido(id: number): void {
    this.loading = true;
    this.pedidoService.obtenerPedido(id).subscribe({
      next: (pedido) => {
        this.pedido = pedido;
        this.userEmail = pedido.email || '';
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el pedido';
        this.loading = false;
      }
    });
  }

  calcularTotal(): number {
    if (!this.pedido?.productos) return 0;
    return this.pedido.productos.reduce(
      (total: number, producto: any) => total + (producto.precio * producto.quantity),
      0
    );
  }

  procesarPago(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.error = null;

    // Preparar items para MercadoPago
    const items = this.pedido.productos.map((producto: any) => ({
      title: producto.nombre,
      description: `Peso: ${producto.peso || 'N/A'}`,
      quantity: producto.quantity,
      unit_price: producto.precio,
      currency_id: 'ARS',
      picture_url: producto.img_url
    }));

    // Preparar datos del pago
    const pagoData: PagoRequest = {
      pedido_id: this.pedido.id,
      items: items,
      payer: {
        email: this.userEmail,
        name: this.userName,
        phone: {
          area_code: this.userPhone.substring(0, 3),
          number: this.userPhone.substring(3)
        }
      },
      external_reference: `PEDIDO-${this.pedido.id}-${Date.now()}`
    };

    // Crear pago
    this.pagoService.crearPago(pagoData).subscribe({
      next: (response) => {
        console.log('Pago creado:', response);
        // Redirigir a MercadoPago
        window.location.href = response.data.init_point;
      },
      error: (error) => {
        this.error = error.message || 'Error al procesar el pago';
        this.loading = false;
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.userEmail) {
      this.error = 'El email es requerido';
      return false;
    }
    if (!this.userName) {
      this.error = 'El nombre es requerido';
      return false;
    }
    return true;
  }
}
```

### 3. Template del Checkout (checkout.component.html)

```html
<div class="checkout-container">
  <h1>Checkout</h1>

  <!-- Loading -->
  <div *ngIf="loading" class="loading">
    <p>Procesando...</p>
  </div>

  <!-- Error -->
  <div *ngIf="error" class="error">
    {{ error }}
  </div>

  <!-- Resumen del pedido -->
  <div *ngIf="pedido && !loading" class="pedido-summary">
    <h2>Resumen del Pedido #{{ pedido.id }}</h2>
    
    <div class="productos-list">
      <div *ngFor="let producto of pedido.productos" class="producto-item">
        <img [src]="producto.img_url" [alt]="producto.nombre" *ngIf="producto.img_url">
        <div class="producto-info">
          <h3>{{ producto.nombre }}</h3>
          <p>Peso: {{ producto.peso }}</p>
          <p>Cantidad: {{ producto.quantity }}</p>
          <p class="precio">${{ producto.precio * producto.quantity }}</p>
        </div>
      </div>
    </div>

    <div class="total">
      <h3>Total: ${{ calcularTotal() }}</h3>
    </div>

    <!-- Formulario de datos del pagador -->
    <form (ngSubmit)="procesarPago()" class="payer-form">
      <h3>Datos del Pagador</h3>
      
      <div class="form-group">
        <label for="email">Email *</label>
        <input 
          type="email" 
          id="email" 
          [(ngModel)]="userEmail" 
          name="email"
          required
          placeholder="tu@email.com">
      </div>

      <div class="form-group">
        <label for="name">Nombre Completo *</label>
        <input 
          type="text" 
          id="name" 
          [(ngModel)]="userName" 
          name="name"
          required
          placeholder="Juan Pérez">
      </div>

      <div class="form-group">
        <label for="phone">Teléfono</label>
        <input 
          type="tel" 
          id="phone" 
          [(ngModel)]="userPhone" 
          name="phone"
          placeholder="1123456789">
      </div>

      <button 
        type="submit" 
        class="btn-pagar"
        [disabled]="loading">
        {{ loading ? 'Procesando...' : 'Pagar con MercadoPago' }}
      </button>
    </form>
  </div>
</div>
```

### 4. Componente de Estado de Pago (payment-status.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../services/pago.service';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.css']
})
export class PaymentStatusComponent implements OnInit {
  status: 'success' | 'failure' | 'pending' | null = null;
  pago: any;
  loading = true;
  paymentId: string | null = null;
  externalReference: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    // Determinar el estado basado en la ruta
    const path = this.route.snapshot.url[1]?.path;
    this.status = path as any;

    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'];
      this.externalReference = params['external_reference'];
      
      if (this.externalReference) {
        this.cargarPago();
      } else {
        this.loading = false;
      }
    });
  }

  cargarPago(): void {
    if (this.externalReference) {
      this.pagoService.obtenerPagoPorExternalReference(this.externalReference).subscribe({
        next: (pago) => {
          this.pago = pago;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar pago:', error);
          this.loading = false;
        }
      });
    }
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }

  verPedido(): void {
    if (this.pago?.pedido_id) {
      this.router.navigate(['/pedidos', this.pago.pedido_id]);
    }
  }
}
```

---

## React

### 1. Hook Personalizado (usePago.js)

```javascript
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const usePago = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearPago = useCallback(async (pagoData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/pagos`, pagoData);
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      setLoading(false);
      throw new Error(errorMsg);
    }
  }, []);

  const obtenerPago = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/pagos/${id}`);
      setLoading(false);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      setLoading(false);
      throw new Error(errorMsg);
    }
  }, []);

  const obtenerPagosPorPedido = useCallback(async (pedidoId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/pagos/pedido/${pedidoId}`);
      setLoading(false);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      setLoading(false);
      throw new Error(errorMsg);
    }
  }, []);

  return {
    loading,
    error,
    crearPago,
    obtenerPago,
    obtenerPagosPorPedido
  };
};
```

### 2. Componente de Checkout (Checkout.jsx)

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePago } from '../hooks/usePago';
import { usePedido } from '../hooks/usePedido';
import './Checkout.css';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { crearPago, loading: pagoLoading, error: pagoError } = usePago();
  const { obtenerPedido, loading: pedidoLoading } = usePedido();

  const [pedido, setPedido] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    telefono: ''
  });

  useEffect(() => {
    cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    try {
      const data = await obtenerPedido(id);
      setPedido(data);
      if (data.email) {
        setFormData(prev => ({ ...prev, email: data.email }));
      }
    } catch (error) {
      console.error('Error al cargar pedido:', error);
    }
  };

  const calcularTotal = () => {
    if (!pedido?.productos) return 0;
    return pedido.productos.reduce(
      (total, producto) => total + (producto.precio * producto.quantity),
      0
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.nombre) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const items = pedido.productos.map(producto => ({
        title: producto.nombre,
        description: `Peso: ${producto.peso || 'N/A'}`,
        quantity: producto.quantity,
        unit_price: producto.precio,
        currency_id: 'ARS',
        picture_url: producto.img_url
      }));

      const pagoData = {
        pedido_id: pedido.id,
        items: items,
        payer: {
          email: formData.email,
          name: formData.nombre,
          phone: {
            area_code: formData.telefono.substring(0, 3),
            number: formData.telefono.substring(3)
          }
        },
        external_reference: `PEDIDO-${pedido.id}-${Date.now()}`
      };

      const response = await crearPago(pagoData);
      
      // Redirigir a MercadoPago
      window.location.href = response.data.init_point;
    } catch (error) {
      console.error('Error al procesar pago:', error);
    }
  };

  if (pedidoLoading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!pedido) {
    return <div className="error">Pedido no encontrado</div>;
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {pagoError && (
        <div className="error-message">
          {pagoError}
        </div>
      )}

      <div className="pedido-summary">
        <h2>Resumen del Pedido #{pedido.id}</h2>
        
        <div className="productos-list">
          {pedido.productos.map((producto, index) => (
            <div key={index} className="producto-item">
              {producto.img_url && (
                <img src={producto.img_url} alt={producto.nombre} />
              )}
              <div className="producto-info">
                <h3>{producto.nombre}</h3>
                <p>Peso: {producto.peso}</p>
                <p>Cantidad: {producto.quantity}</p>
                <p className="precio">${producto.precio * producto.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="total">
          <h3>Total: ${calcularTotal()}</h3>
        </div>

        <form onSubmit={handleSubmit} className="payer-form">
          <h3>Datos del Pagador</h3>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              placeholder="Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="1123456789"
            />
          </div>

          <button
            type="submit"
            className="btn-pagar"
            disabled={pagoLoading}
          >
            {pagoLoading ? 'Procesando...' : 'Pagar con MercadoPago'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
```

---

## Vue.js

### 1. Composable (usePago.js)

```javascript
import { ref } from 'vue';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function usePago() {
  const loading = ref(false);
  const error = ref(null);

  const crearPago = async (pagoData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/api/pagos`, pagoData);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || err.message;
      throw new Error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const obtenerPago = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_URL}/api/pagos/${id}`);
      return response.data.data;
    } catch (err) {
      error.value = err.response?.data?.error || err.message;
      throw new Error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const obtenerPagosPorPedido = async (pedidoId) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_URL}/api/pagos/pedido/${pedidoId}`);
      return response.data.data;
    } catch (err) {
      error.value = err.response?.data?.error || err.message;
      throw new Error(error.value);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    crearPago,
    obtenerPago,
    obtenerPagosPorPedido
  };
}
```

### 2. Componente de Checkout (Checkout.vue)

```vue
<template>
  <div class="checkout-container">
    <h1>Checkout</h1>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <p>Cargando...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Resumen del pedido -->
    <div v-if="pedido && !loading" class="pedido-summary">
      <h2>Resumen del Pedido #{{ pedido.id }}</h2>
      
      <div class="productos-list">
        <div 
          v-for="(producto, index) in pedido.productos" 
          :key="index" 
          class="producto-item"
        >
          <img 
            v-if="producto.img_url" 
            :src="producto.img_url" 
            :alt="producto.nombre"
          >
          <div class="producto-info">
            <h3>{{ producto.nombre }}</h3>
            <p>Peso: {{ producto.peso }}</p>
            <p>Cantidad: {{ producto.quantity }}</p>
            <p class="precio">${{ producto.precio * producto.quantity }}</p>
          </div>
        </div>
      </div>

      <div class="total">
        <h3>Total: ${{ calcularTotal() }}</h3>
      </div>

      <!-- Formulario de datos del pagador -->
      <form @submit.prevent="procesarPago" class="payer-form">
        <h3>Datos del Pagador</h3>
        
        <div class="form-group">
          <label for="email">Email *</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            required
            placeholder="tu@email.com"
          >
        </div>

        <div class="form-group">
          <label for="nombre">Nombre Completo *</label>
          <input 
            type="text" 
            id="nombre" 
            v-model="formData.nombre" 
            required
            placeholder="Juan Pérez"
          >
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono</label>
          <input 
            type="tel" 
            id="telefono" 
            v-model="formData.telefono" 
            placeholder="1123456789"
          >
        </div>

        <button 
          type="submit" 
          class="btn-pagar"
          :disabled="pagoLoading"
        >
          {{ pagoLoading ? 'Procesando...' : 'Pagar con MercadoPago' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePago } from '@/composables/usePago';
import { usePedido } from '@/composables/usePedido';

const route = useRoute();
const { crearPago, loading: pagoLoading, error: pagoError } = usePago();
const { obtenerPedido, loading, error } = usePedido();

const pedido = ref(null);
const formData = ref({
  email: '',
  nombre: '',
  telefono: ''
});

onMounted(async () => {
  try {
    const pedidoId = route.params.id;
    pedido.value = await obtenerPedido(pedidoId);
    if (pedido.value.email) {
      formData.value.email = pedido.value.email;
    }
  } catch (err) {
    console.error('Error al cargar pedido:', err);
  }
});

const calcularTotal = () => {
  if (!pedido.value?.productos) return 0;
  return pedido.value.productos.reduce(
    (total, producto) => total + (producto.precio * producto.quantity),
    0
  );
};

const procesarPago = async () => {
  if (!formData.value.email || !formData.value.nombre) {
    alert('Por favor completa todos los campos requeridos');
    return;
  }

  try {
    const items = pedido.value.productos.map(producto => ({
      title: producto.nombre,
      description: `Peso: ${producto.peso || 'N/A'}`,
      quantity: producto.quantity,
      unit_price: producto.precio,
      currency_id: 'ARS',
      picture_url: producto.img_url
    }));

    const pagoData = {
      pedido_id: pedido.value.id,
      items: items,
      payer: {
        email: formData.value.email,
        name: formData.value.nombre,
        phone: {
          area_code: formData.value.telefono.substring(0, 3),
          number: formData.value.telefono.substring(3)
        }
      },
      external_reference: `PEDIDO-${pedido.value.id}-${Date.now()}`
    };

    const response = await crearPago(pagoData);
    
    // Redirigir a MercadoPago
    window.location.href = response.data.init_point;
  } catch (err) {
    console.error('Error al procesar pago:', err);
  }
};
</script>

<style scoped>
.checkout-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.error {
  background-color: #fee;
  color: #c00;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.pedido-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.productos-list {
  margin: 20px 0;
}

.producto-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.producto-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
}

.producto-info {
  flex: 1;
}

.precio {
  font-weight: bold;
  color: #007bff;
}

.total {
  text-align: right;
  font-size: 1.5em;
  padding: 20px 0;
  border-top: 2px solid #007bff;
}

.payer-form {
  margin-top: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.btn-pagar {
  width: 100%;
  padding: 15px;
  background-color: #009ee3;
  color: white;
  
