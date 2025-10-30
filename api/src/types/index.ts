/**
 * Database Types for Catalogo KDN
 * These interfaces match the Supabase database schema
 */

/**
 * User entity - represents an authenticated user
 */
export interface User {
  id: string;
  email: string;
  role?: string;
  nombre?: string | null;
}

/**
 * Producto entity - represents a product in the catalog
 */
export interface Producto {
  id?: number;
  created_at?: string;
  nombre?: string | null;
  peso?: string | null;
  precio?: number | null;
  img_url?: string | null;
  descripcion?: string | null;
}

/**
 * Input type for creating a new Producto (without auto-generated fields)
 */
export interface NuevoProducto {
  nombre: string;
  peso?: string | null;
  precio: number;
  img_url?: string | null;
  descripcion?: string | null;
}

/**
 * Input type for updating a Producto (all fields optional)
 */
export interface ActualizarProducto {
  nombre?: string | null;
  peso?: string | null;
  precio?: number | null;
  img_url?: string | null;
  descripcion?: string | null;
}

/**
 * Item in a pedido (order)
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
 * Estado del pedido
 */
export type EstadoPedido = "Pendiente" | "Aprobado" | "En curso" | "Finalizado";

/**
 * Pedido entity - represents an order in the system
 */
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
}

/**
 * Input type for creating a new Pedido
 */
export interface NuevoPedido {
  nombre_comercio: string;
  telefóno: string;
  email?: string | null;
  localidad: string;
  productos: ItemPedido[];
  detalles?: string | null;
  estado?: EstadoPedido | null;
}

/**
 * Input type for updating a Pedido
 */
export interface ActualizarPedido {
  nombre_comercio?: string | null;
  telefóno?: string | null;
  email?: string | null;
  localidad?: string | null;
  productos?: ItemPedido[] | null;
  detalles?: string | null;
  estado?: EstadoPedido | null;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  error?: string;
}

/**
 * Query filters for Productos
 */
export interface ProductoFilters {
  nombre?: string;
  precioMin?: number;
  precioMax?: number;
  orderBy?: "nombre" | "precio" | "created_at";
  orderDirection?: "asc" | "desc";
}

/**
 * Query filters for Pedidos
 */
export interface PedidoFilters {
  nombre_comercio?: string;
  email?: string;
  localidad?: string;
  estado?: EstadoPedido;
  fechaInicio?: string;
  fechaFin?: string;
  orderBy?: "created_at" | "nombre_comercio";
  orderDirection?: "asc" | "desc";
}

/**
 * Usuario entity - represents a user in the system
 */
export interface Usuario {
  id?: number;
  created_at?: string;
  correo_electronico?: string | null;
  contraseña?: string | null;
  rol?: string | null;
  // Actual DB column names (mapping happens in the service layer)
  usuario?: string | null; // This corresponds to correo_electronico
  clave?: string | null; // This corresponds to contraseña
}

/**
 * Input type for creating a new Usuario (without auto-generated fields)
 */
export interface NuevoUsuario {
  correo_electronico?: string;
  contraseña?: string;
  rol?: string | null;
  // Actual DB column names (one of these sets must be provided)
  usuario?: string; // This corresponds to correo_electronico
  clave?: string; // This corresponds to contraseña
}

/**
 * Input type for updating a Usuario (all fields optional)
 */
export interface ActualizarUsuario {
  correo_electronico?: string | null;
  contraseña?: string | null;
  rol?: string | null;
  // Actual DB column names
  usuario?: string | null; // This corresponds to correo_electronico
  clave?: string | null; // This corresponds to contraseña
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Auth Token Response
 */
export interface AuthTokenResponse {
  user: Usuario;
  token: string;
}

/**
 * User Session
 */
export interface UserSession {
  user: Usuario;
  token: string;
  refreshToken?: string;
}

/**
 * Query filters for Usuarios
 */
export interface UsuarioFilters {
  correo_electronico?: string;
  rol?: string;
  orderBy?: "created_at" | "correo_electronico";
  orderDirection?: "asc" | "desc";
}

/**
 * Extend Request interface to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}
