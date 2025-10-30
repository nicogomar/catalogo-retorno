import createApp from "./app";
import { testConnection } from "./config/database";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Start the Express server
 */
const startServer = async () => {
  try {
    console.log("🚀 Starting Catalogo KDN API...");
    console.log(`📦 Environment: ${NODE_ENV}`);

    // Test database connection
    console.log("🔌 Testing database connection...");
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error("❌ Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log("\n🎯 Available endpoints:");
      console.log(`   - GET    /api/productos`);
      console.log(`   - POST   /api/productos`);
      console.log(`   - GET    /api/productos/:id`);
      console.log(`   - PUT    /api/productos/:id`);
      console.log(`   - DELETE /api/productos/:id`);
      console.log(`   - GET    /api/pedidos`);
      console.log(`   - POST   /api/pedidos`);
      console.log(`   - GET    /api/pedidos/:id`);
      console.log(`   - PUT    /api/pedidos/:id`);
      console.log(`   - DELETE /api/pedidos/:id`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - POST   /api/auth/register`);
      console.log(`   - POST   /api/auth/logout`);
      console.log(`   - GET    /api/auth/me`);
      console.log(`   - POST   /api/auth/reset-password`);
      console.log(`   - POST   /api/auth/update-password`);
      console.log(`   - GET    /api/usuarios`);
      console.log(`   - POST   /api/usuarios`);
      console.log(`   - GET    /api/usuarios/:id`);
      console.log(`   - PUT    /api/usuarios/:id`);
      console.log(`   - DELETE /api/usuarios/:id`);
      console.log("\n✨ Ready to accept requests!\n");
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log(
        "\n🛑 Received shutdown signal. Closing server gracefully...",
      );
      server.close(() => {
        console.log("✅ Server closed successfully");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("⚠️  Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
