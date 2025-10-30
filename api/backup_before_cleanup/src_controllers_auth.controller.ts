import { Request, Response } from "express";
import { authService } from "../services/auth.service";

/**
 * Authentication controller
 * Handles all authentication-related requests
 */
export class AuthController {
  /**
   * Login endpoint handler
   * @param req Express request object
   * @param res Express response object
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email y contraseña son requeridos",
        });
      }

      // Authenticate user with Supabase
      const data = await authService.signIn(email, password);

      if (!data || !data.user || !data.session) {
        return res.status(401).json({
          success: false,
          error: "No se pudo establecer la sesión",
        });
      }

      // Format response to match what the frontend expects
      return res.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role || "user",
          nombre: data.user.user_metadata?.nombre || null,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: Date.now() + data.session.expires_in * 1000,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different error cases
      if (error.message?.includes("Invalid login credentials")) {
        return res.status(401).json({
          success: false,
          error: "Credenciales incorrectas. Intente de nuevo.",
        });
      }

      if (
        error.message?.includes("No se pudo establecer la sesión") ||
        error.message?.includes("Error al validar la sesión")
      ) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Error durante el inicio de sesión. Contacte al administrador.",
      });
    }
  }

  /**
   * Logout endpoint handler
   * @param req Express request object
   * @param res Express response object
   */
  async logout(_req: Request, res: Response) {
    try {
      await authService.signOut();

      // Clear auth cookies if they exist
      if (req.cookies["sb-access-token"]) {
        res.clearCookie("sb-access-token", { path: "/" });
      }

      if (req.cookies["sb-refresh-token"]) {
        res.clearCookie("sb-refresh-token", { path: "/" });
      }

      return res.json({
        success: true,
        message: "Sesión cerrada correctamente",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error durante el cierre de sesión",
      });
    }
  }

  /**
   * Get current user session
   * @param req Express request object
   * @param res Express response object
   */
  async getSession(req: Request, res: Response) {
    try {
      const data = await authService.getSession();

      if (!data.session) {
        return res.status(401).json({
          success: false,
          error: "No hay una sesión activa",
        });
      }

      // Get user details to confirm authentication
      const { data: userData, error: userError } = await authService.getUser();

      if (userError || !userData.user) {
        return res.status(401).json({
          success: false,
          error: "Sesión inválida o expirada",
        });
      }

      return res.json({
        success: true,
        user: {
          id: data.session.user.id,
          email: data.session.user.email,
          role: data.session.user.user_metadata?.role || "user",
          nombre: data.session.user.user_metadata?.nombre || null,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at:
            Date.now() +
            ((data.session.expires_at || Math.floor(Date.now() / 1000) + 3600) - Math.floor(Date.now() / 1000)) * 1000,
        },
      });
    } catch (error: any) {
      console.error("Get session error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error al obtener la sesión",
      });
    }
  }
}

// Create singleton instance
export const authController = new AuthController();
