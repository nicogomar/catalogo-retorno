/**
 * cleanup.js - Script para eliminar implementaciones problemáticas del backend
 *
 * Este script elimina los archivos relacionados con autenticación y CORS
 * que pueden estar causando problemas en el despliegue.
 *
 * Uso: node cleanup.js
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Función para imprimir mensajes coloreados
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

// Archivos a eliminar
const filesToRemove = [
  'src/utils/cors.ts',
  'src/services/auth.service.ts',
  'src/controllers/auth.controller.ts',
  'src/routes/auth.routes.ts',
  'cors-fix.js',
  'fix-build-errors.js',
  'SOLUCION_CORS_AUTH.md',
  'CORREGIR_ERRORES.md',
  'deploy-cors.sh',
  'make-executable.sh',
  'push-changes.sh',
];

// Directorios a verificar si están vacíos después de eliminar archivos
const dirsToCheck = [
  'src/utils',
  'src/services',
  'src/controllers',
  'src/routes',
];

// Función principal
async function main() {
  log.info('Iniciando limpieza de implementaciones problemáticas...');

  // Crear directorio de respaldo
  const backupDir = path.join(__dirname, 'backup_before_cleanup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
    log.info(`Directorio de respaldo creado: ${backupDir}`);
  }

  // Eliminar archivos
  let filesRemoved = 0;
  for (const file of filesToRemove) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      // Hacer copia de respaldo
      const backupPath = path.join(backupDir, file.replace(/\//g, '_'));
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Asegurar que exista el directorio para el backup
        const backupFileDir = path.dirname(backupPath);
        if (!fs.existsSync(backupFileDir)) {
          fs.mkdirSync(backupFileDir, { recursive: true });
        }

        // Guardar respaldo
        fs.writeFileSync(backupPath, content);
        log.info(`Respaldo creado: ${backupPath}`);

        // Eliminar archivo original
        fs.unlinkSync(filePath);
        log.success(`Archivo eliminado: ${file}`);
        filesRemoved++;
      } catch (error) {
        log.error(`Error al procesar archivo ${file}: ${error.message}`);
      }
    }
  }

  // Limpiar importaciones y usos en app.ts
  const appPath = path.join(__dirname, 'src', 'app.ts');
  if (fs.existsSync(appPath)) {
    try {
      // Hacer respaldo
      const backupPath = path.join(backupDir, 'app.ts');
      fs.copyFileSync(appPath, backupPath);
      log.info(`Respaldo creado para app.ts`);

      let content = fs.readFileSync(appPath, 'utf8');

      // Eliminar importaciones problemáticas
      content = content.replace(/import cookieParser from ['"]cookie-parser['"];?\s*/g, '');
      content = content.replace(/import\s*{\s*createCorsOptions\s*}\s*from\s*['"]\.\/utils\/cors['"];?\s*/g, '');

      // Eliminar uso de cookieParser
      content = content.replace(/app\.use\(cookieParser\(\)\);?\s*/g, '');

      // Reemplazar configuración CORS por la predeterminada
      const corsRegex = /(app\.use\(\s*cors\()(createCorsOptions\(\)|\{[\s\S]*?\})(\)\s*\);)/;
      if (corsRegex.test(content)) {
        content = content.replace(corsRegex,
          `$1{\n` +
          `    origin: process.env.ALLOWED_ORIGINS?.split(",") || [\n` +
          `      "http://localhost:4200",\n` +
          `      "http://localhost:3000",\n` +
          `      "https://productosdonjoaquin.vercel.app",\n` +
          `      "https://catalogo-productos-oupdgz709.vercel.app",\n` +
          `      "https://catalogo-productos-m37e0j3h0.vercel.app",\n` +
          `      "https://catalogo-productos-ktz2npzss.vercel.app"\n` +
          `    ],\n` +
          `    credentials: true,\n` +
          `    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],\n` +
          `    allowedHeaders: ["Content-Type", "Authorization"]\n` +
          `  }$3`
        );
        log.success('Configuración CORS restaurada a la versión simple');
      }

      // Guardar cambios
      fs.writeFileSync(appPath, content);
      log.success('Archivo app.ts limpiado');
    } catch (error) {
      log.error(`Error al limpiar app.ts: ${error.message}`);
    }
  }

  // Limpiar index.ts de rutas
  const routesPath = path.join(__dirname, 'src', 'routes', 'index.ts');
  if (fs.existsSync(routesPath)) {
    try {
      // Hacer respaldo
      const backupPath = path.join(backupDir, 'routes_index.ts');
      fs.copyFileSync(routesPath, backupPath);
      log.info(`Respaldo creado para routes/index.ts`);

      let content = fs.readFileSync(routesPath, 'utf8');

      // Eliminar importación de authRoutes
      content = content.replace(/import\s+authRoutes\s+from\s+["']\.\/auth\.routes["'];?\s*/g, '');

      // Eliminar uso de authRoutes
      content = content.replace(/router\.use\(["']\/auth["'],\s*authRoutes\);?\s*/g, '');

      // Eliminar auth de los endpoints listados
      content = content.replace(/(endpoints:\s*\{\s*[\s\S]*?)auth:\s*["']\/api\/auth["'],?\s*/g, '$1');

      // Guardar cambios
      fs.writeFileSync(routesPath, content);
      log.success('Archivo routes/index.ts limpiado');
    } catch (error) {
      log.error(`Error al limpiar routes/index.ts: ${error.message}`);
    }
  }

  // Verificar y eliminar directorios vacíos
  for (const dir of dirsToCheck) {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
          fs.rmdirSync(dirPath);
          log.success(`Directorio vacío eliminado: ${dir}`);
        }
      } catch (error) {
        log.error(`Error al verificar directorio ${dir}: ${error.message}`);
      }
    }
  }

  // Resumen
  log.info(`=== Resumen de la limpieza ===`);
  log.info(`- Archivos eliminados: ${filesRemoved}`);
  log.info(`- Respaldos creados en: ${backupDir}`);
  log.info(`- Configuraciones restauradas: app.ts, routes/index.ts`);

  log.success('Limpieza completada. La API debería estar lista para compilar y desplegar.');
  log.warning('No olvides ejecutar "npm run build" antes de desplegar nuevamente.');
}

// Ejecutar script
main().catch(error => {
  log.error(`Error inesperado: ${error.message}`);
  process.exit(1);
});
