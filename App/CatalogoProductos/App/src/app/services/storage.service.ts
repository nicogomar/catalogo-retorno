import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interfaz para representar una imagen del storage
 */
export interface StorageImage {
  id: string;
  name: string;
  url: string;
  path: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
    cacheControl?: string;
  };
}

/**
 * Interfaz para la respuesta de la lista de imágenes
 */
export interface StorageImagesResponse {
  success: boolean;
  data: StorageImage[];
  count: number;
}

/**
 * Interfaz para la respuesta de subida de imagen
 */
export interface UploadImageResponse {
  success: boolean;
  message: string;
  data: {
    path: string;
    url: string;
    name: string;
  };
}

/**
 * Interfaz para la respuesta de eliminación
 */
export interface DeleteImageResponse {
  success: boolean;
  message: string;
}

/**
 * Interfaz para las estadísticas del bucket
 */
export interface BucketStats {
  success: boolean;
  data: {
    bucketExists: boolean;
    totalSize: number;
    totalSizeMB: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly apiUrl = `${environment.apiUrl}/storage`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todas las imágenes del bucket
   * @param folder Carpeta opcional
   * @param limit Límite de resultados
   * @param offset Offset para paginación
   * @returns Observable con la respuesta de imágenes
   */
  listImages(
    folder: string = '',
    limit: number = 100,
    offset: number = 0
  ): Observable<StorageImagesResponse> {
    const params: any = { limit, offset };
    if (folder) {
      params.folder = folder;
    }

    return this.http.get<StorageImagesResponse>(`${this.apiUrl}/images`, {
      params,
    });
  }

  /**
   * Sube una nueva imagen al bucket
   * @param file Archivo a subir
   * @returns Observable con la respuesta de la subida
   */
  uploadImage(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadImageResponse>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  /**
   * Elimina una imagen del bucket
   * @param filePath Ruta del archivo a eliminar
   * @returns Observable con la respuesta de la eliminación
   */
  deleteImage(filePath: string): Observable<DeleteImageResponse> {
    return this.http.delete<DeleteImageResponse>(
      `${this.apiUrl}/image/${encodeURIComponent(filePath)}`
    );
  }

  /**
   * Elimina múltiples imágenes del bucket
   * @param filePaths Array de rutas de archivos a eliminar
   * @returns Observable con la respuesta de la eliminación
   */
  deleteMultipleImages(filePaths: string[]): Observable<DeleteImageResponse> {
    return this.http.post<DeleteImageResponse>(
      `${this.apiUrl}/delete-multiple`,
      { filePaths }
    );
  }

  /**
   * Obtiene la URL pública de una imagen
   * @param filePath Ruta del archivo
   * @returns Observable con la URL pública
   */
  getPublicUrl(filePath: string): Observable<{ success: boolean; data: { url: string; filePath: string } }> {
    return this.http.get<{ success: boolean; data: { url: string; filePath: string } }>(
      `${this.apiUrl}/url/${encodeURIComponent(filePath)}`
    );
  }

  /**
   * Obtiene información de una imagen
   * @param filePath Ruta del archivo
   * @returns Observable con la información del archivo
   */
  getImageInfo(filePath: string): Observable<{ success: boolean; data: StorageImage }> {
    return this.http.get<{ success: boolean; data: StorageImage }>(
      `${this.apiUrl}/info/${encodeURIComponent(filePath)}`
    );
  }

  /**
   * Obtiene estadísticas del bucket
   * @returns Observable con las estadísticas
   */
  getBucketStats(): Observable<BucketStats> {
    return this.http.get<BucketStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Valida si un archivo es una imagen válida
   * @param file Archivo a validar
   * @returns true si es válido, false en caso contrario
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)',
      };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
      };
    }

    return { valid: true };
  }

  /**
   * Formatea el tamaño de archivo a formato legible
   * @param bytes Tamaño en bytes
   * @returns String con el tamaño formateado
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
