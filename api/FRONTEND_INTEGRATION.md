# Frontend Integration Guide

This guide explains how to integrate the Angular frontend with the new backend API.

## 🔄 Migration Overview

The backend logic has been separated from the Angular frontend into a standalone Node.js/Express API. This document shows you how to update your Angular application to communicate with the new API.

## 📋 Prerequisites

1. Backend API running on `http://localhost:3000`
2. Angular frontend running on `http://localhost:4200`
3. CORS properly configured in the backend

## 🚀 Quick Start

### 1. Update Environment Files

Update your Angular environment files to point to the new API:

**`src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  supabase: {
    // Keep for auth if needed, but database operations go through API
    url: 'https://dgsacgbcgnyvgbkrvjmd.supabase.co',
    anonKey: 'your_anon_key_here'
  }
};
```

**`src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  supabase: {
    url: 'https://dgsacgbcgnyvgbkrvjmd.supabase.co',
    anonKey: 'your_anon_key_here'
  }
};
```

### 2. Create HTTP Service

Create a new service to handle API communication:

**`src/app/services/api.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Generic GET request
  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  // Generic POST request
  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data);
  }

  // Generic PUT request
  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data);
  }

  // Generic DELETE request
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`);
  }
}
```

### 3. Update ProductoService

Update your `ProductoService` to use the new API:

**`src/app/services/producto.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse, PaginatedResponse } from './api.service';

export interface Producto {
  id?: number;
  created_at?: string;
  nombre?: string | null;
  peso?: string | null;
  precio?: number | null;
  img_url?: string | null;
  descripcion?: string | null;
}

export interface ProductoFilters {
  nombre?: string;
  precioMin?: number;
  precioMax?: number;
  orderBy?: 'nombre' | 'precio' | 'created_at';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private endpoint = '/productos';

  constructor(private apiService: ApiService) {}

  /**
   * Get all productos with optional filters
   */
  getProductos(filters?: ProductoFilters): Observable<Producto[]> {
    return this.apiService
      .get<Producto[]>(this.endpoint, filters)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get productos with pagination
   */
  getProductosPaginated(filters?: ProductoFilters): Observable<PaginatedResponse<Producto>> {
    return this.apiService.get<Producto[]>(this.endpoint, filters) as Observable<PaginatedResponse<Producto>>;
  }

  /**
   * Get a single producto by ID
   */
  getProductoById(id: number): Observable<Producto | null> {
    return this.apiService
      .get<Producto>(`${this.endpoint}/${id}`)
      .pipe(map(response => response.data || null));
  }

  /**
   * Create a new producto
   */
  createProducto(producto: Producto): Observable<Producto> {
    return this.apiService
      .post<Producto>(this.endpoint, producto)
      .pipe(map(response => response.data!));
  }

  /**
   * Update an existing producto
   */
  updateProducto(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.apiService
      .put<Producto>(`${this.endpoint}/${id}`, producto)
      .pipe(map(response => response.data!));
  }

  /**
   * Delete a producto
   */
  deleteProducto(id: number): Observable<boolean> {
    return this.apiService
      .delete(`${this.endpoint}/${id}`)
      .pipe(map(response => response.success));
  }

  /**
   * Search productos by name
   */
  searchByNombre(nombre: string): Observable<Producto[]> {
    return this.apiService
      .get<Producto[]>(`${this.endpoint}/search/${nombre}`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get latest productos
   */
  getLatestProductos(limit: number = 10): Observable<Producto[]> {
    return this.apiService
      .get<Producto[]>(`${this.endpoint}/latest/${limit}`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get productos ordered by price
   */
  getProductosOrderByPrecio(ascending: boolean = true): Observable<Producto[]> {
    const direction = ascending ? 'asc' : 'desc';
    return this.apiService
      .get<Producto[]>(`${this.endpoint}/order-by-precio/${direction}`)
      .pipe(map(response => response.data || []));
  }
}
```

### 4. Update PedidoService

Update your `PedidoService` to use the new API:

**`src/app/services/pedido.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse, PaginatedResponse } from './api.service';

export interface ItemPedido {
  id: number;
  nombre: string;
  precio: number;
  quantity: number;
  peso?: string;
  img_url?: string;
}

export interface Pedido {
  id?: number;
  created_at?: string;
  nombre_comercio?: string | null;
  telefóno?: string | null;
  email?: string | null;
  localidad?: string | null;
  productos?: ItemPedido[] | null;
}

export interface NuevoPedido {
  nombre_comercio: string;
  telefóno: string;
  email?: string | null;
  localidad: string;
  productos: ItemPedido[];
}

export interface PedidoFilters {
  nombre_comercio?: string;
  email?: string;
  localidad?: string;
  fechaInicio?: string;
  fechaFin?: string;
  orderBy?: 'created_at' | 'nombre_comercio';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private endpoint = '/pedidos';

  constructor(private apiService: ApiService) {}

  /**
   * Get all pedidos with optional filters
   */
  getPedidos(filters?: PedidoFilters): Observable<Pedido[]> {
    return this.apiService
      .get<Pedido[]>(this.endpoint, filters)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get pedidos with pagination
   */
  getPedidosPaginated(filters?: PedidoFilters): Observable<PaginatedResponse<Pedido>> {
    return this.apiService.get<Pedido[]>(this.endpoint, filters) as Observable<PaginatedResponse<Pedido>>;
  }

  /**
   * Get a single pedido by ID
   */
  getPedidoById(id: number): Observable<Pedido | null> {
    return this.apiService
      .get<Pedido>(`${this.endpoint}/${id}`)
      .pipe(map(response => response.data || null));
  }

  /**
   * Create a new pedido
   */
  createPedido(pedido: NuevoPedido): Observable<Pedido> {
    return this.apiService
      .post<Pedido>(this.endpoint, pedido)
      .pipe(map(response => response.data!));
  }

  /**
   * Update an existing pedido
   */
  updatePedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    return this.apiService
      .put<Pedido>(`${this.endpoint}/${id}`, pedido)
      .pipe(map(response => response.data!));
  }

  /**
   * Delete a pedido
   */
  deletePedido(id: number): Observable<boolean> {
    return this.apiService
      .delete(`${this.endpoint}/${id}`)
      .pipe(map(response => response.success));
  }

  /**
   * Search pedidos by comercio
   */
  searchByComercio(nombre: string): Observable<Pedido[]> {
    return this.apiService
      .get<Pedido[]>(`${this.endpoint}/search/comercio/${nombre}`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Search pedidos by email
   */
  searchByEmail(email: string): Observable<Pedido[]> {
    return this.apiService
      .get<Pedido[]>(`${this.endpoint}/search/email/${email}`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Search pedidos by localidad
   */
  searchByLocalidad(localidad: string): Observable<Pedido[]> {
    return this.apiService
      .get<Pedido[]>(`${this.endpoint}/search/localidad/${localidad}`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get latest pedidos
   */
  getLatestPedidos(limit: number = 10): Observable<Pedido[]> {
    return this.apiService
      .get<Pedido[]>(`${this.endpoint}/latest/${limit}`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get pedidos by date range
   */
  getPedidosByDateRange(fechaInicio: Date, fechaFin: Date): Observable<Pedido[]> {
    const params = {
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    };
    return this.apiService
      .get<Pedido[]>(`${this.endpoint}/date-range`, params)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get pedidos containing a specific product
   */
  getPedidosByProducto(productoId: number): Observable<Pedido[]> {
    return this.apiService
      .get<Pedido[]>(`${this.endpoint}/producto/${productoId}`)
      .pipe(map(response => response.data || []));
  }
}
```

### 5. Update App Module

Ensure `HttpClientModule` is imported in your `app.module.ts` or `app.config.ts`:

**For standalone components (Angular 17+):**
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ... other providers
  ]
};
```

**For module-based apps:**
```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    // ... other imports
  ]
})
export class AppModule { }
```

## 🔒 Error Handling

Create an HTTP interceptor for centralized error handling:

**`src/app/interceptors/error.interceptor.ts`**
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = error.error?.error || error.message || errorMessage;
        }

        console.error('HTTP Error:', errorMessage);
        
        // You can show a notification/toast here
        // this.alertService.error(errorMessage);

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
```

Register the interceptor:
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './interceptors/error.interceptor';

providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
  }
]
```

## 🧪 Testing the Integration

### 1. Start Both Services

```bash
# Terminal 1 - Start the API
cd api
npm run dev

# Terminal 2 - Start the Angular app
cd CatalogoProductos/App
npm start
```

### 2. Verify Connection

Create a test component to verify the connection:

```typescript
import { Component, OnInit } from '@angular/core';
import { ProductoService } from './services/producto.service';

@Component({
  selector: 'app-test',
  template: `
    <div>
      <h2>API Connection Test</h2>
      <button (click)="testConnection()">Test Connection</button>
      <div *ngIf="productos.length > 0">
        <h3>Productos loaded: {{ productos.length }}</h3>
        <ul>
          <li *ngFor="let producto of productos">
            {{ producto.nombre }} - ${{ producto.precio }}
          </li>
        </ul>
      </div>
      <div *ngIf="error">
        <p class="error">Error: {{ error }}</p>
      </div>
    </div>
  `
})
export class TestComponent implements OnInit {
  productos: any[] = [];
  error: string = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.testConnection();
  }

  testConnection() {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        console.log('✅ API connection successful', data);
      },
      error: (err) => {
        this.error = err.message;
        console.error('❌ API connection failed', err);
      }
    });
  }
}
```

## 📝 Migration Checklist

- [ ] Backend API running on port 3000
- [ ] Environment files updated with API URL
- [ ] ApiService created and working
- [ ] ProductoService updated to use API
- [ ] PedidoService updated to use API
- [ ] HttpClientModule imported
- [ ] Error interceptor configured
- [ ] Test connection successful
- [ ] All components using services tested
- [ ] CORS configured correctly
- [ ] Production environment configured

## 🚨 Common Issues and Solutions

### Issue: CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Check that the API is running
2. Verify `ALLOWED_ORIGINS` in the API's `.env` file includes your frontend URL
3. Restart the API server after changing CORS settings

### Issue: Connection Refused

**Error:** `ERR_CONNECTION_REFUSED`

**Solution:**
1. Make sure the API server is running on port 3000
2. Check the `apiUrl` in your environment file
3. Verify the API is accessible at `http://localhost:3000/api/health`

### Issue: 404 Not Found

**Error:** `404 - Endpoint not found`

**Solution:**
1. Check the endpoint URL in your service
2. Verify the route exists in the API (see `API_TESTING.md`)
3. Make sure the API base URL includes `/api`

### Issue: Type Errors

**Error:** TypeScript compilation errors

**Solution:**
1. Ensure interfaces match between frontend and backend
2. Update the `Producto` and `Pedido` interfaces
3. Use the types defined in `api/src/types/index.ts` as reference

## 🎯 Next Steps

1. **Remove old Supabase direct access** - Once verified working, you can remove direct Supabase calls from the frontend
2. **Add authentication** - Implement JWT or session-based auth if needed
3. **Optimize requests** - Use caching strategies for frequently accessed data
4. **Add loading states** - Implement loading indicators in your components
5. **Error notifications** - Connect error handling to your alert service
6. **Production deployment** - Update production environment with production API URL

## 📚 Additional Resources

- [API Testing Guide](./API_TESTING.md) - Test all API endpoints
- [API README](./README.md) - Complete API documentation
- [Angular HttpClient Guide](https://angular.io/guide/http)

---

**Need help?** Check the API logs when debugging issues. The API provides detailed error messages in development mode.