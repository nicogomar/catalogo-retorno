import { Request, Response } from "express";
import mensajeService from "../services/mensaje.service";

/**
 * Controlador para gestionar los mensajes
 */
export class MensajeController {
  /**
   * Obtiene todos los chats agrupados por teléfono
   */
  async getChats(_req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await mensajeService.getChats();

      if (error) {
        res.status(500).json({
          success: false,
          message: "Error al obtener chats",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data,
        count: data.length,
      });
    } catch (error: any) {
      console.error("Error in getChats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene todos los mensajes de un teléfono específico
   */
  async getMensajesByTelefono(req: Request, res: Response): Promise<void> {
    try {
      const { telefono } = req.params;

      if (!telefono) {
        res.status(400).json({
          success: false,
          message: "El teléfono es requerido",
        });
        return;
      }

      const { data, error } = await mensajeService.getMensajesByTelefono(
        telefono
      );

      if (error) {
        res.status(500).json({
          success: false,
          message: "Error al obtener mensajes",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data,
        count: data.length,
      });
    } catch (error: any) {
      console.error("Error in getMensajesByTelefono:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Crea un nuevo mensaje
   */
  async createMensaje(req: Request, res: Response): Promise<void> {
    try {
      const { telefono, mensaje, esAdmin } = req.body;

      if (!telefono || !mensaje) {
        res.status(400).json({
          success: false,
          message: "El teléfono y el mensaje son requeridos",
        });
        return;
      }

      const { data, error } = await mensajeService.createMensaje(
        telefono,
        mensaje,
        esAdmin || true
      );

      if (error) {
        res.status(500).json({
          success: false,
          message: "Error al crear mensaje",
          error,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: "Mensaje creado exitosamente",
        data,
      });
    } catch (error: any) {
      console.error("Error in createMensaje:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Elimina un mensaje
   */
  async deleteMensaje(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "El ID del mensaje es requerido",
        });
        return;
      }

      const { success, error } = await mensajeService.deleteMensaje(
        parseInt(id)
      );

      if (error || !success) {
        res.status(500).json({
          success: false,
          message: "Error al eliminar mensaje",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Mensaje eliminado exitosamente",
      });
    } catch (error: any) {
      console.error("Error in deleteMensaje:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene la cantidad total de mensajes
   */
  async getMensajesCount(_req: Request, res: Response): Promise<void> {
    try {
      const { count, error } = await mensajeService.getMensajesCount();

      if (error) {
        res.status(500).json({
          success: false,
          message: "Error al obtener cantidad de mensajes",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          count,
        },
      });
    } catch (error: any) {
      console.error("Error in getMensajesCount:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}
