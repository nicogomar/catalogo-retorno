import { supabase, supabaseAdmin } from "../config/database";
import {
  Pedido,
  NuevoPedido,
  ActualizarPedido,
  PedidoFilters,
  PaginationParams,
} from "../types";

/**
 * Service for handling Pedido database operations
 */
export class PedidoService {
  private readonly TABLE_NAME = "pedido";

  /**
   * Get all pedidos with optional filters and pagination
   */
  async getPedidos(
    filters?: PedidoFilters,
    pagination?: PaginationParams,
  ): Promise<Pedido[]> {
    try {
      let query = supabaseAdmin.from(this.TABLE_NAME).select("*");

      // Apply filters
      if (filters?.nombre_comercio) {
        query = query.ilike("nombre_comercio", `%${filters.nombre_comercio}%`);
      }

      if (filters?.email) {
        query = query.ilike("email", `%${filters.email}%`);
      }

      if (filters?.localidad) {
        query = query.ilike("localidad", `%${filters.localidad}%`);
      }

      if (filters?.estado) {
        query = query.eq("estado", filters.estado);
      }

      if (filters?.fechaInicio) {
        query = query.gte("created_at", filters.fechaInicio);
      }

      if (filters?.fechaFin) {
        query = query.lte("created_at", filters.fechaFin);
      }

      // Apply ordering
      const orderBy = filters?.orderBy || "created_at";
      const orderDirection = filters?.orderDirection || "desc";
      query = query.order(orderBy, { ascending: orderDirection === "asc" });

      // Apply pagination
      if (pagination?.page && pagination?.limit) {
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Pedido[];
    } catch (error) {
      console.error("Error getting pedidos:", error);
      throw error;
    }
  }

  /**
   * Get a single pedido by ID
   */
  async getPedidoById(id: number): Promise<Pedido | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data as Pedido;
    } catch (error) {
      console.error(`Error getting pedido with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new pedido
   */
  async createPedido(pedido: NuevoPedido): Promise<Pedido> {
    try {
      // Try with regular client first
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(pedido)
        .select()
        .single();

      if (error) {
        console.log("Trying with admin client...");
        // If regular client fails, try with admin client
        const adminResult = await supabaseAdmin
          .from(this.TABLE_NAME)
          .insert(pedido)
          .select()
          .single();

        if (adminResult.error) {
          throw adminResult.error;
        }

        console.log("Pedido created with admin client");
        return adminResult.data as Pedido;
      }

      return data as Pedido;
    } catch (error) {
      console.error("Error creating pedido:", error);
      throw error;
    }
  }

  /**
   * Update an existing pedido
   */
  async updatePedido(
    id: number,
    pedido: ActualizarPedido,
  ): Promise<Pedido | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .update(pedido)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data as Pedido;
    } catch (error) {
      console.error(`Error updating pedido with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a pedido
   */
  async deletePedido(id: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting pedido with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search pedidos by nombre_comercio
   */
  async searchByComercio(nombreComercio: string): Promise<Pedido[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select("*")
        .ilike("nombre_comercio", `%${nombreComercio}%`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Pedido[];
    } catch (error) {
      console.error("Error searching pedidos by comercio:", error);
      throw error;
    }
  }

  /**
   * Search pedidos by email
   */
  async searchByEmail(email: string): Promise<Pedido[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select("*")
        .ilike("email", `%${email}%`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Pedido[];
    } catch (error) {
      console.error("Error searching pedidos by email:", error);
      throw error;
    }
  }

  /**
   * Search pedidos by localidad
   */
  async searchByLocalidad(localidad: string): Promise<Pedido[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select("*")
        .ilike("localidad", `%${localidad}%`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Pedido[];
    } catch (error) {
      console.error("Error searching pedidos by localidad:", error);
      throw error;
    }
  }

  /**
   * Get latest pedidos
   */
  async getLatestPedidos(limit: number = 10): Promise<Pedido[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data as Pedido[];
    } catch (error) {
      console.error("Error getting latest pedidos:", error);
      throw error;
    }
  }

  /**
   * Get pedidos by date range
   */
  async getPedidosByDateRange(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<Pedido[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select("*")
        .gte("created_at", fechaInicio)
        .lte("created_at", fechaFin)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Pedido[];
    } catch (error) {
      console.error("Error getting pedidos by date range:", error);
      throw error;
    }
  }

  /**
   * Get pedidos that contain a specific product
   */
  async getPedidosByProducto(productoId: number): Promise<Pedido[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select("*")
        .contains("productos", [{ id: productoId }])
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Pedido[];
    } catch (error) {
      console.error("Error getting pedidos by producto:", error);
      throw error;
    }
  }

  /**
   * Get total count of pedidos
   */
  async getPedidosCount(filters?: PedidoFilters): Promise<number> {
    try {
      let query = supabaseAdmin
        .from(this.TABLE_NAME)
        .select("*", { count: "exact", head: true });

      // Apply same filters as getPedidos
      if (filters?.nombre_comercio) {
        query = query.ilike("nombre_comercio", `%${filters.nombre_comercio}%`);
      }

      if (filters?.email) {
        query = query.ilike("email", `%${filters.email}%`);
      }

      if (filters?.localidad) {
        query = query.ilike("localidad", `%${filters.localidad}%`);
      }

      if (filters?.estado) {
        query = query.eq("estado", filters.estado);
      }

      if (filters?.fechaInicio) {
        query = query.gte("created_at", filters.fechaInicio);
      }

      if (filters?.fechaFin) {
        query = query.lte("created_at", filters.fechaFin);
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error("Error getting pedidos count:", error);
      throw error;
    }
  }
}

export default new PedidoService();
