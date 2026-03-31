import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
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
import { CategoryDrawerComponent, Category } from "./components/category-drawer/category-drawer.component";
import { BannerComponent } from "./components/banner/banner.component";
import { AppConfig, getTitle } from "./config";
import { HomepageTextos } from "./personalizacion";

interface Product {
  id: number;
  name: string;
  weight: string;
  price: string;
  image: string | string[];
  detailImage?: string | string[];
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
    CategoryDrawerComponent,
    BannerComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  title = "App";
  @ViewChild(CartComponent) cartComponent!: CartComponent;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = true;
  loadError: string | null = null;
  searchTerm: string = '';
  selectedCategory: string | null = null;
  isDrawerOpen: boolean = false;

  // Scroll hide logic
  isSearchVisible: boolean = true;
  private lastScrollTop: number = 0;

  selectedProduct: Product | null = null;

  // Configuración de la aplicación
  appConfig = AppConfig;
  appTitle = getTitle('titles.mainTitle');
  appSubtitle = getTitle('titles.subtitle');
  appLogoAlt = getTitle('titles.logoAlt');

  // Textos centralizados
  textos = HomepageTextos;

  constructor(
    public cartService: CartService,
    public router: Router,
    private productoService: ProductoService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Hide search when scrolling down past header height (100px), show when scrolling up
    if (currentScroll > this.lastScrollTop && currentScroll > 100) {
      // Scrolling down
      this.isSearchVisible = false;
    } else {
      // Scrolling up
      this.isSearchVisible = true;
    }
    
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
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
          image: producto.img_url || "assets/images/default-product.svg",
          detailImage: producto.img_url || "assets/images/default-product.svg",
          description: producto.descripcion || "Sin descripción disponible",
          categoria: producto.categoria || null,
        }));
        this.filteredProducts = [...this.products];
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

  // Get banner products (products with category "Banner")
  getBannerProducts(): Product[] {
    const banners = this.products.filter(product => product.categoria === 'Banner');
    console.log('Banner products found:', banners);
    console.log('All products:', this.products);
    return banners;
  }

  // Get non-banner products
  getNonBannerProducts(): Product[] {
    return this.products.filter(product => product.categoria !== 'Banner');
  }

  // Handle banner click
  onBannerSelect(productId: number): void {
    this.onProductSelect(productId);
  }

  // Group products by category (excluding banners)
  getProductsByCategory(): { category: string | null; products: Product[] }[] {
    const grouped = new Map<string | null, Product[]>();
    
    // Use filtered products for display
    const productsToUse = this.getFilteredProducts();
    
    // Group products by category
    productsToUse.forEach(product => {
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

  // Get categories with counts
  getCategories(): Category[] {
    const categoryMap = new Map<string, number>();
    
    this.products.forEach(product => {
      const category = product.categoria || 'Sin categoría';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        // Put "Sin categoría" at the end
        if (a.name === 'Sin categoría') return 1;
        if (b.name === 'Sin categoría') return -1;
        return a.name.localeCompare(b.name);
      });
  }

  // Get total product count
  getTotalProductCount(): number {
    return this.products.length;
  }

  // Get filtered products based on search and category (excluding banners)
  getFilteredProducts(): Product[] {
    let products = this.getNonBannerProducts(); // Exclude banners from normal filtering

    // Filter by category
    if (this.selectedCategory) {
      products = products.filter(product => {
        if (this.selectedCategory === 'Sin categoría') {
          // Products without category have null/undefined/empty categoria
          return !product.categoria || product.categoria === '';
        }
        return product.categoria === this.selectedCategory;
      });
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      products = products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.categoria && product.categoria.toLowerCase().includes(term))
      );
    }

    return products;
  }

  // Filter products based on search term
  onSearchChange(): void {
    // The filtering is now handled by getFilteredProducts()
    // This method is kept for compatibility but no longer needs to update filteredProducts
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  // Drawer methods
  openDrawer(): void {
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  onCategorySelected(category: string | null): void {
    this.selectedCategory = category;
    this.closeDrawer();
  }

  openMaps(): void {
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Mundo+Telas+Dr+Ivo+Ferreira+264+Tacuarembó';
    window.open(mapsUrl, '_blank');
  }

  logout(): void {
    this.authService.logout();
  }
}
