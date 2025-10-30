# 🎯 Guía Rápida: ¿Dónde Desplegar?

## 🚨 TL;DR - Problema Actual

**Tu app funciona en Koyeb pero no en Vercel porque:**
- Koyeb = Servidor tradicional Node.js ✅
- Vercel = Funciones Serverless ⚠️ (requiere adaptación)

## ✅ SOLUCIÓN INMEDIATA

### Opción 1: Híbrida (RECOMENDADA) ⭐

```
Frontend (Angular)  →  Vercel    (✅ Perfecto)
Backend (Express)   →  Koyeb     (✅ Ya funciona)
```

**Ventajas:**
- ✅ No requiere cambios en el código
- ✅ Sin limitaciones de timeout
- ✅ Ya está funcionando en Koyeb
- ✅ Frontend súper rápido en Vercel

**Pasos:**
1. Deploy solo el frontend en Vercel
2. Mantén el backend en Koyeb (URL actual: `https://poised-reeva-nicolasgm-184b6c82.koyeb.app`)
3. El frontend ya apunta a esa URL

---

### Opción 2: Todo en Vercel

```
Frontend (Angular)  →  Vercel    (✅ Perfecto)
Backend (Express)   →  Vercel    (⚠️ Con limitaciones)
```

**Ventajas:**
- ✅ Un solo proveedor
- ✅ Plan gratuito generoso
- ✅ Deploy automático con Git

**Desventajas:**
- ⚠️ Timeout de 10 segundos
- ⚠️ Cold starts (1-3 segundos)
- ⚠️ No soporta WebSockets

**Pasos:**
1. Ya creé `api/src/vercel-handler.ts` ✅
2. Ya actualicé `api/vercel.json` ✅
3. Deploy backend desde carpeta `api/`
4. Deploy frontend desde carpeta `App/`
5. Actualizar URLs cruzadas

---

## 📋 Instrucciones Detalladas

### OPCIÓN 1: Solo Frontend en Vercel (Más fácil)

#### Paso 1: Deploy Frontend
```bash
cd App
vercel --prod
```

O desde el dashboard:
- Root Directory: `App`
- Framework: Angular
- Build Command: `npm run build`
- Output Directory: `dist/app/browser`

**¡Listo!** El frontend ya apunta al backend en Koyeb.

---

### OPCIÓN 2: Todo en Vercel

#### Paso 1: Deploy Backend

**Dashboard de Vercel:**
1. New Project → Import tu repo
2. Configuración:
   - Root Directory: `api`
   - Framework: Other
   - Build Command: (vacío)
3. Variables de Entorno:
   ```
   SUPABASE_URL=tu_url
   SUPABASE_KEY=tu_key
   NODE_ENV=production
   ```
4. Deploy

**CLI:**
```bash
cd api
vercel --prod
# Anota la URL: https://tu-api.vercel.app
```

#### Paso 2: Actualizar Frontend

Edita `App/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: "https://tu-api.vercel.app/api"  // ⬅️ Nueva URL
};
```

#### Paso 3: Actualizar CORS en Backend

Edita `api/src/app.ts`, busca `allowedOrigins` y agrega:
```typescript
const allowedOrigins = [
  "http://localhost:4200",
  "https://productosdonjoaquin.vercel.app",
  "https://tu-frontend.vercel.app"  // ⬅️ Tu nueva URL
];
```

#### Paso 4: Deploy Frontend
```bash
cd App
vercel --prod
# Anota la URL: https://tu-frontend.vercel.app
```

#### Paso 5: Actualizar CORS nuevamente (si es necesario)

Si la URL del frontend es diferente, vuelve al Paso 3 con la URL correcta.

---

## 🔍 ¿Cómo saber si funcionó?

### Test del Backend:
```bash
# Health check
curl https://tu-api.vercel.app/api/health

# Debe responder:
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

### Test del Frontend:
1. Abre tu URL en el navegador
2. Abre DevTools → Console
3. No debe haber errores de CORS
4. Los productos deben cargar correctamente

---

## 🐛 Solución de Problemas Comunes

### Error: "CORS policy blocked"
```typescript
// api/src/app.ts - Agrega tu URL del frontend
const allowedOrigins = [
  "http://localhost:4200",
  "https://tu-frontend-url.vercel.app"  // ⬅️
];
```

### Error: "Cannot read environment variables"
1. Ve a Vercel Dashboard
2. Project Settings → Environment Variables
3. Agrega `SUPABASE_URL` y `SUPABASE_KEY`
4. Re-deploy

### Error: "Function timeout"
**Solución:** Usa Opción 1 (backend en Koyeb)

### Frontend no carga datos
1. Verifica que `environment.prod.ts` tenga la URL correcta
2. Rebuild y re-deploy el frontend
3. Verifica CORS en el backend

---

## 💰 Costos

| Opción | Frontend | Backend | Total/mes |
|--------|----------|---------|-----------|
| Opción 1 | Vercel Gratis | Koyeb ~$5 | ~$5 |
| Opción 2 | Vercel Gratis | Vercel Gratis | $0 |

---

## ⚡ Mi Recomendación Personal

```
🏆 Usa OPCIÓN 1 (Híbrida)

Razones:
1. Ya funciona, no necesitas cambiar nada del backend
2. Sin limitaciones de timeout
3. Mejor rendimiento para operaciones de BD complejas
4. Frontend en Vercel = súper rápido
5. Koyeb $5/mes es muy razonable
```

**Solo usa Opción 2 si:**
- Presupuesto es $0 estricto
- Tu API hace operaciones muy rápidas (< 5 segundos)
- Tráfico bajo/intermitente

---

## 📁 Archivos Modificados/Creados

Para soportar Vercel:
- ✅ `api/src/vercel-handler.ts` (nuevo)
- ✅ `api/vercel.json` (actualizado)
- ✅ `VERCEL_DEPLOYMENT.md` (guía completa)
- ✅ `api/VERCEL_SETUP.md` (guía técnica)
- ✅ `DEPLOY_DECISION.md` (este archivo)

---

## 🎬 Próximos Pasos

### Si eliges Opción 1:
```bash
cd App
vercel --prod
# ¡Listo! 🎉
```

### Si eliges Opción 2:
1. Deploy backend en Vercel
2. Copiar URL del backend
3. Actualizar `environment.prod.ts`
4. Actualizar CORS en `app.ts`
5. Deploy frontend en Vercel
6. Copiar URL del frontend
7. Actualizar CORS nuevamente
8. ¡Listo! 🎉

---

## 📞 URLs de Referencia

**Documentación creada:**
- `VERCEL_DEPLOYMENT.md` - Guía completa paso a paso
- `api/VERCEL_SETUP.md` - Detalles técnicos del backend

**Enlaces útiles:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs - Node.js](https://vercel.com/docs/functions/runtimes/node-js)
- [Koyeb Dashboard](https://app.koyeb.com/)

---

**¿Necesitas ayuda?** Revisa los logs en:
- Vercel: Dashboard → Tu proyecto → Deployments → Logs
- Koyeb: Dashboard → Services → Logs

**¡Buena suerte! 🚀**