import axios, { AxiosInstance } from "axios";
import {
  MercadoPagoPreference,
  MercadoPagoPreferenceResponse,
  MercadoPagoPaymentInfo,
  EstadoPago,
} from "../types";

/**
 * Service for handling MercadoPago integration using REST API
 *
 * This service provides methods to:
 * - Create payment preferences
 * - Process payments
 * - Handle webhooks
 * - Query payment status
 */
class MercadoPagoService {
  private client: AxiosInstance;
  private isConfigured: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: "https://api.mercadopago.com",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Initialize MercadoPago client with access token
   */
  private initialize(): void {
    if (this.isConfigured) return;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN is not configured in environment variables",
      );
    }

    this.client.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;

    this.isConfigured = true;
    console.log("MercadoPago client initialized successfully");
  }

  /**
   * Create a payment preference
   * @param preferenceData - Preference data
   * @returns Preference response with init_point URL
   */
  async createPreference(
    preferenceData: MercadoPagoPreference,
  ): Promise<MercadoPagoPreferenceResponse> {
    try {
      this.initialize();

      // Validate items
      if (!preferenceData.items || preferenceData.items.length === 0) {
        throw new Error("At least one item is required");
      }

      // Set default back_urls
      const defaultBackUrls = {
        success: `${process.env.FRONTEND_URL || "http://localhost:4200"}/payment/success`,
        failure: `${process.env.FRONTEND_URL || "http://localhost:4200"}/payment/failure`,
        pending: `${process.env.FRONTEND_URL || "http://localhost:4200"}/payment/pending`,
      };

      // Merge provided back_urls with defaults to ensure all URLs are present
      const backUrls = {
        ...defaultBackUrls,
        ...(preferenceData.back_urls || {}),
      };

      // Check if we're using HTTPS URLs (production) or HTTP (development)
      const isProduction = backUrls.success.startsWith("https://");

      // Set default values and prepare preference
      const preference: any = {
        items: preferenceData.items.map((item) => ({
          id: item.id || String(Math.random()),
          title: item.title,
          description: item.description || "",
          picture_url: item.picture_url || "",
          category_id: item.category_id || "others",
          quantity: item.quantity,
          currency_id: item.currency_id || "UYU",
          unit_price: item.unit_price,
        })),
        back_urls: backUrls,
        external_reference: preferenceData.external_reference || "",
        notification_url:
          preferenceData.notification_url ||
          `${process.env.API_URL || "http://localhost:3000"}/api/pagos/webhook`,
      };

      // Only set auto_return for production HTTPS URLs
      // MercadoPago may reject auto_return with localhost/HTTP URLs
      if (
        isProduction &&
        (preferenceData.auto_return || preferenceData.auto_return === undefined)
      ) {
        preference.auto_return = preferenceData.auto_return || "approved";
      }

      // Only add optional fields if they have values
      if (
        preferenceData.payer &&
        Object.keys(preferenceData.payer).length > 0
      ) {
        preference.payer = preferenceData.payer;
      }
      if (preferenceData.statement_descriptor) {
        preference.statement_descriptor = preferenceData.statement_descriptor;
      }
      if (
        preferenceData.payment_methods &&
        Object.keys(preferenceData.payment_methods).length > 0
      ) {
        preference.payment_methods = preferenceData.payment_methods;
      }
      if (preferenceData.expires) {
        preference.expires = preferenceData.expires;
        if (preferenceData.expiration_date_from) {
          preference.expiration_date_from = preferenceData.expiration_date_from;
        }
        if (preferenceData.expiration_date_to) {
          preference.expiration_date_to = preferenceData.expiration_date_to;
        }
      }

      console.log("Creating MercadoPago preference:", {
        items: preference.items.length,
        external_reference: preference.external_reference,
        back_urls: preference.back_urls,
        auto_return: preference.auto_return || "not set (using localhost)",
        is_production: isProduction,
      });

      console.log(
        "Full preference object:",
        JSON.stringify(preference, null, 2),
      );

      const response = await this.client.post(
        "/checkout/preferences",
        preference,
      );

      console.log("MercadoPago preference created successfully:", {
        id: response.data.id,
        init_point: response.data.init_point,
      });

      return {
        id: response.data.id,
        init_point: response.data.init_point,
        sandbox_init_point: response.data.sandbox_init_point,
        date_created: response.data.date_created,
        items: response.data.items,
        payer: response.data.payer,
        back_urls: response.data.back_urls,
        auto_return: response.data.auto_return,
        external_reference: response.data.external_reference,
      };
    } catch (error: any) {
      console.error(
        "Error creating MercadoPago preference:",
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to create payment preference: ${error.response?.data?.message || error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Get payment information by payment ID
   * @param paymentId - MercadoPago payment ID
   * @returns Payment information
   */
  async getPayment(paymentId: string): Promise<MercadoPagoPaymentInfo> {
    try {
      this.initialize();

      console.log("Getting payment info for ID:", paymentId);

      const response = await this.client.get(`/v1/payments/${paymentId}`);
      const payment = response.data;

      console.log("Payment info retrieved:", {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
      });

      return {
        id: payment.id,
        date_created: payment.date_created,
        date_approved: payment.date_approved || undefined,
        date_last_updated: payment.date_last_updated,
        money_release_date: payment.money_release_date || undefined,
        operation_type: payment.operation_type,
        issuer_id: payment.issuer_id?.toString() || undefined,
        payment_method_id: payment.payment_method_id,
        payment_type_id: payment.payment_type_id,
        status: payment.status as EstadoPago,
        status_detail: payment.status_detail,
        currency_id: payment.currency_id,
        description: payment.description || undefined,
        live_mode: payment.live_mode,
        transaction_amount: payment.transaction_amount,
        transaction_amount_refunded:
          payment.transaction_amount_refunded || undefined,
        coupon_amount: payment.coupon_amount || undefined,
        taxes_amount: payment.taxes_amount || undefined,
        shipping_amount: payment.shipping_amount || undefined,
        installments: payment.installments,
        external_reference: payment.external_reference || undefined,
        payer: payment.payer
          ? {
              id: payment.payer.id?.toString() || undefined,
              email: payment.payer.email || undefined,
              identification: payment.payer.identification,
              type: payment.payer.type || undefined,
            }
          : undefined,
        metadata: payment.metadata,
      };
    } catch (error: any) {
      console.error(
        "Error getting payment info:",
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to get payment information: ${error.response?.data?.message || error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Get preference information by preference ID
   * @param preferenceId - MercadoPago preference ID
   * @returns Preference information
   */
  async getPreference(
    preferenceId: string,
  ): Promise<MercadoPagoPreferenceResponse> {
    try {
      this.initialize();

      console.log("Getting preference info for ID:", preferenceId);

      const response = await this.client.get(
        `/checkout/preferences/${preferenceId}`,
      );
      const preference = response.data;

      console.log("Preference info retrieved:", {
        id: preference.id,
        external_reference: preference.external_reference,
      });

      return {
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        date_created: preference.date_created,
        items: preference.items,
        payer: preference.payer,
        back_urls: preference.back_urls,
        auto_return: preference.auto_return,
        external_reference: preference.external_reference,
      };
    } catch (error: any) {
      console.error(
        "Error getting preference info:",
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to get preference information: ${error.response?.data?.message || error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Search payments by external reference
   * @param externalReference - External reference to search
   * @returns Array of payment information
   */
  async searchPaymentsByExternalReference(
    externalReference: string,
  ): Promise<MercadoPagoPaymentInfo[]> {
    try {
      this.initialize();

      console.log(
        "Searching payments by external reference:",
        externalReference,
      );

      const response = await this.client.get("/v1/payments/search", {
        params: {
          external_reference: externalReference,
        },
      });

      const payments = response.data.results || [];

      console.log(
        `Found ${payments.length} payments for external reference:`,
        externalReference,
      );

      return payments.map((payment: any) => ({
        id: payment.id,
        date_created: payment.date_created,
        date_approved: payment.date_approved || undefined,
        date_last_updated: payment.date_last_updated,
        money_release_date: payment.money_release_date || undefined,
        operation_type: payment.operation_type,
        issuer_id: payment.issuer_id?.toString() || undefined,
        payment_method_id: payment.payment_method_id,
        payment_type_id: payment.payment_type_id,
        status: payment.status as EstadoPago,
        status_detail: payment.status_detail,
        currency_id: payment.currency_id,
        description: payment.description || undefined,
        live_mode: payment.live_mode,
        transaction_amount: payment.transaction_amount,
        transaction_amount_refunded:
          payment.transaction_amount_refunded || undefined,
        coupon_amount: payment.coupon_amount || undefined,
        taxes_amount: payment.taxes_amount || undefined,
        shipping_amount: payment.shipping_amount || undefined,
        installments: payment.installments,
        external_reference: payment.external_reference || undefined,
        payer: payment.payer
          ? {
              id: payment.payer.id?.toString() || undefined,
              email: payment.payer.email || undefined,
              identification: payment.payer.identification,
              type: payment.payer.type || undefined,
            }
          : undefined,
        metadata: payment.metadata,
      }));
    } catch (error: any) {
      console.error(
        "Error searching payments by external reference:",
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to search payments: ${error.response?.data?.message || error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Refund a payment (full or partial)
   * @param paymentId - MercadoPago payment ID
   * @param amount - Amount to refund (optional, defaults to full refund)
   * @returns Refund information
   */
  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      this.initialize();

      console.log("Refunding payment:", {
        paymentId,
        amount: amount || "full refund",
      });

      const refundData: any = {};
      if (amount) {
        refundData.amount = amount;
      }

      const response = await this.client.post(
        `/v1/payments/${paymentId}/refunds`,
        refundData,
      );

      console.log("Refund created successfully:", response.data.id);

      return response.data;
    } catch (error: any) {
      console.error(
        "Error refunding payment:",
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to refund payment: ${error.response?.data?.message || error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Validate webhook signature (for security)
   * @param requestBody - The webhook request body
   * @param signature - The x-signature header
   * @param requestId - The x-request-id header
   * @returns Boolean indicating if signature is valid
   */
  validateWebhookSignature(
    requestBody: any,
    signature: string,
    requestId: string,
  ): boolean {
    // TODO: Implement proper signature validation
    // For now, we'll just log and return true
    // In production, you should implement proper signature validation
    // using the secret key provided by MercadoPago
    console.log("Webhook validation:", {
      signature,
      requestId,
      body: requestBody,
    });
    return true;
  }

  /**
   * Map MercadoPago status to our internal status
   * @param mpStatus - MercadoPago payment status
   * @returns Internal payment status
   */
  mapPaymentStatus(mpStatus: string): EstadoPago {
    const statusMap: { [key: string]: EstadoPago } = {
      pending: "pending",
      approved: "approved",
      authorized: "authorized",
      in_process: "in_process",
      in_mediation: "in_mediation",
      rejected: "rejected",
      cancelled: "cancelled",
      refunded: "refunded",
      charged_back: "charged_back",
    };

    return statusMap[mpStatus] || "pending";
  }

  /**
   * Check if MercadoPago is properly configured
   * @returns Boolean indicating if service is configured
   */
  isReady(): boolean {
    return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
  }
}

export default new MercadoPagoService();
