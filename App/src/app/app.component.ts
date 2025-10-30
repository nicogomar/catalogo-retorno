import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, RouterOutlet, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
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

  toggleCart(): void {
    if (this.cartComponent) {
      this.cartComponent.toggle();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
