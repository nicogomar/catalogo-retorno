import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

/**
 * Tipo que representa el estado de un pedido
 */
export type EstadoPedido = "Pendiente" | "Aprobado" | "En curso" | "Finalizado";

/**
 * Tipo que representa el método de pago del pedido
 */
export type MetodoPagoPedido = "mercadopago" | "contra_entrega";

/**
 * Interfaz que representa un item en un pedido
 */
export interface ItemPedido {
  id: number;
  nombre: string;
  precio: number;
  quantity: number;
  peso?: string;
  img_url?: string;
}

/**
 * Interfaz que representa la estructura de un pedido
 */
export interface Pedido {
  id?: number;
  created_at?: Date;
  nombre_comercio?: string | null;
  telefóno?: string | null;
  email?: string | null;
  localidad?: string | null;
  productos?: ItemPedido[] | null;
  detalles?: string | null;
  estado?: EstadoPedido | null;
  metodo_pago?: MetodoPagoPedido | null;
}

/**
 * Interfaz para crear un nuevo pedido (sin id y created_at)
 */
export interface NuevoPedido {
  nombre_comercio?: string | null;
  telefóno?: string | null;
  email?: string | null;
  localidad?: string | null;
  productos?: ItemPedido[] | null;
  detalles?: string | null;
  estado?: EstadoPedido | null;
  metodo_pago?: MetodoPagoPedido | null;
}

/**
 * Interfaz para filtros de pedidos
 */
export interface PedidoFilters {
  nombre_comercio?: string;
  email?: string;
  localidad?: string;
  estado?: EstadoPedido;
  fechaInicio?: string;
  fechaFin?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: "root",
})
export class PedidoService {
  private readonly endpoint = "/pedidos";

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todos los pedidos de la base de datos
   * @param filters Filtros opcionales para la consulta
   * @returns Observable con array de pedidos
   */
  getPedidos(filters?: PedidoFilters): Observable<Pedido[]> {
    return this.apiService.get<Pedido[]>(this.endpoint, filters);
  }

  /**
   * Obtiene pedidos con paginación
   * @param page Número de página
   * @param limit Cantidad de items por página
   * @param filters Filtros adicionales
   * @returns Observable con pedidos paginados
   */
  getPedidosPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: Partial<PedidoFilters>,
  ): Observable<Pedido[]> {
    const params = { page, limit, ...filters };
    return this.apiService.get<Pedido[]>(this.endpoint, params);
  }

  /**
   * Obtiene un pedido por su ID
   * @param id ID del pedido a buscar
   * @returns Observable con el pedido encontrado
   */
  getPedidoById(id: number): Observable<Pedido> {
    return this.apiService.get<Pedido>(`${this.endpoint}/${id}`);
  }

  /**
   * Crea un nuevo pedido
   * @param pedido Datos del pedido a crear
   * @returns Observable con el pedido creado
   */
  createPedido(pedido: NuevoPedido): Observable<Pedido> {
    return this.apiService.post<Pedido>(this.endpoint, pedido);
  }

  /**
   * Actualiza un pedido existente
   * @param id ID del pedido a actualizar
   * @param pedido Datos actualizados del pedido
   * @returns Observable con el pedido actualizado
   */
  updatePedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    return this.apiService.put<Pedido>(`${this.endpoint}/${id}`, pedido);
  }

  /**
   * Actualiza solo el estado de un pedido
   * @param id ID del pedido a actualizar
   * @param estado Nuevo estado del pedido
   * @returns Observable con el pedido actualizado
   */
  updateEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.apiService.patch<Pedido>(`${this.endpoint}/${id}/estado`, {
      estado,
    });
  }

  /**
   * Elimina un pedido de la base de datos
   * @param id ID del pedido a eliminar
   * @returns Observable con la respuesta de la eliminación
   */
  deletePedido(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Busca pedidos por nombre del comercio
   * @param nombreComercio Texto para buscar en el nombre del comercio
   * @returns Observable con los pedidos que coincidan
   */
  searchPedidosByComercio(nombreComercio: string): Observable<Pedido[]> {
    return this.apiService.get<Pedido[]>(
      `${this.endpoint}/search/comercio/${nombreComercio}`,
    );
  }

  /**
   * Busca pedidos por email
   * @param email Email para buscar
   * @returns Observable con los pedidos que coincidan
   */
  searchPedidosByEmail(email: string): Observable<Pedido[]> {
    return this.apiService.get<Pedido[]>(
      `${this.endpoint}/search/email/${email}`,
    );
  }

  /**
   * Busca pedidos por localidad
   * @param localidad Localidad para buscar
   * @returns Observable con los pedidos que coincidan
   */
  searchPedidosByLocalidad(localidad: string): Observable<Pedido[]> {
    return this.apiService.get<Pedido[]>(
      `${this.endpoint}/search/localidad/${localidad}`,
    );
  }

  /**
   * Obtiene los pedidos más recientes
   * @param limit Número máximo de pedidos a retornar
   * @returns Observable con los pedidos más recientes
   */
  getLatestPedidos(limit: number = 10): Observable<Pedido[]> {
    return this.apiService.get<Pedido[]>(`${this.endpoint}/latest/${limit}`);
  }

  /**
   * Obtiene pedidos filtrados por rango de fechas
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @returns Observable con los pedidos en el rango de fechas
   */
  getPedidosByDateRange(
    fechaInicio: Date,
    fechaFin: Date,
  ): Observable<Pedido[]> {
    const params = {
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
    };
    return this.apiService.get<Pedido[]>(`${this.endpoint}/date-range`, params);
  }

  /**
   * Obtiene pedidos que contienen un producto específico
   * @param productoId ID del producto a buscar en los pedidos
   * @returns Observable con los pedidos que contienen el producto
   */
  getPedidosByProducto(productoId: number): Observable<Pedido[]> {
    return this.apiService.get<Pedido[]>(
      `${this.endpoint}/producto/${productoId}`,
    );
  }
}
