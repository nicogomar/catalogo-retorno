/**
 * fix-build-errors.js - Script para corregir errores de compilación en la API de Catálogo Productos
 *
 * Este script corrige automáticamente los errores de compilación después de agregar los archivos
 * de autenticación y CORS.
 *
 * Uso: node fix-build-errors.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para la salida
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}==================================================${colors.reset}`);
console.log(`${colors.blue}     REPARACIÓN DE ERRORES DE COMPILACIÓN         ${colors.reset}`);
console.log(`${colors.blue}==================================================${colors.reset}`);
console.log('\n');

// Función principal
async function main() {
  try {
    // 1. Verificar e instalar cookie-parser
    console.log(`${colors.yellow}Instalando cookie-parser...${colors.reset}`);
    try {
      execSync('npm install cookie-parser @types/cookie-parser --save', { stdio: 'inherit' });
      console.log(`${colors.green}✅ cookie-parser instalado correctamente${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error al instalar cookie-parser:${colors.reset}`, error.message);
      console.log(`${colors.yellow}Intenta ejecutar manualmente: npm install cookie-parser @types/cookie-parser --save${colors.reset}`);
    }

    // 2. Corregir error en auth.controller.ts (req sin usar y supabase no definido)
    const authControllerPath = path.join(__dirname, 'src', 'controllers', 'auth.controller.ts');
    if (fs.existsSync(authControllerPath)) {
      console.log(`${colors.yellow}Corrigiendo auth.controller.ts...${colors.reset}`);
      let authControllerContent = fs.readFileSync(authControllerPath, 'utf8');

      // Corregir req sin usar
      authControllerContent = authControllerContent.replace(
        /async logout\(req: Request, res: Response\)/,
        'async logout(_req: Request, res: Response)'
      );

      // Corregir supabase no definido, importando desde authService
      authControllerContent = authControllerContent.replace(
        /const \{ data: userData, error: userError \} =\s*await supabase\.auth\.getUser\(\);/,
        'const { data: userData, error: userError } = await authService.getUser();'
      );

      // Corregir data.session.expires_at posiblemente undefined
      authControllerContent = authControllerContent.replace(
        /(Date\.now\(\) \+\s*\()data\.session\.expires_at - Math\.floor\(Date\.now\(\) \/ 1000\)(\) \* 1000)/,
        '$1(data.session.expires_at || Math.floor(Date.now() / 1000) + 3600) - Math.floor(Date.now() / 1000)$2'
      );

      fs.writeFileSync(authControllerPath, authControllerContent);
      console.log(`${colors.green}✅ auth.controller.ts corregido${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ No se encontró src/controllers/auth.controller.ts${colors.reset}`);
    }

    // 3. Corregir error en auth.service.ts (User sin usar)
    const authServicePath = path.join(__dirname, 'src', 'services', 'auth.service.ts');
    if (fs.existsSync(authServicePath)) {
      console.log(`${colors.yellow}Corrigiendo auth.service.ts...${colors.reset}`);
      let authServiceContent = fs.readFileSync(authServicePath, 'utf8');

      // Eliminar la importación de User si no se usa
      authServiceContent = authServiceContent.replace(
        /import \{ supabase \} from '\.\.\/config\/database';\s*import \{ User \} from '\.\.\/types';/,
        "import { supabase } from '../config/database';"
      );

      fs.writeFileSync(authServicePath, authServiceContent);
      console.log(`${colors.green}✅ auth.service.ts corregido${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ No se encontró src/services/auth.service.ts${colors.reset}`);
    }

    // 4. Actualizar index.ts de rutas para incluir auth.routes si no está ya
    const routesIndexPath = path.join(__dirname, 'src', 'routes', 'index.ts');
    if (fs.existsSync(routesIndexPath)) {
      console.log(`${colors.yellow}Verificando rutas en index.ts...${colors.reset}`);
      let routesIndexContent = fs.readFileSync(routesIndexPath, 'utf8');

      let modified = false;

      // Añadir importación de auth.routes si no existe
      if (!routesIndexContent.includes('import authRoutes from')) {
        routesIndexContent = routesIndexContent.replace(
          /(import.*from.*;\s*)/,
          '$1import authRoutes from "./auth.routes";\n'
        );
        modified = true;
      }

      // Añadir ruta de auth si no existe
      if (!routesIndexContent.includes('router.use("/auth"')) {
        routesIndexContent = routesIndexContent.replace(
          /(router\.use\(["']\/\w+["'],.*\);\s*)(export default router;)/,
          '$1router.use("/auth", authRoutes);\n\n$2'
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(routesIndexPath, routesIndexContent);
        console.log(`${colors.green}✅ routes/index.ts actualizado${colors.reset}`);
      } else {
        console.log(`${colors.green}✓ Las rutas de autenticación ya están configuradas${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ No se encontró src/routes/index.ts${colors.reset}`);
    }

    // 5. Verificar si la interfaz User existe o crearla
    const typesPath = path.join(__dirname, 'src', 'types', 'index.ts');
    if (fs.existsSync(typesPath)) {
      console.log(`${colors.yellow}Verificando tipos...${colors.reset}`);
      let typesContent = fs.readFileSync(typesPath, 'utf8');

      // Añadir interfaz User si no existe
      if (!typesContent.includes('interface User')) {
        typesContent = `/**
 * User entity - represents an authenticated user
 */
export interface User {
  id: string;
  email: string;
  role?: string;
  nombre?: string | null;
}

${typesContent}`;
        fs.writeFileSync(typesPath, typesContent);
        console.log(`${colors.green}✅ Interfaz User añadida a types/index.ts${colors.reset}`);
      } else {
        console.log(`${colors.green}✓ La interfaz User ya existe${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}⚠️ No se encontró src/types/index.ts - la interfaz User podría ser necesaria${colors.reset}`);
    }

    console.log(`\n${colors.blue}==================================================${colors.reset}`);
    console.log(`${colors.green}¡Correcciones completadas!${colors.reset}`);
    console.log(`\n${colors.yellow}Ahora intenta ejecutar 'npm run build' nuevamente.${colors.reset}`);
    console.log(`${colors.blue}==================================================${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error inesperado:${colors.reset}`, error);
  }
}

// Ejecutar la función principal
main().catch(console.error);
