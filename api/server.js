const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:4200",
      "http://localhost:3000",
      "https://productosdonjoaquin.vercel.app",
      "https://catalogo-EJEMPLO-frontend.vercel.app",
    ];
    
    if (allowedOrigins.includes(origin) || origin.includes("vercel.app")) {
      return callback(null, true);
    }
    
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: "Catalogo KDN API",
    version: "1.0.0",
    endpoints: {
      productos: "/api/productos",
      health: "/api/health",
    },
  });
});

// Test endpoint for productos
app.get('/api/productos/ordered-by-categoria-nombre', (req, res) => {
  res.json({
    success: true,
    message: "Endpoint working - database connection needed",
    data: [],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
