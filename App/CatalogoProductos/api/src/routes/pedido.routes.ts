import { Router } from "express";
import pedidoController from "../controllers/pedido.controller";

const router = Router();

/**
 * @route   GET /api/pedidos
 * @desc    Get all pedidos with optional filters and pagination
 * @query   nombre_comercio, email, localidad, fechaInicio, fechaFin, orderBy, orderDirection, page, limit
 * @access  Public
 */
router.get("/", (req, res) => pedidoController.getPedidos(req, res));

/**
 * @route   GET /api/pedidos/latest/:limit?
 * @desc    Get latest pedidos
 * @param   limit - Number of pedidos to return (default: 10)
 * @access  Public
 */
router.get("/latest/:limit?", (req, res) =>
  pedidoController.getLatest(req, res),
);

/**
 * @route   GET /api/pedidos/date-range
 * @desc    Get pedidos by date range
 * @query   fechaInicio, fechaFin
 * @access  Public
 */
router.get("/date-range", (req, res) =>
  pedidoController.getByDateRange(req, res),
);

/**
 * @route   GET /api/pedidos/producto/:productoId
 * @desc    Get pedidos that contain a specific product
 * @param   productoId - Product ID
 * @access  Public
 */
router.get("/producto/:productoId", (req, res) =>
  pedidoController.getByProducto(req, res),
);

/**
 * @route   GET /api/pedidos/search/comercio/:nombre
 * @desc    Search pedidos by nombre_comercio
 * @param   nombre - Search term
 * @access  Public
 */
router.get("/search/comercio/:nombre", (req, res) =>
  pedidoController.searchByComercio(req, res),
);

/**
 * @route   GET /api/pedidos/search/email/:email
 * @desc    Search pedidos by email
 * @param   email - Email to search
 * @access  Public
 */
router.get("/search/email/:email", (req, res) =>
  pedidoController.searchByEmail(req, res),
);

/**
 * @route   GET /api/pedidos/search/localidad/:localidad
 * @desc    Search pedidos by localidad
 * @param   localidad - Localidad to search
 * @access  Public
 */
router.get("/search/localidad/:localidad", (req, res) =>
  pedidoController.searchByLocalidad(req, res),
);

/**
 * @route   GET /api/pedidos/:id
 * @desc    Get a single pedido by ID
 * @param   id - Pedido ID
 * @access  Public
 */
router.get("/:id", (req, res) => pedidoController.getPedidoById(req, res));

/**
 * @route   POST /api/pedidos
 * @desc    Create a new pedido
 * @body    { nombre_comercio, telefóno, email?, localidad, productos: [] }
 * @access  Public
 */
router.post("/", (req, res) => pedidoController.createPedido(req, res));

/**
 * @route   PATCH /api/pedidos/:id/estado
 * @desc    Update the estado of a pedido
 * @param   id - Pedido ID
 * @body    { estado: "Pendiente" | "Aprobado" | "En curso" | "Finalizado" }
 * @access  Public (should be protected in production)
 */
router.patch("/:id/estado", (req, res) =>
  pedidoController.updateEstado(req, res),
);

/**
 * @route   PUT /api/pedidos/:id
 * @desc    Update an existing pedido
 * @param   id - Pedido ID
 * @body    { nombre_comercio?, telefóno?, email?, localidad?, productos?, estado? }
 * @access  Public (should be protected in production)
 */
router.put("/:id", (req, res) => pedidoController.updatePedido(req, res));

/**
 * @route   DELETE /api/pedidos/:id
 * @desc    Delete a pedido
 * @param   id - Pedido ID
 * @access  Public (should be protected in production)
 */
router.delete("/:id", (req, res) => pedidoController.deletePedido(req, res));

export default router;
