import { Router } from "express";
import pagoController from "../controllers/pago.controller";

const router = Router();

/**
 * @route   GET /api/pagos/check-config
 * @desc    Check if MercadoPago is properly configured
 * @access  Public
 */
router.get("/check-config", (req, res) =>
  pagoController.checkConfig(req, res),
);

/**
 * @route   GET /api/pagos/stats
 * @desc    Get payment statistics
 * @access  Public (should be protected in production)
 */
router.get("/stats", (req, res) => pagoController.getPagoStats(req, res));

/**
 * @route   POST /api/pagos/webhook
 * @desc    Handle MercadoPago webhook notifications
 * @access  Public (MercadoPago service)
 */
router.post("/webhook", (req, res) => pagoController.handleWebhook(req, res));

/**
 * @route   GET /api/pagos
 * @desc    Get all payments with optional filters
 * @query   estado, pedido_id, fecha_inicio, fecha_fin
 * @access  Public (should be protected in production)
 */
router.get("/", (req, res) => pagoController.getPagos(req, res));

/**
 * @route   POST /api/pagos
 * @desc    Create a new payment and MercadoPago preference
 * @body    { pedido_id, items: [], payer?: {}, external_reference?: string }
 * @access  Public
 */
router.post("/", (req, res) => pagoController.createPago(req, res));

/**
 * @route   GET /api/pagos/pedido/:pedidoId
 * @desc    Get all payments for a specific pedido
 * @param   pedidoId - Pedido ID
 * @access  Public
 */
router.get("/pedido/:pedidoId", (req, res) =>
  pagoController.getPagosByPedidoId(req, res),
);

/**
 * @route   GET /api/pagos/external-reference/:reference
 * @desc    Get payment by external reference
 * @param   reference - External reference
 * @access  Public
 */
router.get("/external-reference/:reference", (req, res) =>
  pagoController.getPagoByExternalReference(req, res),
);

/**
 * @route   GET /api/pagos/mercadopago/:paymentId
 * @desc    Get payment information from MercadoPago
 * @param   paymentId - MercadoPago payment ID
 * @access  Public
 */
router.get("/mercadopago/:paymentId", (req, res) =>
  pagoController.getMercadoPagoPaymentInfo(req, res),
);

/**
 * @route   GET /api/pagos/:id
 * @desc    Get a single payment by ID
 * @param   id - Payment ID
 * @access  Public
 */
router.get("/:id", (req, res) => pagoController.getPagoById(req, res));

/**
 * @route   PUT /api/pagos/:id
 * @desc    Update a payment
 * @param   id - Payment ID
 * @body    { estado?, metodo_pago?, monto?, moneda?, detalles? }
 * @access  Public (should be protected in production)
 */
router.put("/:id", (req, res) => pagoController.updatePago(req, res));

/**
 * @route   PATCH /api/pagos/:id/estado
 * @desc    Update payment status
 * @param   id - Payment ID
 * @body    { estado: "pending" | "approved" | "rejected" | ... }
 * @access  Public (should be protected in production)
 */
router.patch("/:id/estado", (req, res) =>
  pagoController.updateEstado(req, res),
);

/**
 * @route   POST /api/pagos/:id/refund
 * @desc    Refund a payment (full or partial)
 * @param   id - Payment ID
 * @body    { amount?: number }
 * @access  Public (should be protected in production)
 */
router.post("/:id/refund", (req, res) => pagoController.refundPago(req, res));

/**
 * @route   DELETE /api/pagos/:id
 * @desc    Delete a payment
 * @param   id - Payment ID
 * @access  Public (should be protected in production)
 */
router.delete("/:id", (req, res) => pagoController.deletePago(req, res));

export default router;
