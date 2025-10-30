import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";

/**
 * Authentication middleware
 * Verifies the user's authentication token and attaches the user to the request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies["sb-access-token"] ||
      (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : null);

    // If no token, the request is not authenticated
    if (!token) {
      res.status(401).json({
        success: false,
        error: "Autenticación requerida",
      });
      return;
    }

    // Get user from token
    const user = await authService.getUserByToken(token);

    // If no user found with this token, it's invalid
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Token inválido o expirado",
      });
      return;
    }

    // Attach user to request object for use in route handlers
    (req as any).user = user;

    // Continue to the route handler
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Error en la autenticación",
    });
    return;
  }
};

/**
 * Role-based authorization middleware factory
 * Creates middleware that checks if the user has one of the allowed roles
 * @param allowedRoles Array of roles that are allowed to access the endpoint
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get user from request object (should be attached by authMiddleware)
    const user = (req as any).user;

    // If no user, authentication failed
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Autenticación requerida",
      });
      return;
    }

    // Check if user's role is in the allowed roles
    if (!user.rol || !allowedRoles.includes(user.rol)) {
      res.status(403).json({
        success: false,
        error: "No tiene permisos para acceder a este recurso",
      });
      return;
    }

    // User has permission, continue
    next();
  };
};

export default {
  authMiddleware,
  roleMiddleware,
};
