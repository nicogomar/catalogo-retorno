import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

/**
 * Authentication routes
 * All routes are prefixed with /auth
 */

// Login route
router.post("/login", authController.login);

// Logout route
router.post("/logout", authController.logout);

// Session route - get current user session
router.get("/session", authController.getSession);

export default router;
