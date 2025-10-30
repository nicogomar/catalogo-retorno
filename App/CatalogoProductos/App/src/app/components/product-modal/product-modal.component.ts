import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Producto } from "../../services/producto.service";

@Component({
  selector: "app-product-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
          <button class="close-button" (click)="onClose()">
            <span>&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <form #productForm="ngForm">
            <div class="form-group">
              <label for="nombre">Nombre del Producto *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                [(ngModel)]="formData.nombre"
                required
                placeholder="Ej: Miel de Abeja"
                class="form-control"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="peso">Peso *</label>
                <input
                  type="text"
                  id="peso"
                  name="peso"
                  [(ngModel)]="formData.peso"
                  required
                  placeholder="Ej: 500g"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="precio">Precio *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  [(ngModel)]="formData.precio"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ej: 5000"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="img_url">URL de la Imagen *</label>
              <input
                type="text"
                id="img_url"
                name="img_url"
                [(ngModel)]="formData.img_url"
                required
                placeholder="https://ejemplo.com/imagen.jpg"
                class="form-control"
              />
              <small class="form-help">Ingresa la URL completa de la imagen del producto</small>
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                [(ngModel)]="formData.descripcion"
                rows="4"
                placeholder="Describe el producto..."
                class="form-control"
              ></textarea>
            </div>

            @if (formData.img_url) {
              <div class="image-preview">
                <label>Vista Previa:</label>
                <img [src]="formData.img_url" alt="Preview" (error)="onImageError($event)" />
              </div>
            }
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="onClose()">
            Cancelar
          </button>
          <button
            class="btn-primary"
            [disabled]="!productForm.valid || isSaving"
            (click)="onSave()"
          >
            {{ isSaving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
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

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 30px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      color: #4a1d4a;
      font-size: 24px;
      font-weight: 600;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 32px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background-color: #f5f5f5;
      color: #333;
    }

    .modal-body {
      padding: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #4a1d4a;
      box-shadow: 0 0 0 3px rgba(74, 29, 74, 0.1);
    }

    textarea.form-control {
      resize: vertical;
      font-family: inherit;
    }

    .form-help {
      display: block;
      margin-top: 6px;
      color: #666;
      font-size: 12px;
    }

    .image-preview {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f8f8;
      border-radius: 6px;
    }

    .image-preview label {
      margin-bottom: 10px;
    }

    .image-preview img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 6px;
      display: block;
      margin: 0 auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 30px;
      border-top: 1px solid #e0e0e0;
      background-color: #f8f8f8;
      border-radius: 0 0 12px 12px;
    }

    .btn-primary,
    .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #4a1d4a;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #234731;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-secondary {
      background-color: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background-color: #d0d0d0;
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 20px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductModalComponent implements OnInit {
  @Input() product: Producto | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Producto>();

  formData: Producto = {
    nombre: '',
    peso: '',
    precio: 0,
    img_url: '',
    descripcion: ''
  };

  isEditMode: boolean = false;
  isSaving: boolean = false;

  ngOnInit(): void {
    if (this.product) {
      this.isEditMode = true;
      this.formData = { ...this.product };
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.isSaving) return;

    this.isSaving = true;
    this.save.emit(this.formData);

    // Reset saving state after a delay (parent should handle closing)
    setTimeout(() => {
      this.isSaving = false;
    }, 1000);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/img/default-product.jpg';
  }
}
