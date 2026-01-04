import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CategoriaService, Categoria, NuevaCategoria, ActualizarCategoria } from "../../services/categoria.service";

@Component({
  selector: "app-categoria-management",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./categoria-management.component.html",
  styles: [
    `
      .categoria-management {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .header h2 {
        margin: 0;
        color: var(--color-primary);
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .btn-primary {
        background-color: var(--color-primary);
        color: white;
      }

      .btn-primary:hover {
        background-color: var(--color-primary-dark);
        transform: translateY(-1px);
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn-warning {
        background-color: #ffc107;
        color: #212529;
      }

      .btn-sm {
        padding: 5px 10px;
        font-size: 0.875rem;
      }

      .search-bar {
        margin-bottom: 20px;
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .search-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 16px;
      }

      .categorias-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }

      .categoria-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .categoria-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .categoria-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 10px;
      }

      .categoria-nombre {
        font-size: 1.2rem;
        font-weight: 600;
        color: #333;
        margin: 0;
        word-break: break-word;
      }

      .categoria-id {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 5px;
      }

      .categoria-fecha {
        color: #999;
        font-size: 0.75rem;
      }

      .categoria-actions {
        display: flex;
        gap: 5px;
      }

      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
      }

      .modal.show {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-content {
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .modal-header h3 {
        margin: 0;
        color: var(--color-primary);
      }

      .close {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #999;
      }

      .close:hover {
        color: #333;
      }

      .form-group {
        margin-bottom: 15px;
      }

      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 16px;
      }

      .form-control:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: #666;
      }

      .error {
        background-color: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border: 1px solid #f5c6cb;
      }

      .success {
        background-color: #d4edda;
        color: #155724;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border: 1px solid #c3e6cb;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #666;
      }

      .empty-state h3 {
        margin-bottom: 10px;
        color: #999;
      }

      @media (max-width: 768px) {
        .categorias-grid {
          grid-template-columns: 1fr;
        }

        .header {
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }

        .modal-content {
          width: 95%;
          padding: 20px;
        }
      }
    `,
  ],
})
export class CategoriaManagementComponent implements OnInit {
  categorias: Categoria[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Modal properties
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  // Form data
  categoriaForm: NuevaCategoria = { nombre: "" };
  editCategoriaForm: ActualizarCategoria = { nombre: "" };
  selectedCategoria: Categoria | null = null;

  // Search
  searchTerm = "";

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading = true;
    this.error = null;

    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error loading categorias:", err);
        this.error = "Error al cargar las categorías. Por favor, intente nuevamente.";
        this.loading = false;
      },
    });
  }

  searchCategorias(): void {
    if (!this.searchTerm.trim()) {
      this.loadCategorias();
      return;
    }

    this.loading = true;
    this.categoriaService.searchCategoriasByNombre(this.searchTerm).subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error searching categorias:", err);
        this.error = "Error al buscar categorías. Por favor, intente nuevamente.";
        this.loading = false;
      },
    });
  }

  openCreateModal(): void {
    this.categoriaForm = { nombre: "" };
    this.showCreateModal = true;
    this.clearMessages();
  }

  openEditModal(categoria: Categoria): void {
    this.selectedCategoria = categoria;
    this.editCategoriaForm = { nombre: categoria.nombre || "" };
    this.showEditModal = true;
    this.clearMessages();
  }

  openDeleteModal(categoria: Categoria): void {
    this.selectedCategoria = categoria;
    this.showDeleteModal = true;
    this.clearMessages();
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedCategoria = null;
    this.clearMessages();
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  createCategoria(): void {
    if (!this.categoriaForm.nombre.trim()) {
      this.error = "El nombre de la categoría es requerido.";
      return;
    }

    this.loading = true;
    this.categoriaService.createCategoria(this.categoriaForm).subscribe({
      next: (data) => {
        this.categorias.unshift(data);
        this.success = "Categoría creada exitosamente.";
        this.closeModals();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error creating categoria:", err);
        this.error = "Error al crear la categoría. Por favor, intente nuevamente.";
        this.loading = false;
      },
    });
  }

  updateCategoria(): void {
    if (!this.selectedCategoria || !this.editCategoriaForm.nombre?.trim()) {
      this.error = "El nombre de la categoría es requerido.";
      return;
    }

    this.loading = true;
    this.categoriaService
      .updateCategoria(this.selectedCategoria.id!, this.editCategoriaForm)
      .subscribe({
        next: (data) => {
          const index = this.categorias.findIndex(
            (c) => c.id === this.selectedCategoria!.id
          );
          if (index !== -1) {
            this.categorias[index] = data;
          }
          this.success = "Categoría actualizada exitosamente.";
          this.closeModals();
          this.loading = false;
        },
        error: (err) => {
          console.error("Error updating categoria:", err);
          this.error = "Error al actualizar la categoría. Por favor, intente nuevamente.";
          this.loading = false;
        },
      });
  }

  deleteCategoria(): void {
    if (!this.selectedCategoria) {
      return;
    }

    this.loading = true;
    this.categoriaService.deleteCategoria(this.selectedCategoria.id!).subscribe({
      next: () => {
        this.categorias = this.categorias.filter(
          (c) => c.id !== this.selectedCategoria!.id
        );
        this.success = "Categoría eliminada exitosamente.";
        this.closeModals();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error deleting categoria:", err);
        this.error = "Error al eliminar la categoría. Por favor, intente nuevamente.";
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTerm.trim() === "") {
      this.loadCategorias();
    }
  }

  onSearchSubmit(): void {
    this.searchCategorias();
  }

  formatDate(date?: Date | string | null): string {
    if (!date) return "N/A";
    
    // If it's already a Date, use it directly
    if (date instanceof Date) {
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    
    // If it's a string, convert to Date first
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
