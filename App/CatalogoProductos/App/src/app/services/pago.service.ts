import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Estados posibles de un pago en MercadoPago
 */
export type EstadoPago =
  | 'pending'
  | 'approved'
  | 'authorized'
  | 'in_process'
  | 'in_mediation'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'charged_back';

/**
 * Item para el pago en MercadoPago
 */
export interface PagoItem {
  title: string;
  description?: string;
  picture_url?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

/**
 * Información del pagador
 */
export interface PayerInfo {
  name?: string;
  surname?: string;
  email?: string;
  phone?: {
    area_code?: string;
    number?: string;
  };
}

/**
 * Datos para crear un nuevo pago
 */
export interface NuevoPago {
  pedido_id: number;
  items: PagoItem[];
  payer?: PayerInfo;
  external_reference?: string;
}

/**
 * Respuesta al crear un pago
 */
export interface PagoResponse {
  pago_id: number;
  preference_id: string;
  init_point: string;
  sandbox_init_point?: string;
}

/**
 * Información completa de un pago
 */
export interface Pago {
  id: number;
  created_at: string;
  pedido_id: number;
  mercadopago_payment_id?: string;
  mercadopago_preference_id?: string;
  estado: EstadoPago;
  metodo_pago?: string;
  monto?: number;
  moneda?: string;
  external_reference?: string;
  fecha_aprobacion?: string;
  detalles?: any;
}

/**
 * Estadísticas de pagos
 */
export interface PagoStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  total_amount: number;
  approved_amount: number;
}

/**
 * Servicio para gestionar pagos con MercadoPago
 */
@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private readonly endpoint = '/pagos';

  constructor(private apiService: ApiService) {}

  /**
   * Crea un nuevo pago y obtiene el link de MercadoPago
   * @param pagoData Datos del pago a crear
   * @returns Observable con la respuesta que incluye el init_point
   */
  createPago(pagoData: NuevoPago): Observable<PagoResponse> {
    return this.apiService.post<PagoResponse>(this.endpoint, pagoData);
  }

  /**
   * Obtiene información de un pago por su ID
   * @param id ID del pago
   * @returns Observable con la información del pago
   */
  getPagoById(id: number): Observable<Pago> {
    return this.apiService.get<Pago>(`${this.endpoint}/${id}`);
  }

  /**
   * Obtiene todos los pagos
   * @param filters Filtros opcionales
   * @returns Observable con array de pagos
   */
  getPagos(filters?: {
    estado?: EstadoPago;
    pedido_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<Pago[]> {
    return this.apiService.get<Pago[]>(this.endpoint, filters);
  }

  /**
   * Obtiene todos los pagos asociados a un pedido
   * @param pedidoId ID del pedido
   * @returns Observable con array de pagos del pedido
   */
  getPagosByPedidoId(pedidoId: number): Observable<Pago[]> {
    return this.apiService.get<Pago[]>(`${this.endpoint}/pedido/${pedidoId}`);
  }

  /**
   * Obtiene un pago por su referencia externa
   * @param reference Referencia externa del pago
   * @returns Observable con la información del pago
   */
  getPagoByExternalReference(reference: string): Observable<Pago> {
    return this.apiService.get<Pago>(
      `${this.endpoint}/external-reference/${reference}`
    );
  }

  /**
   * Obtiene información de un pago directamente desde MercadoPago
   * @param paymentId ID del pago en MercadoPago
   * @returns Observable con información del pago desde MercadoPago
   */
  getMercadoPagoPaymentInfo(paymentId: string): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/mercadopago/${paymentId}`);
  }

  /**
   * Obtiene estadísticas de pagos
   * @returns Observable con las estadísticas
   */
  getPagoStats(): Observable<PagoStats> {
    return this.apiService.get<PagoStats>(`${this.endpoint}/stats`);
  }

  /**
   * Verifica si MercadoPago está correctamente configurado
   * @returns Observable con el estado de la configuración
   */
  checkConfig(): Observable<{ configured: boolean; message: string }> {
    return this.apiService.get<{ configured: boolean; message: string }>(
      `${this.endpoint}/check-config`
    );
  }

  /**
   * Actualiza el estado de un pago
   * @param id ID del pago
   * @param estado Nuevo estado del pago
   * @returns Observable con el pago actualizado
   */
  updateEstado(id: number, estado: EstadoPago): Observable<Pago> {
    return this.apiService.patch<Pago>(`${this.endpoint}/${id}/estado`, {
      estado,
    });
  }

  /**
   * Realiza un reembolso de un pago
   * @param id ID del pago
   * @param amount Monto a reembolsar (opcional, si no se especifica reembolsa todo)
   * @returns Observable con información del reembolso
   */
  refundPago(id: number, amount?: number): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${id}/refund`, {
      amount,
    });
  }

  /**
   * Redirige al usuario a la página de pago de MercadoPago
   * @param initPoint URL del checkout de MercadoPago
   */
  redirectToMercadoPago(initPoint: string): void {
    window.location.href = initPoint;
  }

  /**
   * Formatea el estado del pago para mostrar al usuario
   * @param estado Estado del pago
   * @returns Texto formateado del estado
   */
  formatEstado(estado: EstadoPago): string {
    const estados: { [key in EstadoPago]: string } = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      authorized: 'Autorizado',
      in_process: 'En Proceso',
      in_mediation: 'En Mediación',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
      charged_back: 'Contracargado',
    };
    return estados[estado] || estado;
  }

  /**
   * Obtiene el color asociado al estado del pago
   * @param estado Estado del pago
   * @returns Color CSS para el estado
   */
  getEstadoColor(estado: EstadoPago): string {
    const colores: { [key in EstadoPago]: string } = {
      pending: '#FFA500',
      approved: '#28A745',
      authorized: '#17A2B8',
      in_process: '#007BFF',
      in_mediation: '#6C757D',
      rejected: '#DC3545',
      cancelled: '#6C757D',
      refunded: '#FFC107',
      charged_back: '#DC3545',
    };
    return colores[estado] || '#6C757D';
  }
}
