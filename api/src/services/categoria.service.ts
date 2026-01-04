import { supabase, supabaseAdmin } from '../config/database';
import {
  Categoria,
  NuevaCategoria,
  ActualizarCategoria,
  CategoriaFilters,
  PaginationParams
} from '../types';

/**
 * Service for handling Categoria database operations
 */
export class CategoriaService {
  private readonly TABLE_NAME = 'categoria';

  /**
   * Get all categorias with optional filters and pagination
   */
  async getCategorias(
    filters?: CategoriaFilters,
    pagination?: PaginationParams
  ): Promise<Categoria[]> {
    try {
      let query = supabase.from(this.TABLE_NAME).select('*');

      // Apply filters
      if (filters?.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`);
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

      return data as Categoria[];
    } catch (error) {
      console.error('Error getting categorias:', error);
      throw error;
    }
  }

  /**
   * Get a single categoria by ID
   */
  async getCategoriaById(id: number): Promise<Categoria | null> {
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

      return data as Categoria;
    } catch (error) {
      console.error(`Error getting categoria with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new categoria
   */
  async createCategoria(categoria: NuevaCategoria): Promise<Categoria> {
    try {
      // Try with regular client first
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(categoria)
        .select()
        .single();

      if (error) {
        console.log('Trying with admin client...');
        // If regular client fails, try with admin client
        const adminResult = await supabaseAdmin
          .from(this.TABLE_NAME)
          .insert(categoria)
          .select()
          .single();

        if (adminResult.error) {
          throw adminResult.error;
        }

        return adminResult.data as Categoria;
      }

      return data as Categoria;
    } catch (error) {
      console.error('Error creating categoria:', error);
      throw error;
    }
  }

  /**
   * Update an existing categoria
   */
  async updateCategoria(
    id: number,
    categoria: ActualizarCategoria
  ): Promise<Categoria | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(categoria)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data as Categoria;
    } catch (error) {
      console.error(`Error updating categoria with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a categoria
   */
  async deleteCategoria(id: number): Promise<boolean> {
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
      console.error(`Error deleting categoria with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search categorias by name
   */
  async searchByNombre(nombre: string): Promise<Categoria[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .ilike('nombre', `%${nombre}%`)
        .order('nombre', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Categoria[];
    } catch (error) {
      console.error('Error searching categorias by nombre:', error);
      throw error;
    }
  }

  /**
   * Get categorias ordered by name
   */
  async getCategoriasOrderByNombre(ascending: boolean = true): Promise<Categoria[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('nombre', { ascending });

      if (error) {
        throw error;
      }

      return data as Categoria[];
    } catch (error) {
      console.error('Error getting categorias ordered by nombre:', error);
      throw error;
    }
  }

  /**
   * Get latest categorias
   */
  async getLatestCategorias(limit: number = 10): Promise<Categoria[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data as Categoria[];
    } catch (error) {
      console.error('Error getting latest categorias:', error);
      throw error;
    }
  }

  /**
   * Get total count of categorias
   */
  async getCategoriasCount(filters?: CategoriaFilters): Promise<number> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      // Apply same filters as getCategorias
      if (filters?.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`);
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting categorias count:', error);
      throw error;
    }
  }
}

export default new CategoriaService();
