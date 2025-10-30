import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @body    { email, password }
 * @access  Public
 */
router.post("/login", (req, res) => authController.login(req, res));

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @body    { email, password, role? }
 * @access  Public
 */
router.post("/register", (req, res) => authController.register(req, res));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout current user
 * @access  Public
 */
router.post("/logout", (req, res) => authController.logout(req, res));

/**
 * @route   GET /api/auth/session
 * @desc    Get current session with user and token info
 * @access  Public
 */
router.get("/session", (req, res) => authController.getSession(req, res));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 * @access  Protected - requires authentication
 */
router.get("/me", authMiddleware, (req, res) =>
  authController.getCurrentUser(req, res),
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Request password reset email
 * @body    { email }
 * @access  Public
 */
router.post("/reset-password", (req, res) =>
  authController.requestPasswordReset(req, res),
);

/**
 * @route   POST /api/auth/update-password
 * @desc    Update password with reset token
 * @body    { token, password }
 * @access  Public
 */
router.post("/update-password", (req, res) =>
  authController.updatePassword(req, res),
);

/**
 * @route   GET /api/auth/test-connection
 * @desc    Test Supabase auth connection
 * @access  Public - for diagnostic purposes
 */
router.get("/test-connection", async (_req, res) => {
  try {
    const { supabase } = require("../config/database");

    // Test auth service
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return res.status(500).json({
        success: false,
        error: "Error connecting to Supabase auth service",
        details: error,
      });
    }

    // Test database connection
    const { error: dbError } = await supabase
      .from("usuario")
      .select("count")
      .limit(1);

    if (dbError) {
      return res.status(500).json({
        success: false,
        error: "Error connecting to Supabase database",
        details: dbError,
      });
    }

    return res.json({
      success: true,
      message: "Supabase connection successful",
      auth_status: data ? "Connected" : "No session",
      db_status: "Connected",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      success: false,
      error: "Error testing Supabase connection",
      details: errorMessage,
    });
  }
});

/**
 * @route   GET /api/auth/test-auth
 * @desc    Full diagnostic test of auth flow
 * @access  Public - for diagnostic purposes
 */
router.get("/test-auth", async (_req, res) => {
  try {
    const { supabase, supabaseAdmin } = require("../config/database");
    const authService = require("../services/auth.service").default;
    const usuarioService = require("../services/usuario.service").default;

    // Test user credentials
    const testEmail = "nico@nico.com";
    const testPassword = "niconico";

    const diagnosticResults = {
      environment: {
        node_env: process.env.NODE_ENV || "not set",
        supabase_url: process.env.SUPABASE_URL ? "set" : "not set",
        supabase_key: process.env.SUPABASE_ANON_KEY
          ? `length: ${process.env.SUPABASE_ANON_KEY.length}`
          : "not set",
        supabase_service_key: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? "set"
          : "not set",
      },
      database: {
        status: "pending",
        usuario_table: {
          structure: "pending",
          test_user: "pending",
        },
      },
      auth: {
        status: "pending",
        test_user: "pending",
        login_test: "pending",
      },
      steps: [],
    };

    // STEP 1: Test basic database connection
    try {
      const { error } = await supabase.from("usuario").select("count").limit(1);
      if (error) throw error;
      diagnosticResults.database.status = "connected";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      diagnosticResults.database.status = "error: " + errorMessage;
    }

    // STEP 2: Check usuario table structure
    try {
      const { data, error } = await supabase
        .from("usuario")
        .select("*")
        .limit(1);
      if (error) throw error;

      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        diagnosticResults.database.usuario_table.structure = columns.join(", ");
      } else {
        diagnosticResults.database.usuario_table.structure = "no rows found";
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      diagnosticResults.database.usuario_table.structure =
        "error: " + errorMessage;
    }

    // STEP 3: Check for test user in DB
    try {
      const dbUser = await usuarioService.getUsuarioByEmail(testEmail);

      if (dbUser) {
        diagnosticResults.database.usuario_table.test_user =
          "found - ID: " + dbUser.id;
      } else {
        diagnosticResults.database.usuario_table.test_user = "not found";
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      diagnosticResults.database.usuario_table.test_user =
        "error: " + errorMessage;
    }

    // STEP 4: Test Supabase Auth
    try {
      let users: any[] = [];

      try {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        users = data?.users || [];
        diagnosticResults.auth.status = `connected - found ${users.length} users`;
      } catch (adminError) {
        const errorMessage =
          adminError instanceof Error ? adminError.message : String(adminError);
        diagnosticResults.auth.status = "admin API error: " + errorMessage;
      }

      // Find test user
      const authUser = users.find((u: any) => u.email === testEmail);
      if (authUser) {
        diagnosticResults.auth.test_user = "found - ID: " + authUser.id;
      } else {
        diagnosticResults.auth.test_user = "not found";
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      diagnosticResults.auth.status = "error: " + errorMessage;
    }

    // STEP 5: Test login flow
    try {
      const result = await authService.login(testEmail, testPassword);

      if (result.success) {
        const tokenInfo = result.data?.session?.access_token
          ? `token length: ${result.data.session.access_token.length} chars`
          : "no token";
        diagnosticResults.auth.login_test = `success (${tokenInfo})`;
      } else {
        diagnosticResults.auth.login_test = "failed: " + result.error;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      diagnosticResults.auth.login_test = "error: " + errorMessage;
    }

    return res.json({
      success: true,
      diagnostics: diagnosticResults,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return res.status(500).json({
      success: false,
      error: "Error running diagnostic tests",
      details: errorMessage,
      stack: errorStack,
    });
  }
});

export default router;
