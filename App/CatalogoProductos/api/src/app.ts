import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import routes from "./routes";
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

  // Root endpoint
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Welcome to Catalogo KDN API",
      version: "1.0.0",
      documentation: "/api",
    });
  });

  // API routes
  app.use("/api", routes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: "Endpoint not found",
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

  return app;
};

export default createApp;
