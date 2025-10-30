# 🖼️ Flujo de Gestión de Imágenes - Diagrama Visual

## 📊 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Angular)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Componente: AdministracionComponent              │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │   Sección: "Imágenes"                              │ │  │
│  │  │                                                     │ │  │
│  │  │   ┌─────────────────────────────────────────────┐ │ │  │
│  │  │   │  ImageGalleryComponent                      │ │ │  │
│  │  │   │  - Listar imágenes                          │ │ │  │
│  │  │   │  - Subir imágenes                           │ │ │  │
│  │  │   │  - Eliminar imágenes                        │ │ │  │
│  │  │   │  - Buscar/Ordenar                           │ │ │  │
│  │  │   │  - Vista previa                             │ │ │  │
│  │  │   └─────────────────────────────────────────────┘ │ │  │
│  │  │                      ↕                             │ │  │
│  │  │   ┌─────────────────────────────────────────────┐ │ │  │
│  │  │   │  StorageService                             │ │ │  │
│  │  │   │  - listImages()                             │ │ │  │
│  │  │   │  - uploadImage()                            │ │ │  │
│  │  │   │  - deleteImage()                            │ │ │  │
│  │  │   │  - deleteMultipleImages()                   │ │ │  │
│  │  │   │  - getBucketStats()                         │ │ │  │
│  │  │   └─────────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Requests (JWT Auth)
                            │ GET/POST/DELETE
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Routes: /api/storage/*                         │  │
│  │  - GET    /images          (listar)                       │  │
│  │  - POST   /upload          (subir)                        │  │
│  │  - DELETE /image/:path     (eliminar)                     │  │
│  │  - POST   /delete-multiple (eliminar múltiples)           │  │
│  │  - GET    /stats           (estadísticas)                 │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│                            │ Middleware: authMiddleware          │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Controller: StorageController                     │  │
│  │  - listImages()       → Listar archivos                  │  │
│  │  - uploadImage()      → Validar y subir                  │  │
│  │  - deleteImage()      → Eliminar archivo                 │  │
│  │  - deleteMultiple()   → Eliminar varios                  │  │
│  │  - getBucketStats()   → Obtener stats                    │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Service: StorageService                           │  │
│  │  - listImages()       → supabaseAdmin.storage.list()     │  │
│  │  - uploadImage()      → supabaseAdmin.storage.upload()   │  │
│  │  - deleteImage()      → supabaseAdmin.storage.remove()   │  │
│  │  - getPublicUrl()     → supabaseAdmin.storage.getUrl()   │  │
│  │  - checkBucket()      → supabaseAdmin.storage.getBucket()│  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                            │
                            │ Supabase Client SDK
                            │ (Service Role Key)
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      SUPABASE STORAGE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Bucket: "productos"                          │  │
│  │                                                           │  │
│  │  📁 imagen1-1234567890-abc.jpg                           │  │
│  │  📁 producto-1234567891-def.png                          │  │
│  │  📁 banner-1234567892-ghi.webp                           │  │
│  │  📁 ...                                                   │  │
│  │                                                           │  │
│  │  Políticas RLS:                                          │  │
│  │  ✅ SELECT  → Público                                    │  │
│  │  ✅ INSERT  → Autenticado                                │  │
│  │  ✅ DELETE  → Autenticado                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Operaciones

### 1️⃣ LISTAR IMÁGENES

```
Usuario                Frontend              Backend               Supabase
   │                      │                     │                     │
   │  Click "Imágenes"    │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  ngOnInit()         │                     │
   │                      │  loadImages()       │                     │
   │                      │                     │                     │
   │                      │  GET /api/storage/images                 │
   │                      ├─────────────────────>                     │
   │                      │  (JWT Token)        │                     │
   │                      │                     │  authMiddleware     │
   │                      │                     │  ✅ Validar token   │
   │                      │                     │                     │
   │                      │                     │  storage.list()     │
   │                      │                     ├─────────────────────>
   │                      │                     │                     │
   │                      │                     │  Array de archivos  │
   │                      │                     <─────────────────────┤
   │                      │                     │                     │
   │                      │  Response {         │                     │
   │                      │    data: [...],     │                     │
   │                      │    count: N         │                     │
   │                      │  }                  │                     │
   │                      <─────────────────────┤                     │
   │                      │                     │                     │
   │  Mostrar galería     │                     │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
```

### 2️⃣ SUBIR IMAGEN

```
Usuario                Frontend              Backend               Supabase
   │                      │                     │                     │
   │  Click "Subir"       │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  Abrir modal        │                     │
   │  <Modal abierto>     │                     │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
   │  Seleccionar archivo │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  onFileSelected()   │                     │
   │                      │  - Validar tipo     │                     │
   │                      │  - Validar tamaño   │                     │
   │                      │  ✅ Archivo válido  │                     │
   │  "Archivo OK"        │                     │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
   │  Click "Subir"       │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  uploadImage()      │                     │
   │                      │                     │                     │
   │                      │  POST /api/storage/upload                │
   │                      │  FormData(file)     │                     │
   │                      ├─────────────────────>                     │
   │                      │  (JWT Token)        │                     │
   │                      │                     │  authMiddleware     │
   │                      │                     │  ✅ Validar auth    │
   │                      │                     │                     │
   │                      │                     │  Multer procesa file│
   │                      │                     │  - Validar tipo     │
   │                      │                     │  - Validar tamaño   │
   │                      │                     │  ✅ Validaciones OK │
   │                      │                     │                     │
   │                      │                     │  storage.upload()   │
   │                      │                     │  - Nombre único     │
   │                      │                     ├─────────────────────>
   │                      │                     │  (timestamp-random) │
   │                      │                     │                     │
   │                      │                     │  ✅ Archivo subido  │
   │                      │                     <─────────────────────┤
   │                      │                     │  + URL pública      │
   │                      │                     │                     │
   │                      │  Response {         │                     │
   │                      │    success: true,   │                     │
   │                      │    data: { url }    │                     │
   │                      │  }                  │                     │
   │                      <─────────────────────┤                     │
   │                      │                     │                     │
   │                      │  Cerrar modal       │                     │
   │                      │  Recargar lista     │                     │
   │  "¡Éxito!"           │                     │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
```

### 3️⃣ ELIMINAR IMAGEN

```
Usuario                Frontend              Backend               Supabase
   │                      │                     │                     │
   │  Click 🗑️ (eliminar) │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  confirmDelete()    │                     │
   │  <Confirmación>      │  Abrir modal        │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
   │  Click "Eliminar"    │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  deleteImage()      │                     │
   │                      │                     │                     │
   │                      │  DELETE /api/storage/image/:path         │
   │                      ├─────────────────────>                     │
   │                      │  (JWT Token)        │                     │
   │                      │                     │  authMiddleware     │
   │                      │                     │  ✅ Validar auth    │
   │                      │                     │                     │
   │                      │                     │  storage.remove()   │
   │                      │                     ├─────────────────────>
   │                      │                     │  [filePath]         │
   │                      │                     │                     │
   │                      │                     │  ✅ Archivo eliminado
   │                      │                     <─────────────────────┤
   │                      │                     │                     │
   │                      │  Response {         │                     │
   │                      │    success: true    │                     │
   │                      │  }                  │                     │
   │                      <─────────────────────┤                     │
   │                      │                     │                     │
   │                      │  Cerrar modal       │                     │
   │                      │  Recargar lista     │                     │
   │  "Eliminado"         │                     │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
```

### 4️⃣ ELIMINAR MÚLTIPLES IMÁGENES

```
Usuario                Frontend              Backend               Supabase
   │                      │                     │                     │
   │  Click "Seleccionar" │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  toggleSelectMode() │                     │
   │  <Modo selección>    │  selectMode = true  │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
   │  Clic en imagen 1    │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  toggleSelection()  │                     │
   │  Clic en imagen 2    │  [img1, img2]      │                     │
   ├──────────────────────>                     │                     │
   │                      │  toggleSelection()  │                     │
   │  Clic en imagen 3    │  [img1, img2, img3] │                     │
   ├──────────────────────>                     │                     │
   │                      │                     │                     │
   │  Click "Eliminar     │                     │                     │
   │   seleccionadas"     │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │  deleteMultiple()   │                     │
   │  <Confirmación>      │  "¿Eliminar 3?"     │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
   │  Click "Confirmar"   │                     │                     │
   ├──────────────────────>                     │                     │
   │                      │                     │                     │
   │                      │  POST /api/storage/delete-multiple       │
   │                      │  { filePaths: [...] }                    │
   │                      ├─────────────────────>                     │
   │                      │  (JWT Token)        │                     │
   │                      │                     │  authMiddleware     │
   │                      │                     │  ✅ Validar auth    │
   │                      │                     │                     │
   │                      │                     │  storage.remove()   │
   │                      │                     │  [path1, path2, ...] │
   │                      │                     ├─────────────────────>
   │                      │                     │                     │
   │                      │                     │  ✅ Archivos        │
   │                      │                     │     eliminados      │
   │                      │                     <─────────────────────┤
   │                      │                     │                     │
   │                      │  Response {         │                     │
   │                      │    success: true    │                     │
   │                      │  }                  │                     │
   │                      <─────────────────────┤                     │
   │                      │                     │                     │
   │                      │  Limpiar selección  │                     │
   │                      │  Recargar lista     │                     │
   │  "3 eliminadas"      │                     │                     │
   <──────────────────────┤                     │                     │
   │                      │                     │                     │
```

## 🎯 Validaciones en Cada Capa

### Frontend (Angular)
```
┌─────────────────────────────────────────┐
│  VALIDACIONES DEL CLIENTE               │
├─────────────────────────────────────────┤
│  ✓ Tipo de archivo (JPEG, PNG, GIF, WebP)
│  ✓ Tamaño máximo (5MB)                  │
│  ✓ Archivo seleccionado                 │
│  ✓ Token de autenticación presente      │
│  ✓ Confirmación de eliminación          │
└─────────────────────────────────────────┘
```

### Backend (Express)
```
┌─────────────────────────────────────────┐
│  VALIDACIONES DEL SERVIDOR              │
├─────────────────────────────────────────┤
│  ✓ Token JWT válido (authMiddleware)   │
│  ✓ Usuario autenticado                  │
│  ✓ Tipo de archivo (MIME type)          │
│  ✓ Tamaño máximo (5MB)                  │
│  ✓ Archivo presente en request          │
│  ✓ FilePath válido                      │
│  ✓ Array de paths válido                │
└─────────────────────────────────────────┘
```

### Supabase Storage
```
┌─────────────────────────────────────────┐
│  POLÍTICAS DE SEGURIDAD (RLS)           │
├─────────────────────────────────────────┤
│  ✓ Lectura: Público                     │
│  ✓ Escritura: auth.role() = authenticated
│  ✓ Eliminación: auth.role() = authenticated
│  ✓ Bucket correcto ("productos")        │
└─────────────────────────────────────────┘
```

## 📝 Estados de la Interfaz

```
┌─────────────────────────────────────────────────────────────┐
│                   ESTADOS DEL COMPONENTE                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. LOADING (isLoading = true)                              │
│     ┌─────────────────────────────────┐                     │
│     │  🔄 Loading spinner             │                     │
│     │  "Cargando imágenes..."         │                     │
│     └─────────────────────────────────┘                     │
│                                                               │
│  2. ERROR (loadError != null)                               │
│     ┌─────────────────────────────────┐                     │
│     │  ❌ Mensaje de error            │                     │
│     │  [Botón: Reintentar]            │                     │
│     └─────────────────────────────────┘                     │
│                                                               │
│  3. EMPTY (images.length === 0)                             │
│     ┌─────────────────────────────────┐                     │
│     │  🖼️  "No hay imágenes"          │                     │
│     │  [Botón: Subir primera imagen]  │                     │
│     └─────────────────────────────────┘                     │
│                                                               │
│  4. NO RESULTS (filteredImages.length === 0)                │
│     ┌─────────────────────────────────┐                     │
│     │  🔍 "No se encontraron          │                     │
│     │      resultados"                │                     │
│     └─────────────────────────────────┘                     │
│                                                               │
│  5. SUCCESS (images.length > 0)                             │
│     ┌─────────────────────────────────┐                     │
│     │  📤 [Subir]  ☑️ [Seleccionar]   │                     │
│     │  🔍 [Buscar...]  🎚️ [Ordenar]   │                     │
│     │  ┌───┬───┬───┬───┐              │                     │
│     │  │img│img│img│img│ Grid         │                     │
│     │  ├───┼───┼───┼───┤              │                     │
│     │  │img│img│img│img│              │                     │
│     │  └───┴───┴───┴───┘              │                     │
│     └─────────────────────────────────┘                     │
│                                                               │
│  6. SELECT MODE (selectMode = true)                         │
│     ┌─────────────────────────────────┐                     │
│     │  ℹ️ "3 seleccionadas"            │                     │
│     │  [Seleccionar todas]            │                     │
│     │  [Deseleccionar todas]          │                     │
│     │  [🗑️ Eliminar seleccionadas]    │                     │
│     │  ┌───┬───┬───┬───┐              │                     │
│     │  │☑️ │☑️ │img│☑️ │ Con checkboxes│                     │
│     │  └───┴───┴───┴───┘              │                     │
│     └─────────────────────────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Flujo de Autenticación

```
┌────────────────────────────────────────────────────────────────┐
│                    AUTENTICACIÓN JWT                            │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend                      Backend                          │
│     │                             │                             │
│     │  HTTP Request               │                             │
│     │  Headers: {                 │                             │
│     │    Authorization:           │                             │
│     │    "Bearer <token>"         │                             │
│     │  }                          │                             │
│     ├─────────────────────────────>                             │
│     │                             │                             │
│     │                             │  authMiddleware             │
│     │                             │  ┌──────────────────────┐  │
│     │                             │  │ 1. Extraer token     │  │
│     │                             │  │    - Cookie          │  │
│     │                             │  │    - Header          │  │
│     │                             │  │                      │  │
│     │                             │  │ 2. Validar token     │  │
│     │                             │  │    getUserByToken()  │  │
│     │                             │  │                      │  │
│     │                             │  │ 3. Usuario válido?   │  │
│     │                             │  │    ✅ req.user = user│  │
│     │                             │  │    ❌ Error 401      │  │
│     │                             │  │                      │  │
│     │                             │  │ 4. next() → controller│
│     │                             │  └──────────────────────┘  │
│     │                             │                             │
│     │  Response (success/error)   │                             │
│     <─────────────────────────────┤                             │
│     │                             │                             │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## 🎨 Componentes Visuales

```
┌──────────────────────────────────────────────────────────────────┐
│  ESTRUCTURA DEL COMPONENTE IMAGE-GALLERY                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  HEADER                                                     │  │
│  │  ┌─────────────────┐  ┌────────────────────────────────┐  │  │
│  │  │ Título          │  │ 📤 Subir  │  ☑️ Seleccionar    │  │  │
│  │  │ "N imágenes"    │  │           │                     │  │  │
│  │  │ "X MB usados"   │  └────────────────────────────────┘  │  │
│  │  └─────────────────┘                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  TOOLBAR                                                    │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐   │  │
│  │  │ 🔍 Buscar...     │  │ Ordenar: [Fecha▼][Nombre][Tamaño]│
│  │  └──────────────────┘  └──────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  SELECTION TOOLBAR (si selectMode = true)                  │  │
│  │  "N seleccionadas"  [Sel todas][Desel todas][🗑️ Eliminar] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  IMAGES GRID                                                │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │  │
│  │  │ [IMG]  │ │ [IMG]  │ │ [IMG]  │ │ [IMG]  │              │  │
│  │  │ Nombre │ │ Nombre │ │ Nombre │ │ Nombre │              │  │
│  │  │ Fecha  │ │ Fecha  │ │ Fecha  │ │ Fecha  │              │  │
│  │  │ Tamaño │ │ Tamaño │ │ Tamaño │ │ Tamaño │              │  │
│  │  │ 📋⬇️🗑️  │ │ 📋⬇️🗑️  │ │ 📋⬇️🗑️  │ │ 📋⬇️🗑️  │              │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘              │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │  │
│  │  │ [IMG]  │ │ [IMG]  │ │ [IMG]  │ │ [IMG]  │              │  │
│  │  │  ...   │ │  ...   │ │  ...   │ │  ...   │              │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

MODALES:

┌─────────────────────────────┐  ┌─────────────────────────────┐
│  MODAL: SUBIR IMAGEN        │  │  MODAL: CONFIRMAR ELIMINAR  │
├─────────────────────────────┤  ├─────────────────────────────┤
│  [X]                        │  │  [X]                        │
│  "Subir Nueva Imagen"       │  │  "Confirmar Eliminación"    │
│                             │  │                             │
│  ┌───────────────────────┐  │  │  "¿Eliminar imagen.jpg?"    │
│  │                       │  │  │  "No se puede deshacer"     │
│  │   Arrastra o click    │  │  │                             │
│  │   para seleccionar    │  │  │  [Cancelar]  [Eliminar]     │
│  │                       │  │  │                             │
│  └───────────────────────┘  │  └─────────────────────────────┘
│  "Max: 5MB, JPG/PNG/GIF"    │
│  ▓▓▓▓▓▓▓▓░░░░ 80%          │  ┌─────────────────────────────┐
│                             │  │  MODAL: VISTA PREVIA        │
│  [Cancelar]  [Subir]        │  ├─────────────────────────────┤
└─────────────────────────────┘  │            [X]              │
                                 │  ┌───────────────────────┐  │
                                 │  │                       │  │
                                 │  │     [IMAGEN GRANDE]   │  │
                                 │  │                       │  │
                                 │  └───────────────────────┘  │
                                 │  "imagen.jpg"               │
                                 │  "📅 01/