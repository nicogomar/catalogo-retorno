import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../environments/environment";

/**
 * Interfaz genérica para respuestas de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Interfaz para respuestas paginadas
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Servicio genérico para interactuar con la API REST
 */
@Injectable({
  providedIn: "root",
})
export class ApiService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Realiza una petición GET
   * @param endpoint Endpoint relativo (ej: '/productos')
   * @param params Parámetros de consulta opcionales
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || "Error en la petición");
          }
          return response.data as T;
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Realiza una petición POST
   * @param endpoint Endpoint relativo
   * @param data Datos a enviar
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || "Error en la petición");
          }
          return response.data as T;
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Realiza una petición PUT
   * @param endpoint Endpoint relativo
   * @param data Datos a actualizar
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || "Error en la petición");
          }
          return response.data as T;
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Realiza una petición PATCH
   * @param endpoint Endpoint relativo
   * @param data Datos a actualizar parcialmente
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || "Error en la petición");
          }
          return response.data as T;
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Realiza una petición DELETE
   * @param endpoint Endpoint relativo
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error || "Error en la petición");
        }
        return response.data as T;
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Ocurrió un error desconocido";

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status === 0) {
        errorMessage =
          "No se pudo conectar con el servidor. Verifica que la API esté ejecutándose.";
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error("API Error:", errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
