# 🚀 Inicio Rápido - Deploy en Vercel

## ⚡ TL;DR - Solo 3 pasos

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy Frontend (recomendado empezar por aquí)
cd App
vercel --prod

# 3. ¡Listo! Tu app ya está en línea 🎉
```

## 📌 Estado Actual

✅ **Backend**: Ya funciona en Koyeb  
✅ **Frontend**: Listo para Vercel  
✅ **Configuración**: Todo preparado  

## 🎯 Opción Recomendada: Frontend en Vercel + Backend en Koyeb

### ¿Por qué esta opción?

- ✅ **Cero cambios** de código necesarios
- ✅ Backend en Koyeb ya funciona perfectamente
- ✅ Frontend en Vercel = súper rápido y gratis
- ✅ Sin limitaciones de timeout
- ✅ Listo en 2 minutos

### Pasos:

#### 1️⃣ Deploy Frontend en Vercel

**Opción A: Dashboard (más fácil)**

1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Configuración:
   - **Root Directory**: `App`
   - **Framework**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/app/browser`
4. Click "Deploy"

**Opción B: CLI (más rápido)**

```bash
cd App
vercel --prod
```

#### 2️⃣ ¡Ya está! 🎉

Tu frontend estará disponible en: `https://tu-proyecto.vercel.app`

El frontend ya apunta al backend en Koyeb:
```
https://poised-reeva-nicolasgm-184b6c82.koyeb.app/api
```

---

## 🔧 Opción Alternativa: Todo en Vercel

Si prefieres tener todo en Vercel (frontend + backend):

### 1️⃣ Deploy Backend

```bash
cd api
vercel --prod
```

Anota la URL que te da (ej: `https://tu-api.vercel.app`)

### 2️⃣ Actualiza Frontend

Edita `App/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://tu-api.vercel.app/api"  // ⬅️ Tu URL aquí
};
```

### 3️⃣ Actualiza CORS en Backend

Edita `api/src/app.ts`, busca `allowedOrigins`:

```typescript
const allowedOrigins = [
  "http://localhost:4200",
  "https://productosdonjoaquin.vercel.app",
  "https://tu-frontend.vercel.app"  // ⬅️ Añade después del deploy
];
```

### 4️⃣ Deploy Frontend

```bash
cd App
vercel --prod
```

### 5️⃣ Actualiza CORS con la URL final

Repite el paso 3 con la URL correcta del frontend y re-deploy:

```bash
cd api
vercel --prod
```

---

## ✅ Verificar que Funciona

### Test Backend:
```bash
curl https://tu-api.vercel.app/api/health
```

Debe responder:
```json
{
  "success": true,
  "message": "API is running"
}
```

### Test Frontend:
1. Abre tu URL en el navegador
2. DevTools → Console (no debe haber errores)
3. Los productos deben cargar correctamente

---

## 🐛 Problemas Comunes

### Error CORS
**Solución**: Agrega la URL de tu frontend al backend en `allowedOrigins`

### Frontend no carga datos
**Solución**: Verifica que `environment.prod.ts` tenga la URL correcta

### "Module not found"
**Solución**: 
```bash
cd api
npm install
```

### "Function timeout" (solo si backend en Vercel)
**Solución**: Usa la opción recomendada (backend en Koyeb)

---

## 📊 Configuraciones de Vercel

### Variables de Entorno (Backend)

Si deployaste el backend en Vercel, configura en el dashboard:

```
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_key_de_supabase
NODE_ENV=production
```

**Cómo configurarlas:**
1. Dashboard de Vercel → Tu proyecto
2. Settings → Environment Variables
3. Add → Nombre y Valor
4. Re-deploy

---

## 🎯 Checklist Pre-Deploy

Ejecuta el script de verificación:

```bash
./check-vercel-ready.sh
```

Debe mostrar: ✅ sin errores críticos

---

## 💡 Tips

### Deploy Automático con Git
Una vez configurado, cada `git push` a la rama main despliega automáticamente:

```bash
git add .
git commit -m "Update feature"
git push
# Vercel detecta el push y despliega automáticamente 🚀
```

### Preview Deployments
Cada rama/PR obtiene su propia URL de preview:
- Main branch → Producción
- Otras ramas → Preview URLs

### Ver Logs
```bash
vercel logs <deployment-url>
```

O en el dashboard: Project → Deployments → Click deployment → View Logs

### Dominio Personalizado
1. Dashboard → Project → Settings → Domains
2. Add Domain → Tu dominio
3. Configura DNS según instrucciones

---

## 📁 Archivos Importantes

```
CatalogoProductos/
├── App/
│   ├── vercel.json                    ← Config frontend ✅
│   └── src/environments/
│       └── environment.prod.ts        ← URL del backend
├── api/
│   ├── vercel.json                    ← Config backend ✅
│   ├── src/
│   │   ├── vercel-handler.ts          ← Handler serverless ✅
│   │   └── app.ts                     ← CORS config
│   └── .env                           ← Variables locales (NO subir a Git)
├── check-vercel-ready.sh              ← Script de verificación
├── QUICK_START_VERCEL.md              ← Esta guía
├── DEPLOY_DECISION.md                 ← Guía de decisión detallada
└── VERCEL_DEPLOYMENT.md               ← Guía completa técnica
```

---

## 🆘 ¿Necesitas ayuda?

### Documentación:
- `DEPLOY_DECISION.md` - Comparación de opciones
- `VERCEL_DEPLOYMENT.md` - Guía técnica completa
- `api/VERCEL_SETUP.md` - Setup del backend

### Logs y Debug:
- **Vercel**: https://vercel.com/dashboard → Project → Deployments
- **Koyeb**: https://app.koyeb.com → Service → Logs

### Enlaces Útiles:
- [Vercel Docs](https://vercel.com/docs)
- [Angular on Vercel](https://vercel.com/guides/deploying-angular-with-vercel)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)

---

## 🎊 ¡Eso es todo!

Tu aplicación estará en línea en menos de 5 minutos.

**¿Listo para empezar?**

```bash
cd App
vercel --prod
```

**¡Buena suerte! 🚀**