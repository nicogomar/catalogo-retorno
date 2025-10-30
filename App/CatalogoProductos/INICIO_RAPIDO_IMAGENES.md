# 🚀 Inicio Rápido - Gestión de Imágenes

## ✅ Estado del Proyecto
- ✅ Backend compilado sin errores
- ✅ Frontend compilado sin errores
- ✅ Funcionalidad 100% implementada
- ✅ Lista para usar

## 📋 Requisitos Previos

1. **Bucket en Supabase Storage**
   - Nombre: `productos`
   - Estado: Creado y accesible

2. **Variables de Entorno** (`api/.env`)
   ```env
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```

3. **Dependencias Instaladas**
   ```bash
   # Backend
   cd api
   npm install

   # Frontend
   cd App
   npm install
   ```

## 🎯 Iniciar el Sistema (3 pasos)

### 1. Iniciar el Backend
```bash
cd api
npm run dev
```
✅ Debe mostrar: "Server running on port 3000"

### 2. Iniciar el Frontend
```bash
cd App
npm start
```
✅ Debe abrir: http://localhost:4200

### 3. Acceder a la Galería
1. Inicia sesión como administrador
2. Ve a: http://localhost:4200/administracion
3. Haz clic en "🖼️ Imágenes"

¡Listo! Ya puedes gestionar tus imágenes.

---

## 🎨 Funcionalidades Disponibles

### ✨ Subir Imagen
1. Clic en "📤 Subir Imagen"
2. Selecciona archivo (JPG, PNG, GIF, WebP)
3. Máximo 5MB
4. Clic en "Subir Imagen"

### 🗑️ Eliminar Imagen
**Individual:**
- Clic en 🗑️ en la tarjeta de imagen

**Múltiple:**
1. Clic en "☑️ Seleccionar"
2. Marca las imágenes deseadas
3. Clic en "🗑️ Eliminar seleccionadas"

### 🔍 Buscar Imagen
- Escribe en la barra de búsqueda
- Filtra por nombre en tiempo real

### 🎚️ Ordenar
- Por Fecha (más reciente primero)
- Por Nombre (A-Z)
- Por Tamaño (menor a mayor)

### 📋 Copiar URL
- Clic en 📋 en la tarjeta
- URL copiada al portapapeles
- Úsala en el campo `img_url` de productos

### ⬇️ Descargar
- Clic en ⬇️ en la tarjeta
- Descarga directa al navegador

### 👁️ Vista Previa
- Clic en cualquier imagen
- Ver en pantalla completa
- Información detallada

---

## 🧪 Probar la Funcionalidad

### Prueba Manual Rápida (5 minutos)

1. **Listar imágenes** ✅
   - Debe mostrar todas las imágenes del bucket
   - Si está vacío, muestra mensaje "No hay imágenes"

2. **Subir una imagen** ✅
   ```
   Imagen de prueba: cualquier JPG < 5MB
   Resultado esperado: Aparece en la galería
   ```

3. **Buscar imagen** ✅
   ```
   Buscar por nombre
   Resultado esperado: Filtra resultados
   ```

4. **Eliminar imagen** ✅
   ```
   Clic en 🗑️
   Confirmar eliminación
   Resultado esperado: Imagen eliminada
   ```

### Prueba Automática con Script

```bash
# Dar permisos de ejecución
chmod +x TESTING_IMAGENES.sh

# Ejecutar tests
./TESTING_IMAGENES.sh all

# O usar modo interactivo
./TESTING_IMAGENES.sh
```

---

## 🔗 Usar Imágenes en Productos

### Flujo de Trabajo:

1. **Subir imagen** en la galería
2. **Copiar URL** (clic en 📋)
3. **Crear/Editar producto**
4. **Pegar URL** en el campo `img_url`
5. **Guardar producto**

### Ejemplo:
```
URL copiada:
https://xxx.supabase.co/storage/v1/object/public/productos/1234-abc.jpg

En el producto:
img_url: https://xxx.supabase.co/storage/v1/object/public/productos/1234-abc.jpg
```

---

## ⚠️ Troubleshooting

### Problema: "Bucket not found"
**Solución:**
1. Ve a Supabase Storage
2. Crea bucket "productos"
3. Hazlo público (o configura políticas)

### Problema: "Autenticación requerida"
**Solución:**
1. Inicia sesión como administrador
2. Verifica que el token sea válido
3. Revisa las cookies del navegador

### Problema: "Failed to upload"
**Solución:**
1. Verifica el tamaño (< 5MB)
2. Verifica el formato (JPG, PNG, GIF, WebP)
3. Revisa las políticas RLS en Supabase
4. Verifica SUPABASE_SERVICE_ROLE_KEY en .env

### Problema: Imágenes no se muestran
**Solución:**
1. Verifica que el bucket sea público
2. Revisa CORS en Supabase
3. Abre la consola del navegador (F12) para ver errores

---

## 📊 Endpoints de la API

```
GET    /api/storage/images              # Listar imágenes
POST   /api/storage/upload               # Subir imagen
DELETE /api/storage/image/:filePath      # Eliminar imagen
POST   /api/storage/delete-multiple      # Eliminar múltiples
GET    /api/storage/url/:filePath        # Obtener URL
GET    /api/storage/stats                # Estadísticas
```

### Ejemplo con cURL:

```bash
# Listar imágenes
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/storage/images

# Subir imagen
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  http://localhost:3000/api/storage/upload

# Eliminar imagen
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/storage/image/filename.jpg
```

---

## 📚 Documentación Completa

- **Guía detallada**: `IMAGENES_README.md`
- **Resumen ejecutivo**: `RESUMEN_IMAGENES.md`
- **Diagramas de flujo**: `IMAGENES_FLOW.md`
- **Script de testing**: `TESTING_IMAGENES.sh`

---

## 🎯 Validaciones

### Archivos Permitidos:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)

### Archivos NO Permitidos:
- ❌ PDF
- ❌ Word/Excel
- ❌ Videos
- ❌ Otros formatos

### Límites:
- Tamaño máximo: **5MB**
- Sin límite de cantidad de archivos

---

## 📝 Checklist Final

Antes de usar en producción, verifica:

- [ ] Bucket "productos" existe en Supabase
- [ ] Variables de entorno configuradas
- [ ] Backend compilado y corriendo (port 3000)
- [ ] Frontend compilado y corriendo (port 4200)
- [ ] Políticas RLS configuradas en Supabase
- [ ] Puedes iniciar sesión como admin
- [ ] Puedes listar imágenes
- [ ] Puedes subir una imagen
- [ ] Puedes eliminar una imagen
- [ ] Las URLs de imágenes funcionan en productos

---

## 🎉 ¡Ya Está Listo!

Si todos los checks anteriores están ✅, la funcionalidad está lista para usar.

### Próximos Pasos:

1. Sube imágenes de tus productos
2. Copia las URLs
3. Úsalas en tus productos
4. Disfruta de tu catálogo con imágenes

---

## 💡 Tips y Mejores Prácticas

### Nomenclatura de Imágenes:
Aunque el sistema renombra automáticamente, usa nombres descriptivos:
- ✅ `producto-silla-roja.jpg`
- ✅ `banner-promocion-verano.png`
- ❌ `IMG_0001.jpg`
- ❌ `descarga.png`

### Optimización:
- Comprime imágenes antes de subir (usa TinyPNG, ImageOptim)
- Usa WebP cuando sea posible (mejor compresión)
- Tamaño recomendado: 800x800px para productos

### Organización:
- Elimina imágenes no usadas regularmente
- Usa nombres descriptivos para facilitar búsqueda
- Considera crear convención de nombres para tu equipo

### Seguridad:
- No compartas URLs de imágenes privadas
- Revisa regularmente el espacio usado
- Mantén backup de imágenes importantes

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa la documentación completa** en `IMAGENES_README.md`
2. **Ejecuta los tests** con `TESTING_IMAGENES.sh`
3. **Revisa los logs** del backend y frontend
4. **Verifica la consola** del navegador (F12)

---

## ✨ Características Destacadas

- 🚀 **Rápido**: Subida y eliminación instantánea
- 🎨 **Intuitivo**: Interfaz fácil de usar
- 🔒 **Seguro**: Autenticación y validaciones
- 📱 **Responsivo**: Funciona en móvil y desktop
- 🔍 **Buscable**: Encuentra imágenes rápidamente
- 🗑️ **Gestión masiva**: Elimina múltiples a la vez

---

**¡Comienza a usar la galería de imágenes ahora!** 🎉