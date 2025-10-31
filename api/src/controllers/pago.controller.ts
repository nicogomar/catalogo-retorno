import { Request, Response } from "express";
import pagoService from "../services/pago.service";
import mercadoPagoService from "../services/mercadopago.service";
import {
  NuevoPago,
  ActualizarPago,
  EstadoPago,
  MercadoPagoWebhook,
} from "../types";

/**
 * Controller for handling Pago (Payment) HTTP requests
 */
export class PagoController {
  /**
   * POST /api/pagos
   * Create a new payment and MercadoPago preference
   */
  async createPago(req: Request, res: Response): Promise<void> {
    try {
      const pagoData: NuevoPago = req.body;

      // Validate required fields
      if (!pagoData.pedido_id) {
        res.status(400).json({
          success: false,
          error: "pedido_id is required",
        });
        return;
      }

      if (
        !pagoData.items ||
        !Array.isArray(pagoData.items) ||
        pagoData.items.length === 0
      ) {
        res.status(400).json({
          success: false,
          error: "At least one item is required",
        });
        return;
      }

      // Validate items
      for (const item of pagoData.items) {
        if (!item.title || !item.quantity || !item.unit_price) {
          res.status(400).json({
            success: false,
            error: "Each item must have title, quantity, and unit_price",
          });
          return;
        }

        if (item.quantity <= 0 || item.unit_price <= 0) {
          res.status(400).json({
            success: false,
            error: "Quantity and unit_price must be greater than 0",
          });
          return;
        }
      }

      const result = await pagoService.createPago(pagoData);

      res.status(201).json({
        success: true,
        data: {
          pago_id: result.pago.id,
          preference_id: result.preference.id,
          init_point: result.preference.init_point,
          sandbox_init_point: result.preference.sandbox_init_point,
        },
        message: "Payment created successfully",
      });
    } catch (error: any) {
      console.error("Error in createPago:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error creating payment",
      });
    }
  }

  /**
   * GET /api/pagos/:id
   * Get a single payment by ID
   */
  async getPagoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid payment ID",
        });
        return;
      }

      const pago = await pagoService.getPagoById(id);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: "Payment not found",
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
      });
    } catch (error: any) {
      console.error("Error in getPagoById:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching payment",
      });
    }
  }

  /**
   * GET /api/pagos
   * Get all payments with optional filters
   */
  async getPagos(req: Request, res: Response): Promise<void> {
    try {
      const { estado, pedido_id, fecha_inicio, fecha_fin } = req.query;

      const filters: any = {};

      if (estado) {
        filters.estado = estado as EstadoPago;
      }

      if (pedido_id) {
        filters.pedido_id = parseInt(pedido_id as string);
      }

      if (fecha_inicio) {
        filters.fecha_inicio = fecha_inicio as string;
      }

      if (fecha_fin) {
        filters.fecha_fin = fecha_fin as string;
      }

      const pagos = await pagoService.getPagos(filters);

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error: any) {
      console.error("Error in getPagos:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching payments",
      });
    }
  }

  /**
   * GET /api/pagos/pedido/:pedidoId
   * Get all payments for a specific pedido
   */
  async getPagosByPedidoId(req: Request, res: Response): Promise<void> {
    try {
      const pedidoId = parseInt(req.params.pedidoId);

      if (isNaN(pedidoId)) {
        res.status(400).json({
          success: false,
          error: "Invalid pedido ID",
        });
        return;
      }

      const pagos = await pagoService.getPagosByPedidoId(pedidoId);

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error: any) {
      console.error("Error in getPagosByPedidoId:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching payments for pedido",
      });
    }
  }

  /**
   * GET /api/pagos/external-reference/:reference
   * Get payment by external reference
   */
  async getPagoByExternalReference(req: Request, res: Response): Promise<void> {
    try {
      const reference = req.params.reference;

      if (!reference) {
        res.status(400).json({
          success: false,
          error: "External reference is required",
        });
        return;
      }

      const pago = await pagoService.getPagoByExternalReference(reference);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: "Payment not found",
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
      });
    } catch (error: any) {
      console.error("Error in getPagoByExternalReference:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching payment",
      });
    }
  }

  /**
   * GET /api/pagos/mercadopago/:paymentId
   * Get payment information from MercadoPago
   */
  async getMercadoPagoPaymentInfo(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = req.params.paymentId;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          error: "Payment ID is required",
        });
        return;
      }

      const paymentInfo = await mercadoPagoService.getPayment(paymentId);

      res.json({
        success: true,
        data: paymentInfo,
      });
    } catch (error: any) {
      console.error("Error in getMercadoPagoPaymentInfo:", error);
      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Error fetching payment information from MercadoPago",
      });
    }
  }

  /**
   * GET /api/pagos/stats
   * Get payment statistics
   */
  async getPagoStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await pagoService.getPagoStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error in getPagoStats:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching payment statistics",
      });
    }
  }

  /**
   * PUT /api/pagos/:id
   * Update a payment
   */
  async updatePago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid payment ID",
        });
        return;
      }

      const pagoData: ActualizarPago = req.body;

      const updatedPago = await pagoService.updatePago(id, pagoData);

      if (!updatedPago) {
        res.status(404).json({
          success: false,
          error: "Payment not found",
        });
        return;
      }

      res.json({
        success: true,
        data: updatedPago,
        message: "Payment updated successfully",
      });
    } catch (error: any) {
      console.error("Error in updatePago:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error updating payment",
      });
    }
  }

  /**
   * PATCH /api/pagos/:id/estado
   * Update payment status
   */
  async updateEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid payment ID",
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

      const validEstados: EstadoPago[] = [
        "pending",
        "approved",
        "authorized",
        "in_process",
        "in_mediation",
        "rejected",
        "cancelled",
        "refunded",
        "charged_back",
      ];

      if (!validEstados.includes(estado)) {
        res.status(400).json({
          success: false,
          error: `Invalid estado. Must be one of: ${validEstados.join(", ")}`,
        });
        return;
      }

      const updatedPago = await pagoService.updatePago(id, { estado });

      if (!updatedPago) {
        res.status(404).json({
          success: false,
          error: "Payment not found",
        });
        return;
      }

      res.json({
        success: true,
        data: updatedPago,
        message: "Payment status updated successfully",
      });
    } catch (error: any) {
      console.error("Error in updateEstado:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error updating payment status",
      });
    }
  }

  /**
   * DELETE /api/pagos/:id
   * Delete a payment
   */
  async deletePago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid payment ID",
        });
        return;
      }

      await pagoService.deletePago(id);

      res.json({
        success: true,
        message: "Payment deleted successfully",
      });
    } catch (error: any) {
      console.error("Error in deletePago:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error deleting payment",
      });
    }
  }

  /**
   * POST /api/pagos/webhook
   * Handle MercadoPago webhook notifications
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData: MercadoPagoWebhook = req.body;

      console.log("Received MercadoPago webhook:", {
        type: webhookData.type,
        action: webhookData.action,
        data: webhookData.data,
      });

      // Validate webhook (optional but recommended)
      const signature = req.headers["x-signature"] as string;
      const requestId = req.headers["x-request-id"] as string;

      if (signature && requestId) {
        const isValid = mercadoPagoService.validateWebhookSignature(
          webhookData,
          signature,
          requestId,
        );

        if (!isValid) {
          console.warn("Invalid webhook signature");
          res.status(401).json({
            success: false,
            error: "Invalid signature",
          });
          return;
        }
      }

      // Handle different webhook types
      if (webhookData.type === "payment") {
        const paymentId = webhookData.data.id;

        // Update payment in database
        const updatedPago = await pagoService.updatePagoFromWebhook(paymentId);

        if (updatedPago) {
          console.log("Payment updated from webhook:", updatedPago.id);
        }
      }

      // Always respond with 200 to acknowledge receipt
      res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    } catch (error: any) {
      console.error("Error handling webhook:", error);

      // Still respond with 200 to avoid webhook retries
      res.status(200).json({
        success: false,
        error: error.message || "Error processing webhook",
      });
    }
  }

  /**
   * POST /api/pagos/:id/refund
   * Refund a payment
   */
  async refundPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid payment ID",
        });
        return;
      }

      const { amount } = req.body;

      const pago = await pagoService.getPagoById(id);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: "Payment not found",
        });
        return;
      }

      if (!pago.mercadopago_payment_id) {
        res.status(400).json({
          success: false,
          error: "Payment does not have a MercadoPago payment ID",
        });
        return;
      }

      if (pago.estado !== "approved") {
        res.status(400).json({
          success: false,
          error: "Only approved payments can be refunded",
        });
        return;
      }

      // Create refund in MercadoPago
      const refund = await mercadoPagoService.refundPayment(
        pago.mercadopago_payment_id,
        amount,
      );

      // Update payment status
      await pagoService.updatePago(id, {
        estado: "refunded",
        detalles: {
          ...((pago.detalles as any) || {}),
          refund: refund,
          refunded_at: new Date().toISOString(),
        },
      });

      res.json({
        success: true,
        data: refund,
        message: "Payment refunded successfully",
      });
    } catch (error: any) {
      console.error("Error in refundPago:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error refunding payment",
      });
    }
  }

  /**
   * GET /api/pagos/check-config
   * Check if MercadoPago is properly configured
   */
  async checkConfig(_req: Request, res: Response): Promise<void> {
    try {
      const isReady = mercadoPagoService.isReady();

      res.json({
        success: true,
        data: {
          configured: isReady,
          message: isReady
            ? "MercadoPago is properly configured"
            : "MercadoPago access token is not configured. Please set MERCADOPAGO_ACCESS_TOKEN environment variable",
        },
      });
    } catch (error: any) {
      console.error("Error in checkConfig:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error checking configuration",
      });
    }
  }
}

export default new PagoController();
