import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { StorageService, StorageImage } from "../../services/storage.service";
import { AlertService } from "../../services/alert.service";

@Component({
  selector: "app-image-gallery",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./image-gallery.component.html",
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          transform: translateY(30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ImageGalleryComponent implements OnInit {
  images: StorageImage[] = [];
  filteredImages: StorageImage[] = [];
  isLoading: boolean = false;
  loadError: string | null = null;

  selectedImages: Set<string> = new Set();
  selectMode: boolean = false;

  showUploadModal: boolean = false;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;

  showDeleteModal: boolean = false;
  imageToDelete: StorageImage | null = null;

  showImagePreview: boolean = false;
  previewImage: StorageImage | null = null;

  searchTerm: string = "";
  sortBy: "name" | "date" | "size" = "date";
  sortOrder: "asc" | "desc" = "desc";

  bucketStats: any = null;

  constructor(
    private storageService: StorageService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.loadImages();
    this.loadBucketStats();
  }

  /**
   * Carga todas las imágenes del bucket
   */
  loadImages(): void {
    this.isLoading = true;
    this.loadError = null;

    this.storageService.listImages().subscribe({
      next: (response) => {
        if (response.success) {
          this.images = response.data;
          this.filteredImages = [...this.images];
          this.applyFilters();
        } else {
          this.loadError = "Error al cargar las imágenes";
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error al cargar imágenes:", error);
        this.loadError =
          "No se pudieron cargar las imágenes. Por favor, intente nuevamente.";
        this.isLoading = false;
      },
    });
  }

  /**
   * Carga las estadísticas del bucket
   */
  loadBucketStats(): void {
    this.storageService.getBucketStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.bucketStats = response.data;
        }
      },
      error: (error) => {
        console.error("Error al cargar estadísticas:", error);
      },
    });
  }

  /**
   * Abre el modal de subida de imagen
   */
  openUploadModal(): void {
    this.showUploadModal = true;
    this.selectedFile = null;
    this.uploadProgress = 0;
  }

  /**
   * Cierra el modal de subida
   */
  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.uploadProgress = 0;
  }

  /**
   * Maneja la selección de archivo
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.storageService.validateImageFile(file);
      if (!validation.valid) {
        this.alertService.showError(validation.error || "Archivo no válido");
        event.target.value = "";
        return;
      }
      this.selectedFile = file;
    }
  }

  /**
   * Sube la imagen seleccionada
   */
  uploadImage(): void {
    if (!this.selectedFile) {
      this.alertService.showError("Por favor seleccione un archivo");
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simular progreso (ya que no tenemos eventos de progreso reales)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.storageService.uploadImage(this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;

        if (response.success) {
          this.alertService.showSuccess("Imagen subida exitosamente");
          this.closeUploadModal();
          this.loadImages();
          this.loadBucketStats();
        } else {
          this.alertService.showError(
            response.message || "Error al subir imagen",
          );
        }
        this.isUploading = false;
      },
      error: (error) => {
        clearInterval(progressInterval);
        console.error("Error al subir imagen:", error);
        this.alertService.showError(
          "Error al subir la imagen. Por favor, intente nuevamente.",
        );
        this.isUploading = false;
      },
    });
  }

  /**
   * Confirma la eliminación de una imagen
   */
  confirmDelete(image: StorageImage): void {
    this.imageToDelete = image;
    this.showDeleteModal = true;
  }

  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.imageToDelete = null;
  }

  /**
   * Elimina la imagen seleccionada
   */
  deleteImage(): void {
    if (!this.imageToDelete) return;

    this.storageService.deleteImage(this.imageToDelete.path).subscribe({
      next: (response) => {
        if (response.success) {
          this.alertService.showSuccess("Imagen eliminada exitosamente");
          this.closeDeleteModal();
          this.loadImages();
          this.loadBucketStats();
        } else {
          this.alertService.showError("Error al eliminar imagen");
        }
      },
      error: (error) => {
        console.error("Error al eliminar imagen:", error);
        this.alertService.showError(
          "Error al eliminar la imagen. Por favor, intente nuevamente.",
        );
      },
    });
  }

  /**
   * Alterna el modo de selección múltiple
   */
  toggleSelectMode(): void {
    this.selectMode = !this.selectMode;
    if (!this.selectMode) {
      this.selectedImages.clear();
    }
  }

  /**
   * Alterna la selección de una imagen
   */
  toggleImageSelection(image: StorageImage): void {
    if (this.selectedImages.has(image.path)) {
      this.selectedImages.delete(image.path);
    } else {
      this.selectedImages.add(image.path);
    }
  }

  /**
   * Verifica si una imagen está seleccionada
   */
  isImageSelected(image: StorageImage): boolean {
    return this.selectedImages.has(image.path);
  }

  /**
   * Elimina las imágenes seleccionadas
   */
  deleteSelectedImages(): void {
    if (this.selectedImages.size === 0) {
      this.alertService.showWarning("No hay imágenes seleccionadas");
      return;
    }

    if (
      !confirm(
        `¿Está seguro que desea eliminar ${this.selectedImages.size} imagen(es)?`,
      )
    ) {
      return;
    }

    const filePaths = Array.from(this.selectedImages);

    this.storageService.deleteMultipleImages(filePaths).subscribe({
      next: (response) => {
        if (response.success) {
          this.alertService.showSuccess(
            `${filePaths.length} imagen(es) eliminada(s) exitosamente`,
          );
          this.selectedImages.clear();
          this.selectMode = false;
          this.loadImages();
          this.loadBucketStats();
        } else {
          this.alertService.showError("Error al eliminar imágenes");
        }
      },
      error: (error) => {
        console.error("Error al eliminar imágenes:", error);
        this.alertService.showError(
          "Error al eliminar las imágenes. Por favor, intente nuevamente.",
        );
      },
    });
  }

  /**
   * Selecciona todas las imágenes visibles
   */
  selectAllImages(): void {
    this.filteredImages.forEach((image) => {
      this.selectedImages.add(image.path);
    });
  }

  /**
   * Deselecciona todas las imágenes
   */
  deselectAllImages(): void {
    this.selectedImages.clear();
  }

  /**
   * Abre la vista previa de una imagen
   */
  previewImageModal(image: StorageImage): void {
    if (this.selectMode) {
      this.toggleImageSelection(image);
    } else {
      this.previewImage = image;
      this.showImagePreview = true;
    }
  }

  /**
   * Cierra la vista previa
   */
  closeImagePreview(): void {
    this.showImagePreview = false;
    this.previewImage = null;
  }

  /**
   * Copia la URL de la imagen al portapapeles
   */
  copyImageUrl(image: StorageImage): void {
    navigator.clipboard
      .writeText(image.url)
      .then(() => {
        this.alertService.showSuccess("URL copiada al portapapeles");
      })
      .catch(() => {
        this.alertService.showError("Error al copiar la URL");
      });
  }

  /**
   * Descarga una imagen
   */
  downloadImage(image: StorageImage): void {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Aplica filtros y ordenamiento
   */
  applyFilters(): void {
    let filtered = [...this.images];

    // Filtrar por búsqueda
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter((image) =>
        image.name.toLowerCase().includes(search),
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "size":
          const sizeA = a.metadata?.size || 0;
          const sizeB = b.metadata?.size || 0;
          comparison = sizeA - sizeB;
          break;
      }

      return this.sortOrder === "asc" ? comparison : -comparison;
    });

    this.filteredImages = filtered;
  }

  /**
   * Maneja el cambio en la búsqueda
   */
  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  /**
   * Cambia el criterio de ordenamiento
   */
  changeSortBy(sortBy: "name" | "date" | "size"): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      this.sortBy = sortBy;
      this.sortOrder = "asc";
    }
    this.applyFilters();
  }

  /**
   * Formatea el tamaño del archivo
   */
  formatSize(bytes: number | undefined): string {
    if (!bytes) return "N/A";
    return this.storageService.formatFileSize(bytes);
  }

  /**
   * Formatea la fecha
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: any): void {
    const img = event?.target as HTMLImageElement | undefined;
    if (!img) return;

    const fallbackSrc = "assets/images/default-product.svg";
    if (img.src && img.src.includes(fallbackSrc)) return;

    img.src = fallbackSrc;
  }
}
