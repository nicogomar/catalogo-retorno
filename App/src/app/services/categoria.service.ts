import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

/**
 * Interfaz que representa la estructura de una categoría
 */
export interface Categoria {
  id?: number;
  created_at?: Date;
  nombre?: string | null;
}

/**
 * Interfaz para filtros de categorías
 */
export interface CategoriaFilters {
  nombre?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Interfaz para crear una nueva categoría
 */
export interface NuevaCategoria {
  nombre: string;
}

/**
 * Interfaz para actualizar una categoría
 */
export interface ActualizarCategoria {
  nombre?: string | null;
}

/**
 * Interfaz para respuesta paginada
 */
export interface CategoriasResponse {
  success: boolean;
  data: Categoria[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: "root",
})
export class CategoriaService {
  private readonly endpoint = "/categorias";

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todas las categorías de la base de datos
   * @param filters Filtros opcionales para la consulta
   * @returns Observable con array de categorías
   */
  getCategorias(filters?: CategoriaFilters): Observable<Categoria[]> {
    return this.apiService.get<Categoria[]>(this.endpoint, filters);
  }

  /**
   * Obtiene categorías con paginación
   * @param page Número de página
   * @param limit Cantidad de items por página
   * @param filters Filtros adicionales
   * @returns Observable con categorías paginadas
   */
  getCategoriasPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: Partial<CategoriaFilters>,
  ): Observable<CategoriasResponse> {
    const params = { page, limit, ...filters };
    return this.apiService.get<CategoriasResponse>(this.endpoint, params);
  }

  /**
   * Obtiene una categoría por su ID
   * @param id ID de la categoría a buscar
   * @returns Observable con la categoría encontrada
   */
  getCategoriaById(id: number): Observable<Categoria> {
    return this.apiService.get<Categoria>(`${this.endpoint}/${id}`);
  }

  /**
   * Crea una nueva categoría
   * @param categoria Datos de la categoría a crear
   * @returns Observable con la categoría creada
   */
  createCategoria(categoria: NuevaCategoria): Observable<Categoria> {
    return this.apiService.post<Categoria>(this.endpoint, categoria);
  }

  /**
   * Actualiza una categoría existente
   * @param id ID de la categoría a actualizar
   * @param categoria Datos actualizados de la categoría
   * @returns Observable con la categoría actualizada
   */
  updateCategoria(
    id: number,
    categoria: ActualizarCategoria,
  ): Observable<Categoria> {
    return this.apiService.put<Categoria>(`${this.endpoint}/${id}`, categoria);
  }

  /**
   * Elimina una categoría de la base de datos
   * @param id ID de la categoría a eliminar
   * @returns Observable con la respuesta de la eliminación
   */
  deleteCategoria(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Busca categorías por nombre
   * @param nombre Texto para buscar en el nombre de la categoría
   * @returns Observable con las categorías que coincidan
   */
  searchCategoriasByNombre(nombre: string): Observable<Categoria[]> {
    return this.apiService.get<Categoria[]>(`${this.endpoint}/search/${nombre}`);
  }

  /**
   * Obtiene las categorías más recientes
   * @param limit Número máximo de categorías a retornar
   * @returns Observable con las categorías más recientes
   */
  getLatestCategorias(limit: number = 10): Observable<Categoria[]> {
    return this.apiService.get<Categoria[]>(`${this.endpoint}/latest/${limit}`);
  }

  /**
   * Obtiene categorías ordenadas por nombre
   * @param ascending True para ordenar ascendente, False para descendente
   * @returns Observable con las categorías ordenadas por nombre
   */
  getCategoriasOrderByNombre(ascending: boolean = true): Observable<Categoria[]> {
    const direction = ascending ? "asc" : "desc";
    return this.apiService.get<Categoria[]>(
      `${this.endpoint}/order-by-nombre/${direction}`,
    );
  }

  /**
   * Obtiene el conteo total de categorías
   * @param filters Filtros opcionales
   * @returns Observable con el conteo de categorías
   */
  getCategoriasCount(filters?: Partial<CategoriaFilters>): Observable<{ count: number }> {
    return this.apiService.get<{ count: number }>(`${this.endpoint}/count`, filters);
  }
}
