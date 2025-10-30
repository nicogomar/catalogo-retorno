import { Router } from "express";
import productoRoutes from "./producto.routes";
import pedidoRoutes from "./pedido.routes";
import authRoutes from "./auth.routes";

const router = Router();

/**
 * Main API Routes
 *
 * All routes are prefixed with /api
 */

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Catalogo KDN API",
    version: "1.0.0",
    endpoints: {
      productos: "/api/productos",
      pedidos: "/api/pedidos",
      auth: "/api/auth",
      health: "/api/health",
    },
  });
});

// Mount route modules
router.use("/productos", productoRoutes);
router.use("/pedidos", pedidoRoutes);
router.use("/auth", authRoutes);

export default router;
