import { Router } from "express";
import usuarioController from "../controllers/usuario.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @route   GET /api/usuarios
 * @desc    Get all usuarios with optional filters and pagination
 * @query   correo_electronico, rol, orderBy, orderDirection, page, limit
 * @access  Protected - Requires admin role
 */
router.get("/", authMiddleware, roleMiddleware(["admin"]), (req, res) =>
  usuarioController.getUsuarios(req, res),
);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Get a single usuario by ID
 * @param   id - Usuario ID
 * @access  Protected - Requires admin role or own user
 */
router.get("/:id", authMiddleware, (req, res) =>
  usuarioController.getUsuarioById(req, res),
);

/**
 * @route   POST /api/usuarios
 * @desc    Create a new usuario
 * @body    { correo_electronico, contraseña, rol? }
 * @access  Protected - Requires admin role
 */
router.post("/", authMiddleware, roleMiddleware(["admin"]), (req, res) =>
  usuarioController.createUsuario(req, res),
);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Update an existing usuario
 * @param   id - Usuario ID
 * @body    { correo_electronico?, contraseña?, rol? }
 * @access  Protected - Requires admin role or own user
 */
router.put("/:id", authMiddleware, (req, res) =>
  usuarioController.updateUsuario(req, res),
);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Delete a usuario
 * @param   id - Usuario ID
 * @access  Protected - Requires admin role
 */
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) =>
  usuarioController.deleteUsuario(req, res),
);

export default router;
