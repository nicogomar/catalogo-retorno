import { supabase, supabaseAdmin } from "../config/database";
import {
  Usuario,
  NuevoUsuario,
  ActualizarUsuario,
  UsuarioFilters,
  PaginationParams,
} from "../types";

/**
 * Service for handling Usuario database operations
 */
export class UsuarioService {
  private readonly TABLE_NAME = "usuario";

  /**
   * Get all usuarios with optional filters and pagination
   */
  async getUsuarios(
    filters?: UsuarioFilters,
    pagination?: PaginationParams,
  ): Promise<Usuario[]> {
    try {
      let query = supabase.from(this.TABLE_NAME).select("*");

      // Apply filters
      if (filters?.correo_electronico) {
        query = query.ilike("usuario", `%${filters.correo_electronico}%`);
      }

      if (filters?.rol) {
        query = query.eq("rol", filters.rol);
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

      // Remove sensitive data
      return data.map((user) => this.sanitizeUsuario(user)) as Usuario[];
    } catch (error) {
      console.error("Error getting usuarios:", error);
      throw error;
    }
  }

  /**
   * Get a single usuario by ID
   */
  async getUsuarioById(id: number): Promise<Usuario | null> {
    try {
      const { data, error } = await supabase
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

      return this.sanitizeUsuario(data) as Usuario;
    } catch (error) {
      console.error(`Error getting usuario with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single usuario by email
   */
  async getUsuarioByEmail(email: string): Promise<Usuario | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("usuario", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data as Usuario;
    } catch (error) {
      console.error(`Error getting usuario with email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Create a new usuario
   */
  async createUsuario(usuario: NuevoUsuario): Promise<Usuario> {
    try {
      // Try with regular client first
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(usuario)
        .select()
        .single();

      if (error) {
        console.log("Trying with admin client...");
        // If regular client fails, try with admin client
        const adminResult = await supabaseAdmin
          .from(this.TABLE_NAME)
          .insert(usuario)
          .select()
          .single();

        if (adminResult.error) {
          throw adminResult.error;
        }

        return this.sanitizeUsuario(adminResult.data) as Usuario;
      }

      return this.sanitizeUsuario(data) as Usuario;
    } catch (error) {
      console.error("Error creating usuario:", error);
      throw error;
    }
  }

  /**
   * Update an existing usuario
   */
  async updateUsuario(
    id: number,
    usuario: ActualizarUsuario,
  ): Promise<Usuario | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(usuario)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return this.sanitizeUsuario(data) as Usuario;
    } catch (error) {
      console.error(`Error updating usuario with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a usuario
   */
  async deleteUsuario(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting usuario with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get total count of usuarios
   */
  async getUsuariosCount(filters?: UsuarioFilters): Promise<number> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact", head: true });

      // Apply same filters as getUsuarios
      if (filters?.correo_electronico) {
        query = query.ilike(
          "correo_electronico",
          `%${filters.correo_electronico}%`,
        );
      }

      if (filters?.rol) {
        query = query.eq("rol", filters.rol);
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error("Error getting usuarios count:", error);
      throw error;
    }
  }

  /**
   * Remove sensitive fields from usuario object
   */
  private sanitizeUsuario(usuario: any): Usuario {
    const { clave, ...sanitizedUsuario } = usuario;
    // Map DB fields to expected fields in the type
    return {
      ...sanitizedUsuario,
      correo_electronico: usuario.usuario,
      contraseña: undefined,
    };
  }
}

export default new UsuarioService();
