# Guía de Deployment en Vercel

## 🚨 Diferencias entre Koyeb y Vercel

### Koyeb (Actual)
- ✅ Soporta servidores Node.js tradicionales con `app.listen()`
- ✅ Puede ejecutar procesos continuos
- ✅ Ideal para APIs Express tradicionales

### Vercel
- ⚠️ **NO soporta** `app.listen()` - usa funciones serverless
- ⚠️ Cada request inicia una nueva función
- ⚠️ Tiempo máximo de ejecución: 10 segundos (plan gratuito)
- ✅ Perfecto para aplicaciones Angular/React
- ✅ Puede ejecutar APIs pero con arquitectura serverless

## 📦 Estructura del Proyecto

```
CatalogoProductos/
├── App/              # Frontend Angular (✅ Compatible con Vercel)
└── api/              # Backend Express (⚠️ Requiere adaptación)
```

## 🔧 Configuración Realizada

### 1. Backend API (Adaptación para Vercel)

#### Archivo creado: `api/src/vercel-handler.ts`
```typescript
import createApp from "./app";

// Create the Express app
const app = createApp();

// Export the app as a serverless function handler for Vercel
export default app;
```

#### Archivo actualizado: `api/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/vercel-handler.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/vercel-handler.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Frontend App (Ya configurado correctamente)

#### `App/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/app/browser",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🚀 Pasos para Deploy en Vercel

### Opción A: Deploy desde el Dashboard de Vercel (Recomendado)

#### Para el Backend (API):

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "Add New..." → "Project"
3. Importa tu repositorio de GitHub
4. **Configuración importante:**
   - **Root Directory**: `api`
   - **Framework Preset**: Other
   - **Build Command**: (dejar vacío o `npm install`)
   - **Output Directory**: (dejar vacío)

5. **Variables de Entorno** (⚠️ IMPORTANTE):
   ```
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_KEY=tu_key_de_supabase
   NODE_ENV=production
   ```

6. Click en "Deploy"

#### Para el Frontend (App):

1. Crea otro proyecto en Vercel
2. **Configuración importante:**
   - **Root Directory**: `App`
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/app/browser`

3. **Variables de Entorno**:
   ```
   (No requiere variables si la API ya está desplegada)
   ```

4. Click en "Deploy"

### Opción B: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy del Backend
cd api
vercel --prod

# Deploy del Frontend
cd ../App
vercel --prod
```

## 🔗 Actualizar URLs después del Deploy

### 1. Obtén las URLs de Vercel

Después del deploy, Vercel te dará URLs como:
```
Backend:  https://tu-api-nombre.vercel.app
Frontend: https://tu-app-nombre.vercel.app
```

### 2. Actualiza el Frontend

Edita `App/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://tu-api-nombre.vercel.app/api"  // ⬅️ Cambiar aquí
};
```

### 3. Actualiza el Backend (CORS)

Edita `api/src/app.ts` y añade tu URL de Vercel frontend:

```typescript
const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:3000",
  "https://productosdonjoaquin.vercel.app",
  "https://tu-app-nombre.vercel.app"  // ⬅️ Añadir tu URL
];
```

### 4. Re-deploya

Haz commit de los cambios y Vercel re-desplegará automáticamente:

```bash
git add .
git commit -m "Update URLs for Vercel deployment"
git push
```

## ⚠️ Limitaciones de Vercel (Plan Gratuito)

1. **Timeout**: 10 segundos máximo por request
2. **Cold Starts**: La primera request puede ser lenta
3. **Tamaño**: Max 50MB por deployment
4. **Invocaciones**: 100GB-hours/mes (suficiente para desarrollo)

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Asegúrate de tener todas las dependencias
cd api
npm install
```

### Error: "Function timeout"
- Las operaciones de base de datos deben completarse en < 10 segundos
- Optimiza tus queries de Supabase

### Error: "CORS policy"
- Verifica que tu URL frontend esté en `allowedOrigins`
- Vercel asigna URLs aleatorias, añádelas al backend

### Error: "Cannot GET /"
- Verifica que `vercel.json` esté correctamente configurado
- Asegúrate que la ruta del handler es correcta

## 📊 Comparación: ¿Dónde deployar qué?

| Componente | Koyeb | Vercel | Recomendación |
|------------|-------|--------|---------------|
| Frontend Angular | ✅ Funciona | ✅ **Mejor opción** | **Vercel** |
| Backend Express | ✅ **Mejor opción** | ⚠️ Funciona (con adaptaciones) | **Koyeb** |

## 💡 Recomendación Final

### Setup Óptimo:
```
Frontend (App)  → Deploy en Vercel
Backend (API)   → Deploy en Koyeb (mantener como está)
```

### Si quieres todo en Vercel:
1. Frontend: Deploy directo (ya está listo)
2. Backend: Usa el nuevo `vercel-handler.ts`
3. Actualiza `environment.prod.ts` con la nueva URL del backend

### Configuración actual en `environment.prod.ts`:
```typescript
// Opción 1: Backend en Koyeb (actual)
apiUrl: "https://poised-reeva-nicolasgm-184b6c82.koyeb.app/api"

// Opción 2: Backend en Vercel (después del deploy)
apiUrl: "https://tu-api-nombre.vercel.app/api"
```

## 🎯 Próximos Pasos

1. [ ] Deploy el backend en Vercel (o mantenerlo en Koyeb)
2. [ ] Deploy el frontend en Vercel
3. [ ] Actualizar `environment.prod.ts` con la URL correcta
4. [ ] Actualizar CORS en el backend con la URL del frontend
5. [ ] Testear la aplicación completa
6. [ ] Configurar dominio personalizado (opcional)

## 📝 Notas Adicionales

- **Variables de entorno**: NUNCA las subas a Git
- **Supabase**: Asegúrate que las credenciales estén configuradas en Vercel
- **Monitoreo**: Vercel provee logs en tiempo real en el dashboard
- **Preview Deployments**: Cada push a una rama crea un deployment de preview automático

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en el dashboard de Vercel
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que Supabase permita conexiones desde las IPs de Vercel
4. Consulta la documentación: https://vercel.com/docs