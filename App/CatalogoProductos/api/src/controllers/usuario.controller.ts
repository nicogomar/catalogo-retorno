import { Request, Response } from "express";
import usuarioService from "../services/usuario.service";
import { NuevoUsuario, ActualizarUsuario, UsuarioFilters } from "../types";

/**
 * Controller for handling Usuario HTTP requests
 */
export class UsuarioController {
  /**
   * GET /api/usuarios
   * Get all usuarios with optional filters and pagination
   */
  async getUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const { correo_electronico, rol, orderBy, orderDirection, page, limit } =
        req.query;

      const filters: UsuarioFilters = {
        correo_electronico: correo_electronico as string,
        rol: rol as string,
        orderBy: orderBy as any,
        orderDirection: orderDirection as any,
      };

      const pagination = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const usuarios = await usuarioService.getUsuarios(filters, pagination);

      // If pagination is requested, also get total count
      if (pagination.page && pagination.limit) {
        const total = await usuarioService.getUsuariosCount(filters);
        const totalPages = Math.ceil(total / pagination.limit);

        res.json({
          success: true,
          data: usuarios,
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
          data: usuarios,
        });
      }
    } catch (error: any) {
      console.error("Error in getUsuarios:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching usuarios",
      });
    }
  }

  /**
   * GET /api/usuarios/:id
   * Get a single usuario by ID
   */
  async getUsuarioById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid usuario ID",
        });
        return;
      }

      const usuario = await usuarioService.getUsuarioById(id);

      if (!usuario) {
        res.status(404).json({
          success: false,
          error: "Usuario not found",
        });
        return;
      }

      // Check permissions: Only allow if user is accessing their own data or is an admin
      const currentUser = req.user;
      if (currentUser?.id !== id && currentUser?.rol !== "admin") {
        res.status(403).json({
          success: false,
          error: "No tiene permisos para acceder a estos datos",
        });
        return;
      }

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error: any) {
      console.error("Error in getUsuarioById:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching usuario",
      });
    }
  }

  /**
   * POST /api/usuarios
   * Create a new usuario
   */
  async createUsuario(req: Request, res: Response): Promise<void> {
    try {
      const usuarioData: NuevoUsuario = req.body;

      // Validate required fields
      if (!usuarioData.correo_electronico || !usuarioData.contraseña) {
        res.status(400).json({
          success: false,
          error:
            "Missing required fields: correo electrónico and contraseña are required",
        });
        return;
      }

      // Check if email already exists
      const existingUser = await usuarioService.getUsuarioByEmail(
        usuarioData.correo_electronico,
      );
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: "Email already exists",
        });
        return;
      }

      const newUsuario = await usuarioService.createUsuario(usuarioData);

      res.status(201).json({
        success: true,
        data: newUsuario,
        message: "Usuario created successfully",
      });
    } catch (error: any) {
      console.error("Error in createUsuario:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error creating usuario",
      });
    }
  }

  /**
   * PUT /api/usuarios/:id
   * Update an existing usuario
   */
  async updateUsuario(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid usuario ID",
        });
        return;
      }

      // Check permissions: Only allow if user is updating their own data or is an admin
      const currentUser = req.user;
      if (currentUser?.id !== id && currentUser?.rol !== "admin") {
        res.status(403).json({
          success: false,
          error: "No tiene permisos para modificar estos datos",
        });
        return;
      }

      const usuarioData: ActualizarUsuario = req.body;

      // Regular users can't change their own role
      if (
        currentUser?.id === id &&
        currentUser?.rol !== "admin" &&
        usuarioData.rol
      ) {
        res.status(403).json({
          success: false,
          error: "No tiene permisos para cambiar su rol",
        });
        return;
      }

      // Check if email is being changed and already exists
      if (usuarioData.correo_electronico) {
        const existingUser = await usuarioService.getUsuarioByEmail(
          usuarioData.correo_electronico,
        );
        if (existingUser && existingUser.id !== id) {
          res.status(400).json({
            success: false,
            error: "Email already exists",
          });
          return;
        }
      }

      const updatedUsuario = await usuarioService.updateUsuario(
        id,
        usuarioData,
      );

      if (!updatedUsuario) {
        res.status(404).json({
          success: false,
          error: "Usuario not found",
        });
        return;
      }

      res.json({
        success: true,
        data: updatedUsuario,
        message: "Usuario updated successfully",
      });
    } catch (error: any) {
      console.error("Error in updateUsuario:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error updating usuario",
      });
    }
  }

  /**
   * DELETE /api/usuarios/:id
   * Delete a usuario
   */
  async deleteUsuario(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid usuario ID",
        });
        return;
      }

      await usuarioService.deleteUsuario(id);

      res.json({
        success: true,
        message: "Usuario deleted successfully",
      });
    } catch (error: any) {
      console.error("Error in deleteUsuario:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error deleting usuario",
      });
    }
  }
}

export default new UsuarioController();
