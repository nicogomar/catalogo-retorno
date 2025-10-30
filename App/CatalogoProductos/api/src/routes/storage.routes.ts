import { Router } from "express";
import storageController from "../controllers/storage.controller";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Configurar multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

/**
 * @route   GET /api/storage/images
 * @desc    Lista todas las imágenes del bucket
 * @access  Private (requiere autenticación)
 * @query   folder - Carpeta opcional
 * @query   limit - Límite de resultados (default: 100)
 * @query   offset - Offset para paginación (default: 0)
 */
router.get("/images", authMiddleware, storageController.listImages);

/**
 * @route   POST /api/storage/upload
 * @desc    Sube una nueva imagen al bucket
 * @access  Private (requiere autenticación)
 * @body    file - Archivo de imagen (multipart/form-data)
 */
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  storageController.uploadImage,
);

/**
 * @route   DELETE /api/storage/image/:filePath
 * @desc    Elimina una imagen del bucket
 * @access  Private (requiere autenticación)
 * @param   filePath - Ruta del archivo a eliminar
 */
router.delete(
  "/image/:filePath",
  authMiddleware,
  storageController.deleteImage,
);

/**
 * @route   POST /api/storage/delete-multiple
 * @desc    Elimina múltiples imágenes del bucket
 * @access  Private (requiere autenticación)
 * @body    filePaths - Array de rutas de archivos
 */
router.post(
  "/delete-multiple",
  authMiddleware,
  storageController.deleteMultipleImages,
);

/**
 * @route   GET /api/storage/url/:filePath
 * @desc    Obtiene la URL pública de una imagen
 * @access  Public
 * @param   filePath - Ruta del archivo
 */
router.get("/url/:filePath", storageController.getPublicUrl);

/**
 * @route   GET /api/storage/info/:filePath
 * @desc    Obtiene información de una imagen
 * @access  Private (requiere autenticación)
 * @param   filePath - Ruta del archivo
 */
router.get("/info/:filePath", authMiddleware, storageController.getImageInfo);

/**
 * @route   GET /api/storage/stats
 * @desc    Obtiene estadísticas del bucket
 * @access  Private (requiere autenticación)
 */
router.get("/stats", authMiddleware, storageController.getBucketStats);

export default router;
