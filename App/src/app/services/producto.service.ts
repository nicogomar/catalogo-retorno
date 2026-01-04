import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

/**
 * Interfaz que representa la estructura de un producto
 */
export interface Producto {
  id?: number;
  created_at?: Date;
  nombre?: string | null;
  peso?: string | null;
  precio?: number | null;
  img_url?: string | null;
  descripcion?: string | null;
  categoria?: string | null;
}

/**
 * Interfaz para filtros de productos
 */
export interface ProductoFilters {
  nombre?: string;
  precioMin?: number;
  precioMax?: number;
  categoria?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: "root",
})
export class ProductoService {
  private readonly endpoint = "/productos";

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todos los productos de la base de datos
   * @param filters Filtros opcionales para la consulta
   * @returns Observable con array de productos
   */
  getProductos(filters?: ProductoFilters): Observable<Producto[]> {
    return this.apiService.get<Producto[]>(this.endpoint, filters);
  }

  /**
   * Obtiene productos con paginación
   * @param page Número de página
   * @param limit Cantidad de items por página
   * @param filters Filtros adicionales
   * @returns Observable con productos paginados
   */
  getProductosPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: Partial<ProductoFilters>,
  ): Observable<Producto[]> {
    const params = { page, limit, ...filters };
    return this.apiService.get<Producto[]>(this.endpoint, params);
  }

  /**
   * Obtiene un producto por su ID
   * @param id ID del producto a buscar
   * @returns Observable con el producto encontrado
   */
  getProductoById(id: number): Observable<Producto> {
    return this.apiService.get<Producto>(`${this.endpoint}/${id}`);
  }

  /**
   * Crea un nuevo producto
   * @param producto Datos del producto a crear
   * @returns Observable con el producto creado
   */
  createProducto(producto: Producto): Observable<Producto> {
    return this.apiService.post<Producto>(this.endpoint, producto);
  }

  /**
   * Actualiza un producto existente
   * @param id ID del producto a actualizar
   * @param producto Datos actualizados del producto
   * @returns Observable con el producto actualizado
   */
  updateProducto(
    id: number,
    producto: Partial<Producto>,
  ): Observable<Producto> {
    return this.apiService.put<Producto>(`${this.endpoint}/${id}`, producto);
  }

  /**
   * Elimina un producto de la base de datos
   * @param id ID del producto a eliminar
   * @returns Observable con la respuesta de la eliminación
   */
  deleteProducto(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Busca productos por nombre
   * @param nombre Texto para buscar en el nombre del producto
   * @returns Observable con los productos que coincidan
   */
  searchProductosByNombre(nombre: string): Observable<Producto[]> {
    return this.apiService.get<Producto[]>(`${this.endpoint}/search/${nombre}`);
  }

  /**
   * Obtiene los productos más recientes
   * @param limit Número máximo de productos a retornar
   * @returns Observable con los productos más recientes
   */
  getLatestProductos(limit: number = 10): Observable<Producto[]> {
    return this.apiService.get<Producto[]>(`${this.endpoint}/latest/${limit}`);
  }

  /**
   * Obtiene productos ordenados por precio
   * @param ascending True para ordenar ascendente, False para descendente
   * @returns Observable con los productos ordenados por precio
   */
  getProductosOrderByPrecio(ascending: boolean = true): Observable<Producto[]> {
    const direction = ascending ? "asc" : "desc";
    return this.apiService.get<Producto[]>(
      `${this.endpoint}/order-by-precio/${direction}`,
    );
  }

  /**
   * Obtiene productos ordenados por categoría y luego por nombre
   * @returns Observable con los productos ordenados por categoría y nombre
   */
  getProductosOrderedByCategoriaAndNombre(): Observable<Producto[]> {
    return this.apiService.get<Producto[]>(`${this.endpoint}/ordered-by-categoria-nombre`);
  }
}
