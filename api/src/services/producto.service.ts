import { supabase, supabaseAdmin } from '../config/database';
import {
  Producto,
  NuevoProducto,
  ActualizarProducto,
  ProductoFilters,
  PaginationParams
} from '../types';

/**
 * Service for handling Producto database operations
 */
export class ProductoService {
  private readonly TABLE_NAME = 'producto';

  /**
   * Get all productos with optional filters and pagination
   */
  async getProductos(
    filters?: ProductoFilters,
    pagination?: PaginationParams
  ): Promise<Producto[]> {
    try {
      let query = supabase.from(this.TABLE_NAME).select('*');

      // Apply filters
      if (filters?.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`);
      }

      if (filters?.precioMin !== undefined) {
        query = query.gte('precio', filters.precioMin);
      }

      if (filters?.precioMax !== undefined) {
        query = query.lte('precio', filters.precioMax);
      }

      // Apply ordering
      const orderBy = filters?.orderBy || 'created_at';
      const orderDirection = filters?.orderDirection || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

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

      return data as Producto[];
    } catch (error) {
      console.error('Error getting productos:', error);
      throw error;
    }
  }

  /**
   * Get a single producto by ID
   */
  async getProductoById(id: number): Promise<Producto | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data as Producto;
    } catch (error) {
      console.error(`Error getting producto with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new producto
   */
  async createProducto(producto: NuevoProducto): Promise<Producto> {
    try {
      // Try with regular client first
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(producto)
        .select()
        .single();

      if (error) {
        console.log('Trying with admin client...');
        // If regular client fails, try with admin client
        const adminResult = await supabaseAdmin
          .from(this.TABLE_NAME)
          .insert(producto)
          .select()
          .single();

        if (adminResult.error) {
          throw adminResult.error;
        }

        return adminResult.data as Producto;
      }

      return data as Producto;
    } catch (error) {
      console.error('Error creating producto:', error);
      throw error;
    }
  }

  /**
   * Update an existing producto
   */
  async updateProducto(
    id: number,
    producto: ActualizarProducto
  ): Promise<Producto | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(producto)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data as Producto;
    } catch (error) {
      console.error(`Error updating producto with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a producto
   */
  async deleteProducto(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting producto with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search productos by name
   */
  async searchByNombre(nombre: string): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .ilike('nombre', `%${nombre}%`)
        .order('nombre', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Producto[];
    } catch (error) {
      console.error('Error searching productos by nombre:', error);
      throw error;
    }
  }

  /**
   * Get productos ordered by price
   */
  async getProductosOrderByPrecio(ascending: boolean = true): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('precio', { ascending });

      if (error) {
        throw error;
      }

      return data as Producto[];
    } catch (error) {
      console.error('Error getting productos ordered by precio:', error);
      throw error;
    }
  }

  /**
   * Get latest productos
   */
  async getLatestProductos(limit: number = 10): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data as Producto[];
    } catch (error) {
      console.error('Error getting latest productos:', error);
      throw error;
    }
  }

  /**
   * Get total count of productos
   */
  async getProductosCount(filters?: ProductoFilters): Promise<number> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      // Apply same filters as getProductos
      if (filters?.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`);
      }

      if (filters?.precioMin !== undefined) {
        query = query.gte('precio', filters.precioMin);
      }

      if (filters?.precioMax !== undefined) {
        query = query.lte('precio', filters.precioMax);
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting productos count:', error);
      throw error;
    }
  }
}

export default new ProductoService();
