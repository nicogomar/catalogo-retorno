import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ProductoService, Producto } from "../../services/producto.service";
import {
  PedidoService,
  Pedido,
  EstadoPedido,
} from "../../services/pedido.service";
import { ProductModalComponent } from "../product-modal/product-modal.component";
import { ImageGalleryComponent } from "../image-gallery/image-gallery.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-administracion",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductModalComponent,
    ImageGalleryComponent,
    FormsModule,
  ],
  templateUrl: "./administracion.component.html",
  styles: [
    `
      .admin-container {
        display: flex;
        min-height: 100vh;
        background-color: #f5f5f5;
      }

      /* Sidebar Styles */
      .sidebar {
        width: 260px;
        background-color: #2d5a3d;
        color: white;
        display: flex;
        flex-direction: column;
        position: fixed;
        height: 100vh;
        left: 0;
        top: 0;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
      }

      .sidebar-header {
        padding: 24px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sidebar-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }

      .sidebar-nav {
        flex: 1;
        padding: 20px 0;
        overflow-y: auto;
      }

      .nav-item {
        display: flex;
        align-items: center;
        padding: 14px 20px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
        border-left: 3px solid transparent;
      }

      .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .nav-item.active {
        background-color: rgba(255, 255, 255, 0.15);
        color: white;
        border-left-color: #f8f4ee;
      }

      .nav-item .icon {
        font-size: 20px;
        margin-right: 12px;
        width: 24px;
        text-align: center;
      }

      .nav-item span {
        font-size: 15px;
        font-weight: 500;
      }

      .sidebar-footer {
        padding: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .back-link {
        display: flex;
        align-items: center;
        padding: 12px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.3s ease;
      }

      .back-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .back-link .icon {
        margin-right: 8px;
      }

      /* Main Content Styles */
      .main-content {
        flex: 1;
        margin-left: 260px;
        padding: 30px;
      }

      .content-header {
        margin-bottom: 30px;
      }

      .content-header h1 {
        color: #2d5a3d;
        font-size: 32px;
        margin: 0;
        font-weight: 600;
      }

      .content-body {
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Welcome Card */
      .welcome-card {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }

      .welcome-card h2 {
        color: #2d5a3d;
        margin-top: 0;
        margin-bottom: 12px;
      }

      .welcome-card p {
        color: #666;
        line-height: 1.6;
        margin: 0;
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.3s ease;
      }

      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .stat-icon {
        font-size: 40px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f4ee;
        border-radius: 12px;
      }

      .stat-info h3 {
        margin: 0 0 8px 0;
        color: #666;
        font-size: 14px;
        font-weight: 500;
      }

      .stat-number {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: #2d5a3d;
      }

      /* Section Actions */
      .section-actions {
        margin-bottom: 20px;
      }

      /* Filtros de Estado */
      .filtros-estado {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        flex-wrap: wrap;
      }

      .btn-filtro {
        background-color: #f5f5f5;
        color: #666;
        border: 2px solid transparent;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .btn-filtro:hover {
        background-color: #e8e8e8;
        color: #333;
        transform: translateY(-1px);
      }

      .btn-filtro.active {
        background-color: #2d5a3d;
        color: white;
        border-color: #2d5a3d;
        box-shadow: 0 2px 6px rgba(45, 90, 61, 0.3);
      }

      .btn-primary {
        background-color: #2d5a3d;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .btn-primary:hover {
        background-color: #234731;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      /* Loading and Error States */
      .loading-container,
      .error-container {
        background: white;
        padding: 60px 30px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .loading-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #2d5a3d;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .error-message {
        color: #d32f2f;
        margin-bottom: 20px;
        font-size: 16px;
      }

      .retry-button {
        background-color: #2d5a3d;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .retry-button:hover {
        background-color: #234731;
      }

      /* Products Grid */
      .products-table-container {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .no-products {
        text-align: center;
        padding: 60px 20px;
      }

      .no-products p {
        color: #666;
        font-size: 18px;
        margin-bottom: 20px;
      }

      .products-grid {
        display: grid;
        gap: 20px;
      }

      .product-card-admin {
        display: grid;
        grid-template-columns: 150px 1fr auto;
        gap: 20px;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        transition: all 0.3s ease;
        background: white;
      }

      .product-card-admin:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .product-image-section img {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
      }

      .product-info-section {
        flex: 1;
      }

      .product-title {
        margin: 0 0 12px 0;
        color: #2d5a3d;
        font-size: 20px;
        font-weight: 600;
      }

      .product-details {
        display: flex;
        gap: 20px;
        margin-bottom: 12px;
      }

      .detail-item {
        color: #666;
        font-size: 14px;
      }

      .detail-item strong {
        color: #333;
      }

      .product-description {
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-self: center;
      }

      .btn-edit,
      .btn-delete {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .btn-edit {
        background-color: #4caf50;
        color: white;
      }

      .btn-edit:hover {
        background-color: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .btn-delete {
        background-color: #f44336;
        color: white;
      }

      .btn-delete:hover {
        background-color: #da190b;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      /* Data Card */
      .data-card {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .data-card h3 {
        color: #2d5a3d;
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 22px;
      }

      .data-card p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .placeholder-content {
        background-color: #f8f4ee;
        padding: 40px;
        border-radius: 6px;
        text-align: center;
      }

      .placeholder-content p {
        color: #999;
        font-style: italic;
        margin: 0;
      }

      /* Delete Modal */
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

      .modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }

      .modal-small {
        max-width: 450px;
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
        padding: 24px 30px;
        border-bottom: 1px solid #e0e0e0;
      }

      .modal-header h2 {
        margin: 0;
        color: #2d5a3d;
        font-size: 24px;
        font-weight: 600;
      }

      .modal-body {
        padding: 30px;
      }

      .modal-body p {
        margin: 0 0 15px 0;
        color: #333;
        line-height: 1.6;
      }

      .warning-text {
        color: #d32f2f;
        font-weight: 500;
        font-size: 14px;
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

      .btn-secondary {
        background-color: #e0e0e0;
        color: #333;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-secondary:hover {
        background-color: #d0d0d0;
      }

      /* Responsive Design */
      @media (max-width: 1024px) {
        .product-card-admin {
          grid-template-columns: 120px 1fr;
        }

        .product-actions {
          grid-column: 2;
          flex-direction: row;
          justify-content: flex-end;
        }
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 70px;
        }

        .sidebar-header h2 {
          font-size: 18px;
        }

        .nav-item span,
        .back-link span {
          display: none;
        }

        .nav-item {
          justify-content: center;
        }

        .nav-item .icon {
          margin-right: 0;
        }

        .main-content {
          margin-left: 70px;
          padding: 20px;
        }

        .content-header h1 {
          font-size: 24px;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }

        .product-card-admin {
          grid-template-columns: 1fr;
        }

        .product-image-section img {
          width: 100%;
          height: 200px;
        }

        .product-actions {
          flex-direction: row;
        }
      }

      /* Pedidos Table Styles */
      .pedidos-table-container {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow-x: auto;
      }

      .table-responsive {
        overflow-x: auto;
        max-width: 100%;
      }

      .pedidos-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      .pedidos-table thead {
        background-color: #2d5a3d;
        color: white;
      }

      .pedidos-table th {
        padding: 12px 8px;
        text-align: left;
        font-weight: 600;
        white-space: nowrap;
      }

      .pedidos-table td {
        padding: 12px 8px;
        border-bottom: 1px solid #e0e0e0;
        vertical-align: top;
      }

      .pedidos-table tbody tr:hover {
        background-color: #f9f9f9;
      }

      .td-id {
        font-weight: 600;
        color: #2d5a3d;
      }

      .td-fecha {
        font-size: 13px;
        color: #666;
        min-width: 120px;
      }

      .td-comercio {
        font-weight: 500;
        min-width: 150px;
      }

      .td-localidad,
      .td-telefono {
        min-width: 100px;
      }

      .td-email {
        min-width: 150px;
        font-size: 13px;
      }

      .productos-cell {
        text-align: center;
      }

      .btn-ver-productos {
        padding: 6px 16px;
        background-color: #2d5a3d;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-ver-productos:hover {
        background-color: #1f3d29;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(45, 90, 61, 0.3);
      }

      .btn-ver-productos:active {
        transform: translateY(0);
      }

      .td-total {
        font-size: 15px;
        color: #2d5a3d;
        min-width: 80px;
      }

      .td-estado {
        min-width: 140px;
      }

      .estado-select {
        width: 100%;
        padding: 6px 10px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .estado-select:hover {
        border-color: #2d5a3d;
      }

      .estado-select:focus {
        outline: none;
        border-color: #2d5a3d;
        box-shadow: 0 0 0 3px rgba(45, 90, 61, 0.1);
      }

      .estado-pendiente {
        background-color: #fff3cd;
        color: #856404;
        border-color: #ffc107;
      }

      .estado-aprobado {
        background-color: #d1ecf1;
        color: #0c5460;
        border-color: #17a2b8;
      }

      .estado-en-curso {
        background-color: #d4edda;
        color: #155724;
        border-color: #28a745;
      }

      .estado-finalizado {
        background-color: #e2e3e5;
        color: #383d41;
        border-color: #6c757d;
      }

      .text-muted {
        color: #999;
        font-style: italic;
      }

      @media (max-width: 1200px) {
        .pedidos-table {
          font-size: 12px;
        }

        .pedidos-table th,
        .pedidos-table td {
          padding: 8px 6px;
        }
      }

      @media (max-width: 768px) {
        .pedidos-table-container {
          padding: 10px;
        }

        .pedidos-table {
          font-size: 11px;
        }

        .pedidos-table th,
        .pedidos-table td {
          padding: 6px 4px;
        }

        .estado-select {
          font-size: 11px;
          padding: 4px 6px;
        }
      }

      /* Modal de Productos */
      .productos-modal {
        max-width: 700px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }

      .productos-modal-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .producto-modal-item {
        display: flex;
        gap: 16px;
        padding: 16px;
        background-color: #f9f9f9;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        transition: all 0.2s ease;
      }

      .producto-modal-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-color: #2d5a3d;
      }

      .producto-modal-imagen {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 6px;
        flex-shrink: 0;
      }

      .producto-modal-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .producto-modal-nombre {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .producto-modal-peso {
        font-size: 13px;
        color: #666;
        margin: 0;
      }

      .producto-modal-detalles {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 4px;
      }

      .producto-modal-cantidad,
      .producto-modal-precio-unitario {
        font-size: 14px;
        color: #555;
      }

      .producto-modal-cantidad {
        font-weight: 600;
      }

      .producto-modal-total {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #2d5a3d;
        font-weight: 700;
        padding: 0 16px;
      }

      .modal-footer {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px solid #e0e0e0;
      }

      .total-pedido {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: #2d5a3d;
        color: white;
        border-radius: 8px;
      }

      .total-label {
        font-size: 16px;
        font-weight: 600;
      }

      .total-amount {
        font-size: 20px;
        font-weight: 700;
      }

      .no-products-text {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 40px 20px;
      }

      @media (max-width: 768px) {
        .productos-modal {
          max-width: 95%;
          max-height: 90vh;
        }

        .producto-modal-item {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .producto-modal-imagen {
          width: 100px;
          height: 100px;
        }

        .producto-modal-total {
          padding: 12px 0;
        }

        .btn-ver-productos {
          font-size: 11px;
          padding: 4px 12px;
        }
      }
    `,
  ],
})
export class AdministracionComponent implements OnInit {
  currentSection: string = "inicio";
  productos: Producto[] = [];
  isLoading: boolean = false;
  loadError: string | null = null;

  showProductModal: boolean = false;
  selectedProduct: Producto | null = null;

  showDeleteModal: boolean = false;
  productToDelete: Producto | null = null;

  // Pedidos properties
  pedidos: Pedido[] = [];
  isPedidosLoading: boolean = false;
  pedidosLoadError: string | null = null;
  estadosDisponibles: EstadoPedido[] = [
    "Pendiente",
    "Aprobado",
    "En curso",
    "Finalizado",
  ];
  filtroEstadoPedido: string = "Todos";
  showProductosModal: boolean = false;
  selectedPedidoProductos: any[] = [];

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  changeSection(section: string): void {
    this.currentSection = section;
    if (section === "productos") {
      this.loadProductos();
    } else if (section === "pedidos") {
      this.loadPedidos();
    }
  }

  getSectionTitle(): string {
    const titles: { [key: string]: string } = {
      inicio: "Dashboard",
      productos: "Gestión de Productos",
      mensajes: "Mensajes",
      pedidos: "Pedidos",
      imagenes: "Galería de Imágenes",
    };
    return titles[this.currentSection] || "Administración";
  }

  loadProductos(): void {
    this.isLoading = true;
    this.loadError = null;

    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error al cargar productos:", error);
        this.loadError =
          "No se pudieron cargar los productos. Por favor, intente nuevamente.";
        this.isLoading = false;
      },
    });
  }

  openProductModal(product: Producto | null = null): void {
    this.selectedProduct = product;
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
  }

  editProducto(producto: Producto): void {
    this.openProductModal(producto);
  }

  saveProducto(producto: Producto): void {
    if (producto.id) {
      // Update existing product
      this.productoService.updateProducto(producto.id, producto).subscribe({
        next: () => {
          this.loadProductos();
          this.closeProductModal();
          alert("Producto actualizado exitosamente");
        },
        error: (error) => {
          console.error("Error al actualizar producto:", error);
          alert(
            "Error al actualizar el producto. Por favor, intente nuevamente.",
          );
        },
      });
    } else {
      // Create new product
      this.productoService.createProducto(producto).subscribe({
        next: () => {
          this.loadProductos();
          this.closeProductModal();
          alert("Producto creado exitosamente");
        },
        error: (error) => {
          console.error("Error al crear producto:", error);
          alert("Error al crear el producto. Por favor, intente nuevamente.");
        },
      });
    }
  }

  confirmDelete(producto: Producto): void {
    this.productToDelete = producto;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  deleteProducto(): void {
    if (this.productToDelete && this.productToDelete.id) {
      this.productoService.deleteProducto(this.productToDelete.id).subscribe({
        next: () => {
          this.loadProductos();
          this.closeDeleteModal();
          alert("Producto eliminado exitosamente");
        },
        error: (error) => {
          console.error("Error al eliminar producto:", error);
          alert(
            "Error al eliminar el producto. Por favor, intente nuevamente.",
          );
        },
      });
    }
  }

  onImageError(event: any): void {
    event.target.src = "assets/img/default-product.jpg";
  }

  // Pedidos methods
  loadPedidos(): void {
    this.isPedidosLoading = true;
    this.pedidosLoadError = null;

    this.pedidoService.getPedidos().subscribe({
      next: (pedidos) => {
        // Ordenar por ID descendente (más recientes primero)
        this.pedidos = pedidos.sort((a, b) => {
          const idA = a.id || 0;
          const idB = b.id || 0;
          return idB - idA;
        });
        this.isPedidosLoading = false;
      },
      error: (error) => {
        console.error("Error al cargar pedidos:", error);
        this.pedidosLoadError =
          "No se pudieron cargar los pedidos. Por favor, intente nuevamente.";
        this.isPedidosLoading = false;
      },
    });
  }

  // Obtener pedidos filtrados
  getPedidosFiltrados(): Pedido[] {
    if (this.filtroEstadoPedido === "Todos") {
      return this.pedidos;
    }
    return this.pedidos.filter(
      (pedido) => pedido.estado === this.filtroEstadoPedido,
    );
  }

  // Cambiar filtro de estado
  cambiarFiltroPedido(estado: string): void {
    this.filtroEstadoPedido = estado;
  }

  cambiarEstadoPedido(pedido: Pedido, nuevoEstado: EstadoPedido): void {
    if (!pedido.id) return;

    this.pedidoService.updateEstado(pedido.id, nuevoEstado).subscribe({
      next: (pedidoActualizado) => {
        // Actualizar el pedido en la lista local
        const index = this.pedidos.findIndex((p) => p.id === pedido.id);
        if (index !== -1) {
          this.pedidos[index] = pedidoActualizado;
        }
        alert("Estado actualizado exitosamente");
      },
      error: (error) => {
        console.error("Error al actualizar estado:", error);
        alert("Error al actualizar el estado. Por favor, intente nuevamente.");
      },
    });
  }

  getEstadoClass(estado?: EstadoPedido | null): string {
    switch (estado) {
      case "Pendiente":
        return "estado-pendiente";
      case "Aprobado":
        return "estado-aprobado";
      case "En curso":
        return "estado-en-curso";
      case "Finalizado":
        return "estado-finalizado";
      default:
        return "estado-pendiente";
    }
  }

  formatDate(date?: Date | string): string {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  calcularTotalPedido(pedido: Pedido): number {
    if (!pedido.productos) return 0;
    return pedido.productos.reduce((total, item) => {
      const precio = item.precio || (item as any).priceNumeric || 0;
      return total + precio * item.quantity;
    }, 0);
  }

  verProductosPedido(pedido: Pedido): void {
    this.selectedPedidoProductos = pedido.productos || [];
    this.showProductosModal = true;
  }

  closeProductosModal(): void {
    this.showProductosModal = false;
    this.selectedPedidoProductos = [];
  }

  calcularTotalProductos(productos: any[]): number {
    if (!productos || productos.length === 0) return 0;
    return productos.reduce((total, item) => {
      const precio = item.precio || item.priceNumeric || 0;
      const quantity = item.quantity || 0;
      return total + precio * quantity;
    }, 0);
  }
}
