/**
 * CORS-FIX.js - Solución inmediata para problemas CORS en API de Catálogo Productos
 *
 * Instrucciones de uso:
 * 1. Guarda este archivo como cors-fix.js en el directorio raíz de tu API
 * 2. Ejecuta: node cors-fix.js
 * 3. Sigue las instrucciones en pantalla
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Crear interfaz para leer entrada del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}==================================================${colors.reset}`);
console.log(`${colors.blue}         SOLUCIÓN RÁPIDA DE CORS                  ${colors.reset}`);
console.log(`${colors.blue}==================================================${colors.reset}`);
console.log('\n');

// Función principal
async function main() {
  try {
    // Encontrar el archivo app.ts
    const appPath = path.join(__dirname, 'src', 'app.ts');

    if (!fs.existsSync(appPath)) {
      console.log(`${colors.red}Error: No se encuentra el archivo app.ts en src/${colors.reset}`);
      console.log(`Ruta buscada: ${appPath}`);
      process.exit(1);
    }

    console.log(`${colors.green}✅ Archivo app.ts encontrado${colors.reset}`);

    // Leer el contenido actual
    let appContent = fs.readFileSync(appPath, 'utf8');

    // Preguntar si se desea aplicar el parche rápido
    const answer = await askQuestion(`${colors.yellow}¿Desea aplicar el parche rápido de CORS? (s/n): ${colors.reset}`);

    if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'si') {
      console.log(`${colors.yellow}Operación cancelada por el usuario.${colors.reset}`);
      rl.close();
      return;
    }

    // Crear directorio de respaldo si no existe
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Hacer una copia de respaldo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `app.ts.backup-${timestamp}`);
    fs.writeFileSync(backupPath, appContent);
    console.log(`${colors.green}✅ Respaldo creado en ${backupPath}${colors.reset}`);

    // Aplicar el parche de CORS
    appContent = applyCorsPatch(appContent);

    // Guardar los cambios
    fs.writeFileSync(appPath, appContent);
    console.log(`${colors.green}✅ Parche de CORS aplicado exitosamente${colors.reset}`);

    // Preguntar si se quiere crear el archivo de rutas auth
    const createAuthRoutes = await askQuestion(`${colors.yellow}¿Desea crear las rutas de autenticación? (s/n): ${colors.reset}`);

    if (createAuthRoutes.toLowerCase() === 's' || createAuthRoutes.toLowerCase() === 'si') {
      await createAuthEndpoints();
    }

    console.log(`\n${colors.blue}==================================================${colors.reset}`);
    console.log(`${colors.green}¡Parche aplicado exitosamente!${colors.reset}`);
    console.log(`\n${colors.yellow}No olvide reiniciar el servidor para que los cambios surtan efecto.${colors.reset}`);
    console.log(`${colors.blue}==================================================${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
}

// Función para aplicar el parche de CORS
function applyCorsPatch(content) {
  // Buscar la configuración de CORS
  const corsRegex = /(app\.use\(\s*cors\(\s*\{[\s\S]*?\}\s*\)\s*\);)/;

  if (!corsRegex.test(content)) {
    console.log(`${colors.yellow}⚠️ No se encontró la configuración CORS existente. Insertando nueva configuración...${colors.reset}`);
    // Insertar después de la configuración de helmet
    return content.replace(
      /(app\.use\(helmet\(\)\);)/,
      `$1\n\n  // CORS configuration - Patched for Vercel preview URLs
  app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      console.log(\`CORS request from origin: \${origin}\`);

      // Check if it's a Vercel preview URL for Catalogo Productos
      if (origin.includes('vercel.app') ||
          origin.includes('localhost') ||
          origin === 'https://productosdonjoaquin.vercel.app') {
        console.log(\`Origin \${origin} is allowed by CORS (matched by pattern)\`);
        return callback(null, true);
      }

      console.log(\`Origin \${origin} is NOT allowed by CORS\`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));\n`
    );
  } else {
    // Reemplazar la configuración CORS existente
    return content.replace(
      corsRegex,
      `app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      console.log(\`CORS request from origin: \${origin}\`);

      // Check if it's a Vercel preview URL for Catalogo Productos
      if (origin.includes('vercel.app') ||
          origin.includes('localhost') ||
          origin === 'https://productosdonjoaquin.vercel.app') {
        console.log(\`Origin \${origin} is allowed by CORS (matched by pattern)\`);
        return callback(null, true);
      }

      console.log(\`Origin \${origin} is NOT allowed by CORS\`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }))`
    );
  }
}

// Función para crear endpoints de autenticación
async function createAuthEndpoints() {
  try {
    // Comprobar si existen las rutas y controladores
    const authRoutesDir = path.join(__dirname, 'src', 'routes');
    const authControllersDir = path.join(__dirname, 'src', 'controllers');
    const authServicesDir = path.join(__dirname, 'src', 'services');

    // Verificar directorios
    [authRoutesDir, authControllersDir, authServicesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        console.log(`${colors.yellow}Creando directorio ${dir}...${colors.reset}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Crear archivos de autenticación

    // 1. Auth Routes
    const authRoutesPath = path.join(authRoutesDir, 'auth.routes.ts');
    if (!fs.existsSync(authRoutesPath)) {
      const authRoutesContent = `import { Router } from "express";
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

export default router;`;
      fs.writeFileSync(authRoutesPath, authRoutesContent);
      console.log(`${colors.green}✅ Archivo de rutas de autenticación creado: ${authRoutesPath}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ El archivo de rutas de autenticación ya existe: ${authRoutesPath}${colors.reset}`);
    }

    // 2. Auth Controller
    const authControllerPath = path.join(authControllersDir, 'auth.controller.ts');
    if (!fs.existsSync(authControllerPath)) {
      const authControllerContent = `import { Request, Response } from "express";
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
  async logout(req: Request, res: Response) {
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
      const { data: userData, error: userError } =
        await authService.getUser();

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
            (data.session.expires_at - Math.floor(Date.now() / 1000)) * 1000,
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
export const authController = new AuthController();`;
      fs.writeFileSync(authControllerPath, authControllerContent);
      console.log(`${colors.green}✅ Archivo de controlador de autenticación creado: ${authControllerPath}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ El archivo de controlador de autenticación ya existe: ${authControllerPath}${colors.reset}`);
    }

    // 3. Auth Service
    const authServicePath = path.join(authServicesDir, 'auth.service.ts');
    if (!fs.existsSync(authServicePath)) {
      const authServiceContent = `import { supabase } from '../config/database';

/**
 * Service for handling authentication operations with Supabase
 */
export class AuthService {
  /**
   * Signs in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns User and session data on success, null on failure
   */
  async signIn(email: string, password: string) {
    try {
      // Using Supabase Auth API to sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }

      // Verify user data is returned
      if (!data || !data.session) {
        throw new Error("No se pudo establecer la sesión");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Signs out the current user
   */
  async signOut() {
    try {
      // Using Supabase Auth API to sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  /**
   * Gets the current user's session
   * @returns Session data if authenticated, null if not
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Get session error:", error);
      throw error;
    }
  }

  /**
   * Gets the current user data
   * @returns User data if authenticated, null if not
   */
  async getUser() {
    try {
      return await supabase.auth.getUser();
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const authService = new AuthService();`;
      fs.writeFileSync(authServicePath, authServiceContent);
      console.log(`${colors.green}✅ Archivo de servicio de autenticación creado: ${authServicePath}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ El archivo de servicio de autenticación ya existe: ${authServicePath}${colors.reset}`);
    }

    // 4. Update Routes Index
    const indexRoutesPath = path.join(authRoutesDir, 'index.ts');
    if (fs.existsSync(indexRoutesPath)) {
      let indexContent = fs.readFileSync(indexRoutesPath, 'utf8');

      // Verificar si ya está importado
      if (!indexContent.includes('import authRoutes from "./auth.routes"')) {
        // Agregar importación de auth.routes
        indexContent = indexContent.replace(
          /import\s+.*\s+from\s+["'].*["'];(\s*)/,
          (match) => match + 'import authRoutes from "./auth.routes";\n'
        );

        // Agregar ruta de auth si no existe
        if (!indexContent.includes('router.use("/auth", authRoutes)')) {
          indexContent = indexContent.replace(
            /(router\.use\(["']\/\w+["'],\s*\w+\);)(\s*)(export default router;)/,
            '$1\nrouter.use("/auth", authRoutes);\n$3'
          );
        }

        fs.writeFileSync(indexRoutesPath, indexContent);
        console.log(`${colors.green}✅ Rutas de autenticación agregadas a index.ts${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Las rutas de autenticación ya están configuradas en index.ts${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ No se encontró el archivo index.ts para rutas${colors.reset}`);
    }

    // Confirmar al usuario
    console.log(`${colors.green}✅ Endpoints de autenticación creados correctamente${colors.reset}`);
    console.log(`${colors.yellow}Nota: Es posible que necesites instalar cookie-parser:${colors.reset}`);
    console.log(`npm install cookie-parser @types/cookie-parser --save`);
  } catch (error) {
    console.error(`${colors.red}Error al crear endpoints de autenticación: ${error.message}${colors.reset}`);
  }
}

// Función auxiliar para preguntas
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Ejecutar la función principal
main().catch(console.error);
