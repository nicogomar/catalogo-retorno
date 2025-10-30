import { Request, Response } from "express";
import authService from "../services/auth.service";

/**
 * Controller for handling authentication HTTP requests
 */
export class AuthController {
  /**
   * POST /api/auth/login
   * Authenticate a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email y contraseña son requeridos",
        });
        return;
      }
      const result = await authService.login(email, password);
      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      // Validate response data structure
      if (!result.data) {
        res.status(500).json({
          success: false,
          error: "Error interno: Autenticación incompleta",
        });
        return;
      }

      if (!result.data.user) {
        res.status(500).json({
          success: false,
          error: "Error interno: Datos de usuario incompletos",
        });
        return;
      }

      if (!result.data.session) {
        res.status(500).json({
          success: false,
          error: "Error interno: Sesión inválida",
        });
        return;
      }

      if (!result.data.session.access_token) {
        res.status(500).json({
          success: false,
          error: "Error interno: Token de acceso inválido",
        });
        return;
      }

      // Set auth cookies if needed

      res.cookie("sb-access-token", result.data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
        path: "/",
      });

      if (result.data.session.refresh_token) {
        res.cookie("sb-refresh-token", result.data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
          path: "/",
        });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Error procesando la solicitud de inicio de sesión",
      });
    }
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email y contraseña son requeridos",
        });
        return;
      }

      const result = await authService.register(
        email,
        password,
        role || "user",
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error in register controller:", error);
      res.status(500).json({
        success: false,
        error: "Error procesando la solicitud de registro",
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Logout a user
   */
  async logout(_req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.logout();

      // Clear auth cookies
      res.clearCookie("sb-access-token", { path: "/" });
      res.clearCookie("sb-refresh-token", { path: "/" });

      res.json(result);
    } catch (error: any) {
      console.error("Error in logout controller:", error);
      res.status(500).json({
        success: false,
        error: "Error procesando la solicitud de cierre de sesión",
      });
    }
  }

  /**
   * GET /api/auth/me
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Get token from cookie or Authorization header
      const token =
        req.cookies["sb-access-token"] ||
        (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
          ? req.headers.authorization.substring(7)
          : null);

      if (!token) {
        res.status(401).json({
          success: false,
          error: "No hay sesión activa",
        });
        return;
      }

      const user = await authService.getUserByToken(token);

      if (!user) {
        res.status(401).json({
          success: false,
          error: "Sesión inválida o expirada",
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      console.error("Error in getCurrentUser controller:", error);
      res.status(500).json({
        success: false,
        error: "Error procesando la solicitud de información de usuario",
      });
    }
  }

  /**
   * GET /api/auth/session
   * Get current session with user and token info
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      // Get token from cookie or Authorization header
      const token =
        req.cookies["sb-access-token"] ||
        (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
          ? req.headers.authorization.substring(7)
          : null);

      if (!token) {
        res.status(401).json({
          success: false,
          error: "No hay sesión activa",
        });
        return;
      }

      const result = await authService.getSessionByToken(token);

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.json(result);
    } catch (error: any) {
      console.error("Error in getSession controller:", error);
      res.status(500).json({
        success: false,
        error: "Error procesando la solicitud de sesión",
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email es requerido",
        });
        return;
      }

      await authService.resetPassword(email);

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: "Si el correo existe, se ha enviado un enlace de recuperación",
      });
    } catch (error: any) {
      console.error("Error in requestPasswordReset controller:", error);
      res.status(500).json({
        success: false,
        error: "Error procesando la solicitud de recuperación de contraseña",
      });
    }
  }

  /**
   * POST /api/auth/update-password
   * Update password with token
   */
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({
          success: false,
          error: "Token y nueva contraseña son requeridos",
        });
        return;
      }

      const result = await authService.updatePassword(token, password);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error: any) {
      console.error("Error in updatePassword controller:", error);
      res.status(500).json({
        success: false,
        error: "Error procesando la solicitud de actualización de contraseña",
      });
    }
  }
}

export default new AuthController();
