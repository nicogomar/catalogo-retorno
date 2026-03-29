import supabase from "../config/database";
import {
  Pago,
  NuevoPago,
  ActualizarPago,
  EstadoPago,
  MercadoPagoPreferenceResponse,
} from "../types";
import mercadoPagoService from "./mercadopago.service";
import pedidoService from "./pedido.service";

/**
 * Service for handling Pago database operations
 */
class PagoService {
  private readonly tableName = "pagos";

  /**
   * Create a new payment and MercadoPago preference
   * @param pagoData - Payment data including pedido_id and items
   * @returns Created payment record with preference information
   */
  async createPago(pagoData: NuevoPago): Promise<{
    pago: Pago;
    preference: MercadoPagoPreferenceResponse;
  }> {
    try {
      // Verify pedido exists
      const pedido = await pedidoService.getPedidoById(pagoData.pedido_id);
      if (!pedido) {
        throw new Error(`Pedido with ID ${pagoData.pedido_id} not found`);
      }

      // Generate external reference if not provided
      const external_reference =
        pagoData.external_reference ||
        `PEDIDO-${pagoData.pedido_id}-${Date.now()}`;

      // Create MercadoPago preference
      const preference = await mercadoPagoService.createPreference({
        items: pagoData.items,
        payer: pagoData.payer,
        external_reference: external_reference,
        back_urls: {
          success: `${process.env.FRONTEND_URL || "http://localhost:4200"}/payment/success`,
          failure: `${process.env.FRONTEND_URL || "http://localhost:4200"}/payment/failure`,
          pending: `${process.env.FRONTEND_URL || "http://localhost:4200"}/payment/pending`,
        },
        // auto_return is handled automatically by mercadoPagoService based on URL scheme (HTTPS vs HTTP)
        notification_url: `${process.env.API_URL || "http://localhost:3000"}/api/pagos/webhook`,
      });

      // Calculate total amount
      const monto = pagoData.items.reduce(
        (total, item) => total + item.unit_price * item.quantity,
        0,
      );

      // Create payment record in database
      const nuevoPago = {
        pedido_id: pagoData.pedido_id,
        mercadopago_preference_id: preference.id,
        external_reference: external_reference,
        estado: "pending" as EstadoPago,
        monto: monto,
        moneda: pagoData.items[0]?.currency_id || "UYU",
        detalles: {
          items: pagoData.items,
          payer: pagoData.payer,
          preference_created_at: preference.date_created,
        },
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(nuevoPago)
        .select()
        .single();

      if (error) {
        console.error("Error creating pago in database:", error);
        throw new Error(`Failed to create payment record: ${error.message}`);
      }

      console.log("Payment record created successfully:", data.id);

      return {
        pago: data,
        preference: preference,
      };
    } catch (error: any) {
      console.error("Error in createPago:", error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param id - Payment ID
   * @returns Payment record or null if not found
   */
  async getPagoById(id: number): Promise<Pago | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error("Error getting pago by ID:", error);
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  }

  /**
   * Get payment by pedido ID
   * @param pedidoId - Pedido ID
   * @returns Payment records for the pedido
   */
  async getPagosByPedidoId(pedidoId: number): Promise<Pago[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("pedido_id", pedidoId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error("Error getting pagos by pedido ID:", error);
      throw new Error(`Failed to get payments for pedido: ${error.message}`);
    }
  }

  /**
   * Get payment by external reference
   * @param externalReference - External reference
   * @returns Payment record or null if not found
   */
  async getPagoByExternalReference(
    externalReference: string,
  ): Promise<Pago | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("external_reference", externalReference)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error("Error getting pago by external reference:", error);
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  }

  /**
   * Get payment by MercadoPago payment ID
   * @param paymentId - MercadoPago payment ID
   * @returns Payment record or null if not found
   */
  async getPagoByMercadoPagoPaymentId(paymentId: string): Promise<Pago | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("mercadopago_payment_id", paymentId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error("Error getting pago by MercadoPago payment ID:", error);
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  }

  /**
   * Get all payments with optional filters
   * @param filters - Filter criteria
   * @returns Array of payment records
   */
  async getPagos(filters?: {
    estado?: EstadoPago;
    pedido_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<Pago[]> {
    try {
      let query = supabase.from(this.tableName).select("*");

      if (filters?.estado) {
        query = query.eq("estado", filters.estado);
      }

      if (filters?.pedido_id) {
        query = query.eq("pedido_id", filters.pedido_id);
      }

      if (filters?.fecha_inicio) {
        query = query.gte("created_at", filters.fecha_inicio);
      }

      if (filters?.fecha_fin) {
        query = query.lte("created_at", filters.fecha_fin);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error("Error getting pagos:", error);
      throw new Error(`Failed to get payments: ${error.message}`);
    }
  }

  /**
   * Update payment information
   * @param id - Payment ID
   * @param pagoData - Updated payment data
   * @returns Updated payment record or null if not found
   */
  async updatePago(id: number, pagoData: ActualizarPago): Promise<Pago | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(pagoData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      console.log("Payment updated successfully:", id);

      return data;
    } catch (error: any) {
      console.error("Error updating pago:", error);
      throw new Error(`Failed to update payment: ${error.message}`);
    }
  }

  /**
   * Update payment status from MercadoPago webhook
   * @param paymentId - MercadoPago payment ID
   * @returns Updated payment record
   */
  async updatePagoFromWebhook(paymentId: string): Promise<Pago | null> {
    try {
      // Get payment info from MercadoPago
      const paymentInfo = await mercadoPagoService.getPayment(paymentId);

      // Find payment record by external reference or create new one
      let pago: Pago | null = null;

      if (paymentInfo.external_reference) {
        pago = await this.getPagoByExternalReference(
          paymentInfo.external_reference,
        );
      }

      if (!pago) {
        // Try to find by MercadoPago payment ID
        pago = await this.getPagoByMercadoPagoPaymentId(paymentId);
      }

      if (!pago) {
        console.warn(
          `Payment record not found for MercadoPago payment ID: ${paymentId}`,
        );
        return null;
      }

      // Update payment record
      const updateData: ActualizarPago = {
        mercadopago_payment_id: paymentId,
        estado: paymentInfo.status,
        metodo_pago: paymentInfo.payment_method_id,
        monto: paymentInfo.transaction_amount,
        moneda: paymentInfo.currency_id,
        fecha_aprobacion: paymentInfo.date_approved,
        detalles: {
          ...((pago.detalles as any) || {}),
          payment_info: paymentInfo,
          updated_from_webhook: true,
          last_update: new Date().toISOString(),
        },
      };

      const updatedPago = await this.updatePago(pago.id!, updateData);

      // If payment is approved, update pedido status
      if (paymentInfo.status === "approved" && pago.pedido_id) {
        try {
          await pedidoService.updatePedido(pago.pedido_id, {
            estado: "PAGO",
          });
          console.log(`Pedido ${pago.pedido_id} status updated to PAGO`);
        } catch (error) {
          console.error("Error updating pedido status:", error);
        }
      }

      return updatedPago;
    } catch (error: any) {
      console.error("Error updating pago from webhook:", error);
      throw new Error(
        `Failed to update payment from webhook: ${error.message}`,
      );
    }
  }

  /**
   * Delete a payment record
   * @param id - Payment ID
   * @returns void
   */
  async deletePago(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      console.log("Payment deleted successfully:", id);
    } catch (error: any) {
      console.error("Error deleting pago:", error);
      throw new Error(`Failed to delete payment: ${error.message}`);
    }
  }

  /**
   * Manually sync payment status from MercadoPago
   * @param id - Payment ID in database
   * @returns Updated payment record or null if not found
   */
  async syncPaymentStatus(id: number): Promise<Pago | null> {
    try {
      console.log(`[PagoService] Starting sync for payment ID: ${id}`);
      
      // Check if MercadoPago is configured
      if (!mercadoPagoService.isReady()) {
        throw new Error("MercadoPago service is not properly configured. Please check MERCADOPAGO_ACCESS_TOKEN environment variable.");
      }
      
      // Get payment record from database
      const pago = await this.getPagoById(id);
      
      if (!pago) {
        console.error(`[PagoService] Payment record not found for ID: ${id}`);
        return null;
      }

      console.log(`[PagoService] Found payment:`, {
        id: pago.id,
        pedido_id: pago.pedido_id,
        estado: pago.estado,
        mercadopago_payment_id: pago.mercadopago_payment_id,
        external_reference: pago.external_reference
      });

      // If payment doesn't have a MercadoPago payment ID, try to find it
      if (!pago.mercadopago_payment_id && pago.external_reference) {
        console.log(`[PagoService] Searching for MercadoPago payment with external reference: ${pago.external_reference}`);
        
        try {
          const payments = await mercadoPagoService.searchPaymentsByExternalReference(pago.external_reference);
          
          if (payments.length === 0) {
            console.warn(`[PagoService] No MercadoPago payments found for external reference: ${pago.external_reference}`);
            return pago;
          }

          // Use the most recent payment
          const latestPayment = payments.sort((a, b) => 
            new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
          )[0];

          console.log(`[PagoService] Found MercadoPago payment: ${latestPayment.id}`);

          // Update the payment record with the MercadoPago payment ID
          await this.updatePago(id, {
            mercadopago_payment_id: latestPayment.id.toString(),
          });

          // Update the local pago object with the payment ID
          pago.mercadopago_payment_id = latestPayment.id.toString();
        } catch (searchError: any) {
          console.error(`[PagoService] Error searching for MercadoPago payment:`, searchError);
          throw new Error(`Error searching MercadoPago payment: ${searchError.message}`);
        }
      }

      // If we still don't have a MercadoPago payment ID, we can't sync
      if (!pago.mercadopago_payment_id) {
        console.warn(`[PagoService] No MercadoPago payment ID found for payment ID: ${id}`);
        return pago;
      }

      // Get payment info from MercadoPago
      console.log(`[PagoService] Getting payment info from MercadoPago for payment ID: ${pago.mercadopago_payment_id}`);
      
      let paymentInfo;
      try {
        paymentInfo = await mercadoPagoService.getPayment(pago.mercadopago_payment_id);
        console.log(`[PagoService] MercadoPago payment info:`, {
          id: paymentInfo.id,
          status: paymentInfo.status,
          status_detail: paymentInfo.status_detail
        });
      } catch (mpError: any) {
        console.error(`[PagoService] Error getting payment from MercadoPago:`, mpError);
        throw new Error(`Error getting payment from MercadoPago: ${mpError.message}`);
      }

      // Update payment record with latest status
      const updateData: ActualizarPago = {
        estado: paymentInfo.status,
        metodo_pago: paymentInfo.payment_method_id,
        monto: paymentInfo.transaction_amount,
        moneda: paymentInfo.currency_id,
        fecha_aprobacion: paymentInfo.date_approved,
        detalles: {
          ...((pago.detalles as any) || {}),
          payment_info: paymentInfo,
          last_sync: new Date().toISOString(),
        },
      };

      const updatedPago = await this.updatePago(id, updateData);
      console.log(`[PagoService] Payment updated in database with new status: ${paymentInfo.status}`);

      // If payment is approved and pedido status is not already "PAGO", update it
      if (paymentInfo.status === "approved" && pago.pedido_id) {
        try {
          await pedidoService.updatePedido(pago.pedido_id, {
            estado: "PAGO",
          });
          console.log(`[PagoService] Pedido ${pago.pedido_id} status updated to PAGO`);
        } catch (error) {
          console.error("[PagoService] Error updating pedido status:", error);
          // Don't throw here, the payment sync was successful even if pedido update failed
        }
      }

      console.log(`[PagoService] Payment ${id} synced successfully. New status: ${paymentInfo.status}`);
      return updatedPago;
    } catch (error: any) {
      console.error("[PagoService] Error syncing payment status:", error);
      throw error; // Re-throw to let controller handle it
    }
  }

  /**
   * Get payment statistics
   * @returns Payment statistics
   */
  async getPagoStats(): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    total_amount: number;
    approved_amount: number;
  }> {
    try {
      const { data, error } = await supabase.from(this.tableName).select("*");

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        approved: data.filter((p: any) => p.estado === "approved").length,
        pending: data.filter((p: any) => p.estado === "pending").length,
        rejected: data.filter((p: any) => p.estado === "rejected").length,
        total_amount: data.reduce(
          (sum: number, p: any) => sum + (p.monto || 0),
          0,
        ),
        approved_amount: data
          .filter((p: any) => p.estado === "approved")
          .reduce((sum: number, p: any) => sum + (p.monto || 0), 0),
      };

      return stats;
    } catch (error: any) {
      console.error("Error getting pago stats:", error);
      throw new Error(`Failed to get payment statistics: ${error.message}`);
    }
  }
}

export default new PagoService();
