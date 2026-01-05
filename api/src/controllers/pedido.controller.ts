import { Request, Response } from "express";
import pedidoService from "../services/pedido.service";
import emailService from "../services/email.service";
import {
  NuevoPedido,
  ActualizarPedido,
  PedidoFilters,
  EstadoPedido,
  Pedido,
} from "../types";

/**
 * Controller for handling Pedido HTTP requests
 */
export class PedidoController {
  /**
   * GET /api/pedidos
   * Get all pedidos with optional filters and pagination
   */
  async getPedidos(req: Request, res: Response): Promise<void> {
    try {
      const {
        nombre_comercio,
        email,
        localidad,
        estado,
        fechaInicio,
        fechaFin,
        orderBy,
        orderDirection,
        page,
        limit,
      } = req.query;

      const filters: PedidoFilters = {
        nombre_comercio: nombre_comercio as string,
        email: email as string,
        localidad: localidad as string,
        estado: estado as EstadoPedido,
        fechaInicio: fechaInicio as string,
        fechaFin: fechaFin as string,
        orderBy: orderBy as any,
        orderDirection: orderDirection as any,
      };

      const pagination = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const pedidos = await pedidoService.getPedidos(filters, pagination);

      // If pagination is requested, also get total count
      if (pagination.page && pagination.limit) {
        const total = await pedidoService.getPedidosCount(filters);
        const totalPages = Math.ceil(total / pagination.limit);

        res.json({
          success: true,
          data: pedidos,
          meta: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages,
          },
        });
      } else {
        res.json({
          success: true,
          data: pedidos,
        });
      }
    } catch (error: any) {
      console.error("Error in getPedidos:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching pedidos",
      });
    }
  }

  /**
   * GET /api/pedidos/:id
   * Get a single pedido by ID
   */
  async getPedidoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid pedido ID",
        });
        return;
      }

      const pedido = await pedidoService.getPedidoById(id);

      if (!pedido) {
        res.status(404).json({
          success: false,
          error: "Pedido not found",
        });
        return;
      }

      res.json({
        success: true,
        data: pedido,
      });
    } catch (error: any) {
      console.error("Error in getPedidoById:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching pedido",
      });
    }
  }

  /**
   * POST /api/pedidos
   * Create a new pedido
   */
  async createPedido(req: Request, res: Response): Promise<void> {
    try {
      const pedidoData: NuevoPedido = req.body;

      // Validate required fields
      if (
        !pedidoData.nombre_comercio ||
        !pedidoData.telefóno ||
        !pedidoData.localidad
      ) {
        res.status(400).json({
          success: false,
          error:
            "Missing required fields: nombre_comercio, telefóno, and localidad are required",
        });
        return;
      }

      if (
        !pedidoData.productos ||
        !Array.isArray(pedidoData.productos) ||
        pedidoData.productos.length === 0
      ) {
        res.status(400).json({
          success: false,
          error: "At least one producto is required in the order",
        });
        return;
      }

      // Set default estado to 'COBRAR' if not provided
      if (!pedidoData.estado) {
        pedidoData.estado = "COBRAR";
      }

      const newPedido = await pedidoService.createPedido(pedidoData);

      // Send email notification
      try {
        // Get admin recipients from environment variables or use a default
        const adminEmails = process.env.ADMIN_EMAIL_RECIPIENTS
          ? process.env.ADMIN_EMAIL_RECIPIENTS.split(",")
          : ["admin@elretorno.com"];

        await emailService.sendNewOrderNotification(
          newPedido as Pedido,
          adminEmails,
        );

        // If customer provided an email, also send them a confirmation
        if (newPedido.email) {
          if (newPedido.email && typeof newPedido.email === "string") {
            await emailService.sendOrderStatusNotification(
              newPedido as Pedido,
              "Nuevo",
              newPedido.email,
            );
          }
        }
      } catch (emailError) {
        console.error("Error sending order notification email:", emailError);
        // Continue with the response even if email fails
      }

      res.status(201).json({
        success: true,
        data: newPedido,
        message: "Pedido created successfully",
      });
    } catch (error: any) {
      console.error("Error in createPedido:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error creating pedido",
      });
    }
  }

  /**
   * PUT /api/pedidos/:id
   * Update an existing pedido
   */
  async updatePedido(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid pedido ID",
        });
        return;
      }

      const pedidoData: ActualizarPedido = req.body;

      const updatedPedido = await pedidoService.updatePedido(id, pedidoData);

      if (!updatedPedido) {
        res.status(404).json({
          success: false,
          error: "Pedido not found",
        });
        return;
      }

      res.json({
        success: true,
        data: updatedPedido,
        message: "Pedido updated successfully",
      });
    } catch (error: any) {
      console.error("Error in updatePedido:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error updating pedido",
      });
    }
  }

  /**
   * PATCH /api/pedidos/:id/estado
   * Update the estado of a pedido
   */
  async updateEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid pedido ID",
        });
        return;
      }

      const { estado } = req.body;

      if (!estado) {
        res.status(400).json({
          success: false,
          error: "Estado is required",
        });
        return;
      }

      const validEstados: EstadoPedido[] = [
        "COBRAR",
        "PAGO",
        "En curso",
        "Finalizado",
      ];
      if (!validEstados.includes(estado)) {
        res.status(400).json({
          success: false,
          error: `Invalid estado. Must be one of: ${validEstados.join(", ")}`,
        });
        return;
      }

      // Get the current pedido to save the previous status
      const currentPedido = await pedidoService.getPedidoById(id);
      if (!currentPedido) {
        res.status(404).json({
          success: false,
          error: "Pedido not found",
        });
        return;
      }

      const previousStatus = currentPedido.estado || "Desconocido";
      const updatedPedido = await pedidoService.updatePedido(id, { estado });

      if (!updatedPedido) {
        res.status(404).json({
          success: false,
          error: "Pedido not found",
        });
        return;
      }

      // Send email notification about status change if customer has email
      if (updatedPedido.email && typeof updatedPedido.email === "string") {
        try {
          await emailService.sendOrderStatusNotification(
            updatedPedido,
            previousStatus,
            updatedPedido.email,
          );
        } catch (emailError) {
          console.error("Error sending status update email:", emailError);
          // Continue with the response even if email fails
        }
      }

      res.json({
        success: true,
        data: updatedPedido,
        message: "Estado updated successfully",
      });
    } catch (error: any) {
      console.error("Error in updateEstado:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error updating estado",
      });
    }
  }

  /**
   * DELETE /api/pedidos/:id
   * Delete a pedido
   */
  async deletePedido(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid pedido ID",
        });
        return;
      }

      await pedidoService.deletePedido(id);

      res.json({
        success: true,
        message: "Pedido deleted successfully",
      });
    } catch (error: any) {
      console.error("Error in deletePedido:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error deleting pedido",
      });
    }
  }

  /**
   * GET /api/pedidos/search/comercio/:nombre
   * Search pedidos by nombre_comercio
   */
  async searchByComercio(req: Request, res: Response): Promise<void> {
    try {
      const nombre = req.params.nombre;

      if (!nombre) {
        res.status(400).json({
          success: false,
          error: "Search term is required",
        });
        return;
      }

      const pedidos = await pedidoService.searchByComercio(nombre);

      res.json({
        success: true,
        data: pedidos,
      });
    } catch (error: any) {
      console.error("Error in searchByComercio:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error searching pedidos",
      });
    }
  }

  /**
   * GET /api/pedidos/search/email/:email
   * Search pedidos by email
   */
  async searchByEmail(req: Request, res: Response): Promise<void> {
    try {
      const email = req.params.email;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email is required",
        });
        return;
      }

      const pedidos = await pedidoService.searchByEmail(email);

      res.json({
        success: true,
        data: pedidos,
      });
    } catch (error: any) {
      console.error("Error in searchByEmail:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error searching pedidos",
      });
    }
  }

  /**
   * GET /api/pedidos/search/localidad/:localidad
   * Search pedidos by localidad
   */
  async searchByLocalidad(req: Request, res: Response): Promise<void> {
    try {
      const localidad = req.params.localidad;

      if (!localidad) {
        res.status(400).json({
          success: false,
          error: "Localidad is required",
        });
        return;
      }

      const pedidos = await pedidoService.searchByLocalidad(localidad);

      res.json({
        success: true,
        data: pedidos,
      });
    } catch (error: any) {
      console.error("Error in searchByLocalidad:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error searching pedidos",
      });
    }
  }

  /**
   * GET /api/pedidos/latest/:limit
   * Get latest pedidos
   */
  async getLatest(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.params.limit ? parseInt(req.params.limit) : 10;

      if (isNaN(limit) || limit < 1) {
        res.status(400).json({
          success: false,
          error: "Invalid limit parameter",
        });
        return;
      }

      const pedidos = await pedidoService.getLatestPedidos(limit);

      res.json({
        success: true,
        data: pedidos,
      });
    } catch (error: any) {
      console.error("Error in getLatest:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching latest pedidos",
      });
    }
  }

  /**
   * GET /api/pedidos/date-range
   * Get pedidos by date range
   */
  async getByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          error: "Both fechaInicio and fechaFin are required",
        });
        return;
      }

      const pedidos = await pedidoService.getPedidosByDateRange(
        fechaInicio as string,
        fechaFin as string,
      );

      res.json({
        success: true,
        data: pedidos,
      });
    } catch (error: any) {
      console.error("Error in getByDateRange:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching pedidos by date range",
      });
    }
  }

  /**
   * GET /api/pedidos/producto/:productoId
   * Get pedidos that contain a specific product
   */
  async getByProducto(req: Request, res: Response): Promise<void> {
    try {
      const productoId = parseInt(req.params.productoId);

      if (isNaN(productoId)) {
        res.status(400).json({
          success: false,
          error: "Invalid producto ID",
        });
        return;
      }

      const pedidos = await pedidoService.getPedidosByProducto(productoId);

      res.json({
        success: true,
        data: pedidos,
      });
    } catch (error: any) {
      console.error("Error in getByProducto:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching pedidos by producto",
      });
    }
  }
}

export default new PedidoController();
