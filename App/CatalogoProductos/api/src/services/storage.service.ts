import { supabaseAdmin } from "../config/database";

/**
 * Servicio para gestionar el almacenamiento de archivos en Supabase Storage
 */
export class StorageService {
  private readonly bucketName = "productos";

  /**
   * Lista todos los archivos en el bucket de productos
   */
  async listImages(
    folder: string = "",
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .list(folder, {
          limit,
          offset,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Error listing images:", error);
        return { data: [], error: error.message };
      }

      // Obtener URLs públicas para cada imagen
      const imagesWithUrls = data.map((file) => {
        const { data: urlData } = supabaseAdmin.storage
          .from(this.bucketName)
          .getPublicUrl(folder ? `${folder}/${file.name}` : file.name);

        return {
          ...file,
          url: urlData.publicUrl,
          path: folder ? `${folder}/${file.name}` : file.name,
        };
      });

      return { data: imagesWithUrls, error: null };
    } catch (error: any) {
      console.error("Exception listing images:", error);
      return { data: [], error: error.message || "Error al listar imágenes" };
    }
  }

  /**
   * Sube un archivo al bucket de productos
   */
  async uploadImage(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<{ data: any; error: string | null }> {
    try {
      // Generar un nombre único para evitar colisiones
      const timestamp = Date.now();
      const extension = fileName.split(".").pop();
      const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(uniqueFileName, file, {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error("Error uploading image:", error);
        return { data: null, error: error.message };
      }

      // Obtener la URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from(this.bucketName)
        .getPublicUrl(uniqueFileName);

      return {
        data: {
          ...data,
          url: urlData.publicUrl,
          name: uniqueFileName,
        },
        error: null,
      };
    } catch (error: any) {
      console.error("Exception uploading image:", error);
      return { data: null, error: error.message || "Error al subir imagen" };
    }
  }

  /**
   * Elimina un archivo del bucket de productos
   */
  async deleteImage(
    filePath: string,
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error("Error deleting image:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Exception deleting image:", error);
      return {
        success: false,
        error: error.message || "Error al eliminar imagen",
      };
    }
  }

  /**
   * Elimina múltiples archivos del bucket
   */
  async deleteMultipleImages(
    filePaths: string[],
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove(filePaths);

      if (error) {
        console.error("Error deleting multiple images:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Exception deleting multiple images:", error);
      return {
        success: false,
        error: error.message || "Error al eliminar imágenes",
      };
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabaseAdmin.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(
    filePath: string,
  ): Promise<{ data: any; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .list("", {
          search: filePath,
        });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data[0] || null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Error al obtener información del archivo",
      };
    }
  }

  /**
   * Verifica si el bucket existe y está accesible
   */
  async checkBucketExists(): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin.storage.getBucket(
        this.bucketName,
      );

      if (error) {
        console.error("Bucket check error:", error);
        return false;
      }

      return data !== null;
    } catch (error) {
      console.error("Exception checking bucket:", error);
      return false;
    }
  }

  /**
   * Obtiene el tamaño total usado en el bucket
   */
  async getBucketSize(): Promise<{ size: number; error: string | null }> {
    try {
      const { data, error } = await this.listImages("", 1000);

      if (error) {
        return { size: 0, error };
      }

      const totalSize = data.reduce(
        (acc: number, file: any) => acc + (file.metadata?.size || 0),
        0,
      );

      return { size: totalSize, error: null };
    } catch (error: any) {
      return {
        size: 0,
        error: error.message || "Error al calcular tamaño del bucket",
      };
    }
  }
}

export default new StorageService();
