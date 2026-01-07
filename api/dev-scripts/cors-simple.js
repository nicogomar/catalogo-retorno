/**
 * cors-simple.js - Solución CORS simple para API de Catálogo Productos
 *
 * Este script proporciona una solución simple para problemas de CORS
 * con URLs dinámicas de Vercel sin necesidad de dependencias adicionales.
 *
 * Uso: node cors-simple.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Crear interfaz para leer entrada del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colores para la salida
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}==================================================${colors.reset}`);
console.log(`${colors.blue}      SOLUCIÓN CORS SIMPLE - CATÁLOGO KDN         ${colors.reset}`);
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

    // Preguntar si se desea aplicar la configuración CORS simple
    const answer = await askQuestion(`${colors.yellow}¿Desea aplicar la configuración CORS simple que soporte URLs de Vercel? (s/n): ${colors.reset}`);

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

    // Actualizar la configuración CORS
    appContent = applyCorsConfig(appContent);

    // Guardar los cambios
    fs.writeFileSync(appPath, appContent);
    console.log(`${colors.green}✅ Configuración CORS simple aplicada exitosamente${colors.reset}`);

    console.log(`\n${colors.blue}==================================================${colors.reset}`);
    console.log(`${colors.green}¡Configuración aplicada exitosamente!${colors.reset}`);
    console.log(`${colors.yellow}La nueva configuración CORS:${colors.reset}`);
    console.log(`${colors.blue}- Permite automáticamente todos los dominios de Vercel${colors.reset}`);
    console.log(`${colors.blue}- Mantiene soporte para localhost y dominio principal${colors.reset}`);
    console.log(`${colors.blue}- No requiere ninguna dependencia adicional${colors.reset}`);
    console.log(`\n${colors.yellow}No olvide recompilar y reiniciar el servidor:${colors.reset}`);
    console.log(`npm run build`);
    console.log(`${colors.blue}==================================================${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
}

// Función para aplicar la configuración CORS simple
function applyCorsConfig(content) {
  // Buscar la configuración de CORS
  const corsRegex = /(app\.use\(\s*cors\(\s*\{[\s\S]*?\}\s*\)\s*\);)/;

  if (!corsRegex.test(content)) {
    console.log(`${colors.yellow}⚠️ No se encontró la configuración CORS existente. Insertando nueva configuración...${colors.reset}`);
    // Insertar después de la configuración de helmet
    return content.replace(
      /(app\.use\(helmet\(\)\);)/,
      `$1\n\n  // CORS configuration - Simple solution for Vercel preview URLs
  app.use(cors({
    origin: function(origin, callback) {
      // Permitir solicitudes sin origen (como curl o apps móviles)
      if (!origin) return callback(null, true);

      // Permitir dominios conocidos explícitamente
      const allowedOrigins = [
        "http://localhost:4200",
        "http://localhost:3000",
        "https://productosdonjoaquin.vercel.app"
      ];

      // Verificar si el dominio está en la lista de permitidos
      if (allowedOrigins.includes(origin)) {
        console.log(\`Origin \${origin} is allowed by CORS (exact match)\`);
        return callback(null, true);
      }

      // Permitir automáticamente todos los dominios de Vercel
      if (origin.includes("vercel.app")) {
        console.log(\`Origin \${origin} is allowed by CORS (Vercel domain)\`);
        return callback(null, true);
      }

      // Rechazar otros orígenes
      console.log(\`Origin \${origin} is NOT allowed by CORS\`);
      callback(new Error("Not allowed by CORS"));
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
      // Permitir solicitudes sin origen (como curl o apps móviles)
      if (!origin) return callback(null, true);

      // Permitir dominios conocidos explícitamente
      const allowedOrigins = [
        "http://localhost:4200",
        "http://localhost:3000",
        "https://productosdonjoaquin.vercel.app"
      ];

      // Verificar si el dominio está en la lista de permitidos
      if (allowedOrigins.includes(origin)) {
        console.log(\`Origin \${origin} is allowed by CORS (exact match)\`);
        return callback(null, true);
      }

      // Permitir automáticamente todos los dominios de Vercel
      if (origin.includes("vercel.app")) {
        console.log(\`Origin \${origin} is allowed by CORS (Vercel domain)\`);
        return callback(null, true);
      }

      // Rechazar otros orígenes
      console.log(\`Origin \${origin} is NOT allowed by CORS\`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }))`
    );
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
