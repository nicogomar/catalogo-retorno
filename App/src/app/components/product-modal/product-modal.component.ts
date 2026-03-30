import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Producto } from "../../services/producto.service";
import { CategoriaService, Categoria } from "../../services/categoria.service";
import { AdministracionTextos, MensajesSistema } from "../../personalizacion";

@Component({
  selector: "app-product-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? textos.productos.modal.tituloEditar : textos.productos.botonNuevo }}</h2>
          <button class="close-button" (click)="onClose()">
            <span>&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <form #productForm="ngForm">
            <div class="form-group">
              <label for="nombre">{{ textos.productos.tabla.encabezados.nombre }} *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                [(ngModel)]="formData.nombre"
                required
                [placeholder]="textos.productos.filtros.nombre.placeholder"
                class="form-control"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="peso">{{ textos.productos.tabla.encabezados.peso }} *</label>
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
                <label for="precio">{{ textos.productos.tabla.encabezados.precio }} *</label>
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
              <label for="categoria">{{ textos.categorias.tabla.encabezados.nombre }}</label>
              <select
                id="categoria"
                name="categoria"
                [(ngModel)]="formData.categoria"
                class="form-control"
              >
                <option value="">{{ textos.categorias.modal.campos.nombre.placeholder }}</option>
                @for (categoria of categorias; track categoria.id) {
                  <option [value]="categoria.nombre">{{ categoria.nombre }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>{{ textos.imagenes.tabla.encabezados.nombre }} *</label>
              <div class="image-inputs-header">
                <p class="input-instruction">{{ textos.imagenes.dragDrop.tiposPermitidos }}</p>
              </div>
              <div class="image-urls-container">
                @for (imageUrl of imageUrls; track imageUrl; let i = $index) {
                  <div class="image-url-row">
                    <div class="input-number">{{ i + 1 }}</div>
                    <input
                      type="text"
                      [id]="'img_url_' + i"
                      [name]="'img_url_' + i"
                      [(ngModel)]="imageUrls[i]"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      class="form-control image-input"
                    />
                    @if (imageUrls.length > 1) {
                      <button 
                        type="button" 
                        class="btn-remove-image" 
                        (click)="removeImageUrl(i)"
                        [title]="textos.imagenes.tabla.botones.eliminar"
                      >
                        ×
                      </button>
                    }
                  </div>
                }
              </div>
              <div class="image-actions">
                <button 
                  type="button" 
                  class="btn-add-image" 
                  (click)="addImageUrl()"
                >
                  + {{ textos.imagenes.botonSubir }}
                </button>
              </div>
              <small class="form-help">{{ textos.imagenes.dragDrop.tiposPermitidos }}</small>
            </div>

            @if (imageUrls.length > 0 && imageUrls[0]) {
              <div class="image-preview">
                <label>{{ textos.imagenes.tabla.encabezados.preview }}:</label>
                <div class="preview-grid">
                  @for (url of imageUrls; track url; let i = $index) {
                    @if (url) {
                      <div class="preview-item">
                        <img [src]="url" [alt]="'Preview ' + (i + 1)" (error)="onImageError($event)" />
                        <button 
                          type="button" 
                          class="btn-remove-preview" 
                          (click)="removeImageUrl(i)"
                          [title]="textos.imagenes.tabla.botones.eliminar"
                        >
                          ×
                        </button>
                      </div>
                    }
                  }
                </div>
              </div>
            }

            <div class="form-group">
              <label for="descripcion">{{ textos.categorias.tabla.encabezados.nombre }}</label>
              <textarea
                id="descripcion"
                name="descripcion"
                [(ngModel)]="formData.descripcion"
                rows="4"
                                placeholder="Describe el producto..."
                class="form-control"
              ></textarea>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="onClose()">
            {{ textos.categorias.modal.botones.cancelar }}
          </button>
          <button
            class="btn-primary"
            [disabled]="!hasValidImages() || isSaving"
            (click)="onSave()"
          >
            {{ isSaving ? mensajes.cargando.guardando : (isEditMode ? textos.categorias.tabla.botones.editar : textos.categorias.modal.botones.guardar) }}
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

    /* Multiple Images Styles */
    .image-inputs-header {
      margin-bottom: 15px;
    }

    .input-instruction {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .image-urls-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 15px;
    }

    .image-url-row {
      display: flex;
      gap: 10px;
      align-items: center;
      position: relative;
    }

    .input-number {
      background-color: #4a1d4a;
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .image-input {
      flex: 1;
    }

    .btn-remove-image {
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .btn-remove-image:hover {
      background-color: #da190b;
      transform: scale(1.05);
    }

    .image-actions {
      margin-bottom: 10px;
    }

    .btn-add-image {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-add-image:hover {
      background-color: #45a049;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }

    .preview-item {
      position: relative;
      border-radius: 6px;
      overflow: hidden;
    }

    .preview-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }

    .btn-remove-preview {
      position: absolute;
      top: 5px;
      right: 5px;
      background-color: rgba(244, 67, 54, 0.9);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-remove-preview:hover {
      background-color: rgba(218, 25, 11, 0.9);
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

  // Textos centralizados
  textos = AdministracionTextos;
  mensajes = MensajesSistema;

  formData: Producto = {
    nombre: '',
    peso: '',
    precio: 0,
    img_url: '',
    descripcion: '',
    categoria: ''
  };

  imageUrls: string[] = [''];
  categorias: Categoria[] = [];
  isEditMode: boolean = false;
  isSaving: boolean = false;

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    if (this.product) {
      this.isEditMode = true;
      this.formData = { ...this.product };
      
      // Convertir string de URLs separado por comas a array de campos individuales
      if (this.product.img_url) {
        if (typeof this.product.img_url === 'string') {
          // Separar por comas y crear campos individuales
          const urls = this.product.img_url.split(',').map(url => url.trim()).filter(url => url !== '');
          this.imageUrls = urls.length > 0 ? urls : [''];
        } else if (Array.isArray(this.product.img_url)) {
          // Si ya es un array, usarlo directamente
          this.imageUrls = this.product.img_url.length > 0 ? [...this.product.img_url] : [''];
        }
      } else {
        // Si no hay imágenes, empezar con un campo vacío
        this.imageUrls = [''];
      }
    } else {
      // Para nuevo producto, empezar con un campo vacío
      this.imageUrls = [''];
    }
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Error loading categorias:', error);
      }
    });
  }

  addImageUrl(): void {
    this.imageUrls.push('');
  }

  removeImageUrl(index: number): void {
    this.imageUrls.splice(index, 1);
    // Asegurar que siempre haya al menos un campo
    if (this.imageUrls.length === 0) {
      this.imageUrls.push('');
    }
  }

  hasValidImages(): boolean {
    // Verificar que haya al menos una URL válida
    const validUrls = this.imageUrls.filter(url => url && url.trim() !== '');
    const hasImages = validUrls.length > 0;
    const hasName = !!this.formData.nombre;
    const hasPrice = this.formData.precio !== null && this.formData.precio !== undefined && this.formData.precio > 0;
    const hasWeight = !!this.formData.peso;
    
    return hasImages && hasName && hasPrice && hasWeight;
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.isSaving) return;

    // Filtrar URLs vacías y unirlas con comas para la base de datos
    const validUrls = this.imageUrls.filter(url => url && url.trim() !== '');
    this.formData.img_url = validUrls.length > 0 ? validUrls.join(',') : '';

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
