# 🚀 Despliegue del API en Vercel

## ⚠️ IMPORTANTE: Diferencias con Koyeb

Este API fue diseñado originalmente para **Koyeb**, que soporta servidores Node.js tradicionales. **Vercel usa funciones serverless** y requiere una configuración diferente.

## 📋 Cambios Realizados para Vercel

### 1. Archivo Handler Serverless

Se creó `src/vercel-handler.ts` que exporta la app Express sin el `.listen()`:

```typescript
import createApp from "./app";

const app = createApp();

// Export sin .listen() para Vercel
export default app;
```

### 2. Configuración de Vercel

El archivo `vercel.json` está configurado para usar el handler:

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

## 🔧 Deploy en Vercel

### Opción 1: Dashboard de Vercel (Más fácil)

1. Ve a https://vercel.com/dashboard
2. Click en "Add New Project"
3. Conecta tu repositorio de GitHub/GitLab
4. Configura el proyecto:
   - **Root Directory**: `api`
   - **Framework Preset**: Other
   - **Build Command**: (dejar vacío)
   - **Install Command**: `npm install`
   - **Output Directory**: (dejar vacío)

5. **Agrega Variables de Entorno**:
   ```
   SUPABASE_URL=tu_supabase_url
   SUPABASE_KEY=tu_supabase_anon_key
   NODE_ENV=production
   ```

6. Click en "Deploy"

### Opción 2: CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd api
vercel --prod

# Configurar variables de entorno
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

## 🔗 Después del Deploy

### 1. Obtén tu URL
Vercel te dará una URL como: `https://tu-proyecto-api.vercel.app`

### 2. Actualiza el Frontend
Edita `App/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://tu-proyecto-api.vercel.app/api"
};
```

### 3. Actualiza CORS
Edita `api/src/app.ts` y agrega la URL de tu frontend en `allowedOrigins`:

```typescript
const allowedOrigins = [
  "http://localhost:4200",
  "https://productosdonjoaquin.vercel.app",
  "https://tu-frontend.vercel.app"  // ⬅️ Añade tu URL
];
```

## 🧪 Probar el Deployment

```bash
# Health check
curl https://tu-proyecto-api.vercel.app/api/health

# Listar productos
curl https://tu-proyecto-api.vercel.app/api/productos
```

## ⚡ Limitaciones de Vercel (Plan Gratuito)

| Limitación | Valor | Impacto |
|------------|-------|---------|
| Timeout | 10 segundos | Operaciones largas fallarán |
| Tamaño función | 50 MB | Limita dependencias |
| Invocaciones | 100 GB-hours/mes | Suficiente para desarrollo |
| Cold start | 1-3 segundos | Primera request más lenta |

## 🐛 Troubleshooting

### Error: "Module not found: @supabase/supabase-js"
```bash
# Asegúrate que todas las dependencias estén en package.json
npm install
```

### Error: "FUNCTION_INVOCATION_TIMEOUT"
- Tus operaciones de DB toman más de 10 segundos
- Optimiza tus queries o usa Koyeb en su lugar

### Error: "CORS policy blocked"
1. Verifica que la URL del frontend esté en `allowedOrigins`
2. Re-deploy el backend después de actualizar CORS

### Error: "Cannot read environment variables"
- Ve a Project Settings → Environment Variables en Vercel
- Agrega todas las variables necesarias
- Re-deploy el proyecto

## 📊 Comparación: Koyeb vs Vercel

| Característica | Koyeb | Vercel |
|----------------|-------|--------|
| Tipo | Servidor continuo | Serverless |
| `.listen()` | ✅ Soportado | ❌ No soportado |
| Timeout | Sin límite | 10s (gratis), 60s (pro) |
| Cold starts | Mínimos | 1-3 segundos |
| WebSockets | ✅ Soportado | ❌ No soportado |
| Precio | $5/mes mínimo | Gratis hasta 100 GB-hours |
| Setup | Más complejo | Muy simple |

## 💡 Recomendación

### Para este proyecto:

```
✅ OPCIÓN RECOMENDADA:
   Frontend (App) → Vercel
   Backend (API)  → Koyeb (mantener actual)

⚠️ OPCIÓN ALTERNATIVA (todo en Vercel):
   Frontend → Vercel
   Backend  → Vercel (con limitaciones)
```

**¿Por qué mantener el backend en Koyeb?**
- No hay límite de timeout
- Mejor para operaciones largas de DB
- Servidor siempre activo (sin cold starts)
- Más flexible para APIs complejas

**¿Cuándo usar Vercel para el backend?**
- Operaciones rápidas (< 10 segundos)
- Tráfico bajo/intermitente
- Presupuesto limitado (plan gratuito)
- No requieres WebSockets

## 📝 Archivos Importantes

```
api/
├── src/
│   ├── index.ts              # Servidor tradicional (para Koyeb)
│   ├── vercel-handler.ts     # Handler serverless (para Vercel)
│   └── app.ts                # Aplicación Express (compartida)
├── vercel.json               # Configuración de Vercel
├── Procfile                  # Configuración de Koyeb
└── package.json              # Dependencias
```

## 🎯 Checklist de Deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] `vercel-handler.ts` creado y funcionando
- [ ] `vercel.json` correctamente configurado
- [ ] Build exitoso sin errores
- [ ] Endpoint `/api/health` responde correctamente
- [ ] CORS configurado para el frontend
- [ ] Frontend actualizado con la nueva URL
- [ ] Todas las rutas funcionan correctamente
- [ ] Supabase permite conexiones desde Vercel

## 🔐 Variables de Entorno Necesarias

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=tu_anon_key_aqui

# Node
NODE_ENV=production
```

## 📚 Recursos Útiles

- [Vercel Node.js Documentation](https://vercel.com/docs/functions/runtimes/node-js)
- [Deploying Express.js on Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/tutorials/with-vercel)

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en el dashboard de Vercel
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que el build compile correctamente
4. Comprueba que Supabase no esté bloqueando las conexiones

---

**Última actualización**: Configuración lista para deployment en Vercel con soporte serverless.