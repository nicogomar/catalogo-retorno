import { supabaseAdmin } from "../config/database";

/**
 * Servicio para gestionar los mensajes de contacto
 */
export class MensajeService {
  private readonly tableName = "mensajes";

  /**
   * Obtiene todos los chats agrupados por teléfono
   */
  async getChats(): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select("telefono")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error getting chats:", error);
        return { data: [], error: error.message };
      }

      // Agrupar por teléfono y obtener el último mensaje
      const chatsMap = new Map<string, any>();
      
      for (const mensaje of data) {
        if (!chatsMap.has(mensaje.telefono)) {
          chatsMap.set(mensaje.telefono, {
            telefono: mensaje.telefono,
            lastMessage: mensaje.mensaje,
            lastMessageTime: mensaje.created_at,
          });
        }
      }

      return { data: Array.from(chatsMap.values()), error: null };
    } catch (error: any) {
      console.error("Exception getting chats:", error);
      return { data: [], error: error.message || "Error al obtener chats" };
    }
  }

  /**
   * Obtiene todos los mensajes de un teléfono específico
   */
  async getMensajesByTelefono(
    telefono: string
  ): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select("*")
        .eq("telefono", telefono)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error getting messages:", error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error("Exception getting messages:", error);
      return { data: [], error: error.message || "Error al obtener mensajes" };
    }
  }

  /**
   * Crea un nuevo mensaje
   */
  async createMensaje(
    telefono: string,
    mensaje: string,
    esAdmin: boolean = true
  ): Promise<{ data: any; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .insert([
          {
            telefono,
            mensaje,
            es_admin: esAdmin,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error creating message:", error);
        return { data: null, error: error.message };
      }

      return { data: data?.[0] || null, error: null };
    } catch (error: any) {
      console.error("Exception creating message:", error);
      return { data: null, error: error.message || "Error al crear mensaje" };
    }
  }

  /**
   * Elimina un mensaje
   */
  async deleteMensaje(id: number): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting message:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Exception deleting message:", error);
      return {
        success: false,
        error: error.message || "Error al eliminar mensaje",
      };
    }
  }

  /**
   * Obtiene la cantidad total de mensajes
   */
  async getMensajesCount(): Promise<{ count: number; error: string | null }> {
    try {
      const { count, error } = await supabaseAdmin
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error getting messages count:", error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0, error: null };
    } catch (error: any) {
      console.error("Exception getting messages count:", error);
      return {
        count: 0,
        error: error.message || "Error al contar mensajes",
      };
    }
  }
}

export default new MensajeService();
