import { Request, Response } from "express";
import storageService from "../services/storage.service";

/**
 * Controlador para gestionar las operaciones de almacenamiento de imágenes
 */
export class StorageController {
  /**
   * Lista todas las imágenes del bucket
   */
  async listImages(req: Request, res: Response): Promise<void> {
    try {
      const folder = (req.query.folder as string) || "";
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const { data, error } = await storageService.listImages(
        folder,
        limit,
        offset,
      );

      if (error) {
        res.status(500).json({
          success: false,
          message: "Error al listar imágenes",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data,
        count: data.length,
      });
    } catch (error: any) {
      console.error("Error in listImages:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Sube una nueva imagen al bucket
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No se ha proporcionado ningún archivo",
        });
        return;
      }

      const file = req.file.buffer;
      const fileName = req.file.originalname;
      const contentType = req.file.mimetype;

      // Validar tipo de archivo
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(contentType)) {
        res.status(400).json({
          success: false,
          message:
            "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)",
        });
        return;
      }

      // Validar tamaño de archivo (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.length > maxSize) {
        res.status(400).json({
          success: false,
          message: "El archivo es demasiado grande. Tamaño máximo: 5MB",
        });
        return;
      }

      const { data, error } = await storageService.uploadImage(
        file,
        fileName,
        contentType,
      );

      if (error) {
        res.status(500).json({
          success: false,
          message: "Error al subir imagen",
          error,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: "Imagen subida exitosamente",
        data,
      });
    } catch (error: any) {
      console.error("Error in uploadImage:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Elimina una imagen del bucket
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { filePath } = req.params;

      if (!filePath) {
        res.status(400).json({
          success: false,
          message: "No se ha proporcionado la ruta del archivo",
        });
        return;
      }

      const { success, error } = await storageService.deleteImage(filePath);

      if (error || !success) {
        res.status(500).json({
          success: false,
          message: "Error al eliminar imagen",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Imagen eliminada exitosamente",
      });
    } catch (error: any) {
      console.error("Error in deleteImage:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Elimina múltiples imágenes del bucket
   */
  async deleteMultipleImages(req: Request, res: Response): Promise<void> {
    try {
      const { filePaths } = req.body;

      if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
        res.status(400).json({
          success: false,
          message: "No se han proporcionado rutas de archivos válidas",
        });
        return;
      }

      const { success, error } =
        await storageService.deleteMultipleImages(filePaths);

      if (error || !success) {
        res.status(500).json({
          success: false,
          message: "Error al eliminar imágenes",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Imágenes eliminadas exitosamente",
      });
    } catch (error: any) {
      console.error("Error in deleteMultipleImages:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene la URL pública de una imagen
   */
  async getPublicUrl(req: Request, res: Response): Promise<void> {
    try {
      const { filePath } = req.params;

      if (!filePath) {
        res.status(400).json({
          success: false,
          message: "No se ha proporcionado la ruta del archivo",
        });
        return;
      }

      const url = storageService.getPublicUrl(filePath);

      res.status(200).json({
        success: true,
        data: {
          url,
          filePath,
        },
      });
    } catch (error: any) {
      console.error("Error in getPublicUrl:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene información de una imagen
   */
  async getImageInfo(req: Request, res: Response): Promise<void> {
    try {
      const { filePath } = req.params;

      if (!filePath) {
        res.status(400).json({
          success: false,
          message: "No se ha proporcionado la ruta del archivo",
        });
        return;
      }

      const { data, error } = await storageService.getFileInfo(filePath);

      if (error) {
        res.status(500).json({
          success: false,
          message: "Error al obtener información del archivo",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Error in getImageInfo:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene estadísticas del bucket
   */
  async getBucketStats(_req: Request, res: Response): Promise<void> {
    try {
      const bucketExists = await storageService.checkBucketExists();
      const { size, error } = await storageService.getBucketSize();

      if (error) {
        res.status(500).json({
          success: false,
          message: "Error al obtener estadísticas del bucket",
          error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          bucketExists,
          totalSize: size,
          totalSizeMB: (size / (1024 * 1024)).toFixed(2),
        },
      });
    } catch (error: any) {
      console.error("Error in getBucketStats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

export default new StorageController();
