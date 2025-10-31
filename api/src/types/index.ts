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
 * Método de pago del pedido
 */
export type MetodoPagoPedido = "mercadopago" | "contra_entrega";

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
  metodo_pago?: MetodoPagoPedido | null;
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
  metodo_pago?: MetodoPagoPedido | null;
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
  metodo_pago?: MetodoPagoPedido | null;
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

/**
 * MercadoPago Payment Types
 */

/**
 * Estado del pago
 */
export type EstadoPago =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

/**
 * Método de pago
 */
export type MetodoPago =
  | "credit_card"
  | "debit_card"
  | "account_money"
  | "ticket"
  | "bank_transfer"
  | "atm"
  | "prepaid_card";

/**
 * Item para preference de MercadoPago
 */
export interface MercadoPagoItem {
  id?: string;
  title: string;
  description?: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  currency_id?: string;
  unit_price: number;
}

/**
 * Payer (pagador) de MercadoPago
 */
export interface MercadoPagoPayer {
  name?: string;
  surname?: string;
  email?: string;
  phone?: {
    area_code?: string;
    number?: string;
  };
  identification?: {
    type?: string;
    number?: string;
  };
  address?: {
    zip_code?: string;
    street_name?: string;
    street_number?: number;
  };
}

/**
 * URLs de retorno
 */
export interface MercadoPagoBackUrls {
  success?: string;
  failure?: string;
  pending?: string;
}

/**
 * Preference de pago de MercadoPago
 */
export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer?: MercadoPagoPayer;
  back_urls?: MercadoPagoBackUrls;
  auto_return?: "approved" | "all";
  external_reference?: string;
  notification_url?: string;
  statement_descriptor?: string;
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

/**
 * Respuesta de creación de preference
 */
export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
  date_created?: string;
  items?: MercadoPagoItem[];
  payer?: MercadoPagoPayer;
  back_urls?: MercadoPagoBackUrls;
  auto_return?: string;
  external_reference?: string;
}

/**
 * Webhook notification de MercadoPago
 */
export interface MercadoPagoWebhook {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type:
    | "payment"
    | "plan"
    | "subscription"
    | "invoice"
    | "point_integration_wh";
  user_id: string;
}

/**
 * Información del pago
 */
export interface MercadoPagoPaymentInfo {
  id: number;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
  money_release_date?: string;
  operation_type: string;
  issuer_id?: string;
  payment_method_id: string;
  payment_type_id: string;
  status: EstadoPago;
  status_detail: string;
  currency_id: string;
  description?: string;
  live_mode: boolean;
  transaction_amount: number;
  transaction_amount_refunded?: number;
  coupon_amount?: number;
  taxes_amount?: number;
  shipping_amount?: number;
  installments: number;
  external_reference?: string;
  payer?: {
    id?: string;
    email?: string;
    identification?: {
      type?: string;
      number?: string;
    };
    type?: string;
  };
  metadata?: any;
}

/**
 * Pago entity - representa un pago en la base de datos
 */
export interface Pago {
  id?: number;
  created_at?: string;
  pedido_id?: number | null;
  mercadopago_payment_id?: string | null;
  mercadopago_preference_id?: string | null;
  estado?: EstadoPago | null;
  metodo_pago?: string | null;
  monto?: number | null;
  moneda?: string | null;
  external_reference?: string | null;
  fecha_aprobacion?: string | null;
  detalles?: any | null;
}

/**
 * Input para crear un nuevo pago
 */
export interface NuevoPago {
  pedido_id: number;
  mercadopago_preference_id?: string;
  external_reference?: string;
  items: MercadoPagoItem[];
  payer?: MercadoPagoPayer;
}

/**
 * Input para actualizar un pago
 */
export interface ActualizarPago {
  mercadopago_payment_id?: string;
  estado?: EstadoPago;
  metodo_pago?: string;
  monto?: number;
  moneda?: string;
  fecha_aprobacion?: string;
  detalles?: any;
}

/**
 * Respuesta de creación de pago
 */
export interface CrearPagoResponse {
  success: boolean;
  data?: {
    pago_id: number;
    preference_id: string;
    init_point: string;
    sandbox_init_point?: string;
  };
  error?: string;
}
