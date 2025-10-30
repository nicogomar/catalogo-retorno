import { CorsOptions } from "cors";

/**
 * CORS Configuration Utility
 * Provides flexible CORS configuration for the API
 *
 * Features:
 * - Support for static allowed origins
 * - Dynamic pattern matching for Vercel preview URLs
 * - Environment variable configuration
 * - Detailed logging for debugging
 */

// Define known allowed origins
export const staticAllowedOrigins = [
  "http://localhost:4200",
  "http://localhost:3000",
  "https://productosdonjoaquin.vercel.app",
];

// Dynamic pattern matching for Vercel preview URLs
const vercelPatterns = [
  // Match all catalogo-productos-{hash}.vercel.app URLs
  /^https:\/\/catalogo-productos-[a-z0-9]+\.vercel\.app$/,
  // Match any subdomain of vercel.app with catalogo-productos in the path
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
];

/**
 * Get all allowed origins from environment variables or defaults
 * @returns Array of allowed origins
 */
export function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  // Combine environment origins with static origins, removing duplicates
  return [...new Set([...staticAllowedOrigins, ...envOrigins])];
}

/**
 * Check if origin is allowed by pattern matching
 * @param origin Origin URL to check
 * @returns boolean indicating if the origin is allowed
 */
export function isOriginAllowedByPattern(origin: string): boolean {
  if (!origin) return false;

  // Check against each pattern
  return vercelPatterns.some((pattern) => pattern.test(origin));
}

/**
 * Create CORS options object
 * @returns CORS options for Express
 */
export function createCorsOptions(): CorsOptions {
  const allowedOrigins = getAllowedOrigins();

  // If we're in development mode, be more permissive
  if (process.env.NODE_ENV === "development") {
    console.log("Using development CORS settings - allowing all origins");
    return {
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Log CORS request for debugging
      console.log(`CORS request from origin: ${origin}`);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log(`Origin ${origin} is allowed by CORS (exact match)`);
        return callback(null, true);
      }

      // Check if origin matches any of our patterns
      if (isOriginAllowedByPattern(origin)) {
        console.log(`Origin ${origin} is allowed by CORS (pattern match)`);
        return callback(null, true);
      }

      // Special case for Vercel deployment URLs that might not match our pattern
      if (
        origin &&
        (origin.includes("vercel.app") || origin.includes("netlify.app"))
      ) {
        console.log(
          `Origin ${origin} is allowed by CORS (deployment platform)`,
        );
        return callback(null, true);
      }

      // Otherwise, reject with CORS error
      console.log(`Origin ${origin} is NOT allowed by CORS`);
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
