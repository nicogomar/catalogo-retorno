import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import routes from "./routes";
import emailService from "./services/email.service";
// Load environment variables
dotenv.config();

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app: Application = express();

  // Security middleware
  app.use(helmet());

  // Apply CORS configuration using the utility
  app.use(
    cors({
      origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como curl o apps móviles)
        if (!origin) return callback(null, true);

        console.log(`CORS request from origin: ${origin}`);

        // Permitir dominios conocidos explícitamente
        const allowedOrigins = [
          "http://localhost:4200",
          "http://localhost:3000",
          "https://productosdonjoaquin.vercel.app",
          "https://catalogo-retorno-frontend.vercel.app",
        ];

        // Verificar si el dominio está en la lista de permitidos
        if (allowedOrigins.includes(origin)) {
          console.log(`Origin ${origin} is allowed by CORS (exact match)`);
          return callback(null, true);
        }

        // Permitir automáticamente todos los dominios de Vercel
        if (origin.includes("vercel.app")) {
          console.log(`Origin ${origin} is allowed by CORS (Vercel domain)`);
          return callback(null, true);
        }

        // Permitir también dominios con patrones específicos que pueden ser preview deployments
        if (
          origin.includes("catalogo-retorno-frontend") ||
          origin.includes("catalogo-retorno-backend")
        ) {
          console.log(
            `Origin ${origin} is allowed by CORS (catalogo-retorno domain)`,
          );
          return callback(null, true);
        }

        // Permitir dominios de redes móviles conocidos
        const mobileProviders = [
          "movistar",
          "claro",
          "entel",
          "wom",
          "tigo",
          "vtr",
          "tmobile",
          "att",
          "verizon",
          "orange",
          "vodafone",
          "telcel",
        ];

        // Verificar si el origen pertenece a un proveedor móvil conocido
        if (
          origin &&
          mobileProviders.some((provider) =>
            origin.toLowerCase().includes(provider),
          )
        ) {
          console.log(`Origin ${origin} is allowed by CORS (mobile provider)`);
          return callback(null, true);
        }

        // En producción, ser más permisivo con las conexiones móviles
        if (process.env.NODE_ENV === "production") {
          console.log(`Origin ${origin} is allowed in production mode`);
          return callback(null, true);
        }

        // Rechazar otros orígenes
        console.log(`Origin ${origin} is NOT allowed by CORS`);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  // Logging middleware
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // Root endpoint - redirect to frontend in production
  app.get("/", (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      // In production, serve the frontend
      const angularPath = path.join(__dirname, "../../public");
      res.sendFile(path.join(angularPath, "index.html"));
    } else {
      // In development, show API info
      res.json({
        success: true,
        message: "Welcome to Catalogo KDN API",
        version: "1.0.0",
        documentation: "/api",
      });
    }
  });

  // API routes
  app.use("/api", routes);

  // Serve static files from Angular app in production
  if (process.env.NODE_ENV === "production") {
    const angularPath = path.join(__dirname, "../../public");
    app.use(express.static(angularPath));
    
    // For Angular routing - always return index.html for non-API routes
    app.get("*", (req: Request, res: Response) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(angularPath, "index.html"));
      }
    });
  }

  // 404 handler for API routes only
  app.use("/api/*", (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: "API endpoint not found",
      path: req.path,
    });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err);

    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  // Initialize email service
  emailService.verifyConnection().then((isConnected) => {
    if (isConnected) {
      console.log("Email service initialized successfully");
    } else {
      console.warn(
        "Email service could not be initialized, notifications will not be sent",
      );
    }
  });

  return app;
};

export default createApp;
