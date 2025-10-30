import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, RouterOutlet, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CardComponent } from "./components/card.component";
import { ProductDescriptionComponent } from "./components/product-description/product-description.component";
import { CartComponent } from "./components/cart/cart.component";
import { CartService } from "./services/cart.service";
import { AlertComponent } from "./components/alert/alert.component";
import { ProductoService, Producto } from "./services/producto.service";
import { AuthService } from "./services/auth.service";

interface Product {
  id: number;
  name: string;
  weight: string;
  price: string;
  image: string;
  detailImage?: string;
  description?: string;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    CardComponent,
    ProductDescriptionComponent,
    CartComponent,
    AlertComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  title = "App";
  @ViewChild(CartComponent) cartComponent!: CartComponent;

  products: Product[] = [];
  isLoading: boolean = true;
  loadError: string | null = null;

  selectedProduct: Product | null = null;

  // Filtros de búsqueda para productos
  filtroNombreProducto: string = "";
  filtroPrecioMin: string = "";
  filtroPrecioMax: string = "";

  constructor(
    public cartService: CartService,
    public router: Router,
    private productoService: ProductoService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.isLoading = true;
    this.loadError = null;

    this.productoService.getProductos().subscribe({
      next: (productos: Producto[]) => {
        this.products = productos.map((producto) => ({
          id: producto.id || 0,
          name: producto.nombre || "Producto sin nombre",
          weight: producto.peso || "N/A",
          price: producto.precio
            ? `$${producto.precio.toLocaleString("es-AR")}`
            : "Consultar",
          image: producto.img_url || "assets/img/default-product.jpg",
          detailImage: producto.img_url || "assets/img/default-product.jpg",
          description: producto.descripcion || "Sin descripción disponible",
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error al cargar productos:", error);
        this.isLoading = false;
        this.loadError =
          "No se pudieron cargar los productos. Por favor, intente nuevamente más tarde.";
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onProductSelect(productId: number): void {
    console.log("Product selected with ID:", productId);
    const product = this.products.find((p) => p.id === productId);
    console.log("Found product:", product);
    this.selectedProduct = product ?? null;
    console.log("Selected product set to:", this.selectedProduct);
  }

  // Obtener productos filtrados
  getProductosFiltrados(): Product[] {
    let productosFiltrados = this.products;

    // Filtrar por nombre
    if (this.filtroNombreProducto.trim() !== "") {
      const nombreLower = this.filtroNombreProducto.trim().toLowerCase();
      productosFiltrados = productosFiltrados.filter((producto) =>
        producto.name.toLowerCase().includes(nombreLower),
      );
    }

    // Filtrar por precio mínimo
    if (this.filtroPrecioMin.trim() !== "") {
      const precioMin = parseFloat(this.filtroPrecioMin);
      if (!isNaN(precioMin)) {
        productosFiltrados = productosFiltrados.filter((producto) => {
          const precio = this.extractPrecioNumerico(producto.price);
          return precio >= precioMin;
        });
      }
    }

    // Filtrar por precio máximo
    if (this.filtroPrecioMax.trim() !== "") {
      const precioMax = parseFloat(this.filtroPrecioMax);
      if (!isNaN(precioMax)) {
        productosFiltrados = productosFiltrados.filter((producto) => {
          const precio = this.extractPrecioNumerico(producto.price);
          return precio <= precioMax;
        });
      }
    }

    return productosFiltrados;
  }

  // Extraer precio numérico de la cadena
  private extractPrecioNumerico(priceString: string): number {
    const match = priceString.match(/[\d,.]+/);
    if (match) {
      return parseFloat(match[0].replace(/\./g, "").replace(",", "."));
    }
    return 0;
  }

  // Limpiar filtros de productos
  limpiarFiltrosProductos(): void {
    this.filtroNombreProducto = "";
    this.filtroPrecioMin = "";
    this.filtroPrecioMax = "";
  }

  toggleCart(): void {
    if (this.cartComponent) {
      this.cartComponent.toggle();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
