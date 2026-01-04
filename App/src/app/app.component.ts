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
import { WhatsappFloatComponent } from "./components/whatsapp-float/whatsapp-float.component";
import { AppConfig, getTitle } from "./config";

interface Product {
  id: number;
  name: string;
  weight: string;
  price: string;
  image: string;
  detailImage?: string;
  description?: string;
  categoria?: string | null;
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
    WhatsappFloatComponent,
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

  // Configuración de la aplicación
  appConfig = AppConfig;
  appTitle = getTitle('titles.mainTitle');
  appSubtitle = getTitle('titles.subtitle');
  appLogoAlt = getTitle('titles.logoAlt');

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

    this.productoService.getProductosOrderedByCategoriaAndNombre().subscribe({
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
          categoria: producto.categoria || null,
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

  // Group products by category
  getProductsByCategory(): { category: string | null; products: Product[] }[] {
    const grouped = new Map<string | null, Product[]>();
    
    // Group products by category
    this.products.forEach(product => {
      const category = product.categoria || 'Sin categoría';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(product);
    });

    // Convert to array and sort by category name
    return Array.from(grouped.entries())
      .map(([category, products]) => ({ category, products }))
      .sort((a, b) => {
        // Put "Sin categoría" at the end
        if (a.category === 'Sin categoría') return 1;
        if (b.category === 'Sin categoría') return -1;
        return a.category!.localeCompare(b.category!);
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
