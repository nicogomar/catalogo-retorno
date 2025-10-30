# Gestión de Imágenes - Catálogo KDN

## Descripción

Esta funcionalidad permite administrar las imágenes almacenadas en Supabase Storage (bucket "productos"). Los administradores pueden:

- Listar todas las imágenes del bucket
- Subir nuevas imágenes
- Eliminar imágenes individuales o múltiples
- Ver vista previa de imágenes
- Copiar URLs de imágenes
- Descargar imágenes
- Buscar y ordenar imágenes

## Arquitectura

### Backend (API)

#### Archivos Creados/Modificados:

1. **`api/src/services/storage.service.ts`**
   - Servicio para interactuar con Supabase Storage
   - Métodos: listImages, uploadImage, deleteImage, deleteMultipleImages, getPublicUrl, etc.

2. **`api/src/controllers/storage.controller.ts`**
   - Controlador para manejar peticiones HTTP
   - Validaciones de archivos (tipo, tamaño)
   - Manejo de errores

3. **`api/src/routes/storage.routes.ts`**
   - Rutas de la API para gestión de imágenes
   - Requiere autenticación para operaciones sensibles

4. **`api/src/routes/index.ts`**
   - Agregada ruta `/api/storage`

#### Dependencias Instaladas:

```bash
npm install multer @types/multer
```

### Frontend (Angular)

#### Archivos Creados/Modificados:

1. **`App/src/app/services/storage.service.ts`**
   - Servicio Angular para comunicarse con la API
   - Métodos para todas las operaciones de imágenes
   - Validaciones del lado del cliente

2. **`App/src/app/components/image-gallery/`**
   - `image-gallery.component.ts` - Lógica del componente
   - `image-gallery.component.html` - Template
   - `image-gallery.component.css` - Estilos
   - Componente standalone completo para gestión de imágenes

3. **`App/src/app/components/administracion/`**
   - Integración del componente de galería en la sección "Imágenes"

## Endpoints de la API

### GET `/api/storage/images`
Lista todas las imágenes del bucket
- **Autenticación**: Requerida
- **Query params**: 
  - `folder` (opcional): carpeta específica
  - `limit` (opcional, default: 100): límite de resultados
  - `offset` (opcional, default: 0): offset para paginación
- **Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "imagen.jpg",
      "url": "https://...",
      "path": "imagen.jpg",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "metadata": {
        "size": 123456,
        "mimetype": "image/jpeg"
      }
    }
  ],
  "count": 1
}
```

### POST `/api/storage/upload`
Sube una nueva imagen al bucket
- **Autenticación**: Requerida
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `file`: archivo de imagen
- **Validaciones**:
  - Tipos permitidos: JPEG, PNG, GIF, WebP
  - Tamaño máximo: 5MB
- **Respuesta**:
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "data": {
    "path": "1234567890-abc123.jpg",
    "url": "https://...",
    "name": "1234567890-abc123.jpg"
  }
}
```

### DELETE `/api/storage/image/:filePath`
Elimina una imagen del bucket
- **Autenticación**: Requerida
- **Params**: 
  - `filePath`: ruta del archivo a eliminar
- **Respuesta**:
```json
{
  "success": true,
  "message": "Imagen eliminada exitosamente"
}
```

### POST `/api/storage/delete-multiple`
Elimina múltiples imágenes del bucket
- **Autenticación**: Requerida
- **Body**:
```json
{
  "filePaths": ["imagen1.jpg", "imagen2.jpg"]
}
```
- **Respuesta**:
```json
{
  "success": true,
  "message": "Imágenes eliminadas exitosamente"
}
```

### GET `/api/storage/url/:filePath`
Obtiene la URL pública de una imagen
- **Autenticación**: No requerida
- **Params**: 
  - `filePath`: ruta del archivo
- **Respuesta**:
```json
{
  "success": true,
  "data": {
    "url": "https://...",
    "filePath": "imagen.jpg"
  }
}
```

### GET `/api/storage/info/:filePath`
Obtiene información detallada de una imagen
- **Autenticación**: Requerida
- **Params**: 
  - `filePath`: ruta del archivo

### GET `/api/storage/stats`
Obtiene estadísticas del bucket
- **Autenticación**: Requerida
- **Respuesta**:
```json
{
  "success": true,
  "data": {
    "bucketExists": true,
    "totalSize": 12345678,
    "totalSizeMB": "11.77"
  }
}
```

## Configuración de Supabase

### 1. Crear el Bucket

Si el bucket "productos" no existe, créalo en Supabase:

1. Ve a Storage en tu proyecto de Supabase
2. Crea un nuevo bucket llamado "productos"
3. Configura las políticas de acceso:
   - **Public**: Si quieres que las imágenes sean públicas
   - **Private**: Si quieres controlar el acceso

### 2. Políticas de Storage (RLS)

Para permitir operaciones, configura las siguientes políticas en Supabase:

#### Política de Lectura (Pública):
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'productos' );
```

#### Política de Inserción (Autenticados):
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

#### Política de Eliminación (Autenticados):
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

## Uso en el Frontend

### Acceder a la Galería

1. Inicia sesión como administrador
2. Ve a `/administracion`
3. Haz clic en "Imágenes" en el menú lateral
4. La galería de imágenes se mostrará automáticamente

### Funcionalidades Disponibles

#### Subir Imagen:
1. Clic en "📤 Subir Imagen"
2. Selecciona un archivo (JPEG, PNG, GIF, WebP)
3. Máximo 5MB
4. Clic en "Subir Imagen"

#### Eliminar Imagen:
- **Individual**: Clic en el icono 🗑️ en la tarjeta de imagen
- **Múltiple**: 
  1. Clic en "☑️ Seleccionar"
  2. Selecciona las imágenes deseadas
  3. Clic en "🗑️ Eliminar seleccionadas"

#### Copiar URL:
- Clic en el icono 📋 en la tarjeta de imagen
- La URL se copiará al portapapeles

#### Descargar Imagen:
- Clic en el icono ⬇️ en la tarjeta de imagen

#### Vista Previa:
- Clic en cualquier imagen para ver en pantalla completa

#### Buscar:
- Usa la barra de búsqueda para filtrar por nombre

#### Ordenar:
- Ordena por Fecha, Nombre o Tamaño
- Clic en el botón de ordenamiento para cambiar entre ascendente/descendente

## Validaciones

### Backend:
- Tipo de archivo: Solo imágenes (JPEG, PNG, GIF, WebP)
- Tamaño máximo: 5MB
- Autenticación requerida para operaciones sensibles

### Frontend:
- Validación antes de enviar al servidor
- Mensajes de error claros
- Confirmaciones para eliminaciones

## Seguridad

1. **Autenticación**: Todas las operaciones de modificación requieren token JWT válido
2. **Validación de archivos**: Tipo y tamaño validados en backend y frontend
3. **Nombres únicos**: Los archivos se renombran con timestamp + random string para evitar colisiones
4. **Service Role Key**: El backend usa la service role key de Supabase para operaciones administrativas

## Testing

### Prueba Manual:

1. **Iniciar el backend**:
```bash
cd api
npm run dev
```

2. **Iniciar el frontend**:
```bash
cd App
npm start
```

3. **Acceder a**:
```
http://localhost:4200/administracion
```

4. **Pruebas recomendadas**:
   - ✅ Subir imagen válida (< 5MB, formato correcto)
   - ✅ Intentar subir archivo no válido (PDF, archivo muy grande)
   - ✅ Listar todas las imágenes
   - ✅ Buscar imágenes por nombre
   - ✅ Ordenar por diferentes criterios
   - ✅ Copiar URL de imagen
   - ✅ Descargar imagen
   - ✅ Ver vista previa
   - ✅ Eliminar imagen individual
   - ✅ Eliminar múltiples imágenes
   - ✅ Verificar que las imágenes eliminadas ya no aparecen

### Prueba con cURL:

#### Listar imágenes:
```bash
curl -X GET http://localhost:3000/api/storage/images \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Subir imagen:
```bash
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

#### Eliminar imagen:
```bash
curl -X DELETE http://localhost:3000/api/storage/image/filename.jpg \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Error: "Bucket not found"
- Verifica que el bucket "productos" existe en Supabase Storage
- Verifica que las variables de entorno están correctamente configuradas

### Error: "Autenticación requerida"
- Verifica que estás logueado en el frontend
- Verifica que el token JWT es válido
- Verifica que el middleware de autenticación funciona correctamente

### Error: "Failed to upload"
- Verifica el tamaño del archivo (< 5MB)
- Verifica el formato del archivo (JPEG, PNG, GIF, WebP)
- Verifica las políticas de Storage en Supabase
- Verifica que el SUPABASE_SERVICE_ROLE_KEY está configurado

### Las imágenes no se muestran
- Verifica que el bucket es público o que las URLs tienen permisos correctos
- Verifica la política de CORS en Supabase
- Revisa la consola del navegador para errores

## Variables de Entorno

### Backend (.env):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Frontend (environment.ts):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Próximas Mejoras

- [ ] Soporte para carpetas/categorías
- [ ] Edición de imágenes (recortar, redimensionar)
- [ ] Compresión automática de imágenes
- [ ] Drag & drop para subir archivos
- [ ] Subida múltiple de archivos
- [ ] Vista de galería vs lista
- [ ] Filtros avanzados (por tamaño, fecha, tipo)
- [ ] Metadatos personalizados
- [ ] Integración con editor de productos (selector de imágenes)
- [ ] Caché de miniaturas
- [ ] CDN para mejorar rendimiento

## Licencia

Parte del proyecto Catálogo KDN