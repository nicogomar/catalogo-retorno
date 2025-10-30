import { Injectable, signal, computed } from "@angular/core";

export interface CartItem {
  id: number;
  name: string;
  weight: string;
  price: string;
  image: string;
  quantity: number;
  priceNumeric: number; // Numeric value of the price for calculations
}

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  // Computed values based on cart state
  public totalItems = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0),
  );

  public totalPrice = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.priceNumeric * item.quantity,
      0,
    ),
  );

  constructor() {
    // Load cart from localStorage on initialization
    this.loadCart();
  }

  // Get the current cart items
  getCartItems() {
    return this.cartItems;
  }

  // Add a product to the cart
  addToCart(product: any, quantity: number = 1) {
    // Convert price to numeric value, handling both string and number types
    const priceNumeric = this.getPriceNumeric(product.price);

    // Check if product already exists in cart (same id and weight)
    const existingItemIndex = this.cartItems().findIndex(
      (item) => item.id === product.id && item.weight === product.weight,
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const updatedCart = [...this.cartItems()];
      updatedCart[existingItemIndex].quantity += quantity;
      this.cartItems.set(updatedCart);
    } else {
      // Add new item to cart
      this.cartItems.update((items) => [
        ...items,
        {
          id: product.id,
          name: product.name,
          weight: product.weight,
          price:
            typeof product.price === "number"
              ? `$${product.price.toLocaleString("es-AR")}`
              : product.price,
          image: product.image,
          quantity: quantity,
          priceNumeric: priceNumeric,
        },
      ]);
    }

    // Save updated cart to localStorage
    this.saveCart();
  }

  // Update quantity of a product in cart
  updateQuantity(index: number, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(index);
      return;
    }

    const updatedCart = [...this.cartItems()];
    updatedCart[index].quantity = newQuantity;
    this.cartItems.set(updatedCart);
    this.saveCart();
  }

  // Remove a product from cart
  removeItem(index: number) {
    this.cartItems.update((items) => items.filter((_, i) => i !== index));
    this.saveCart();
  }

  // Clear the entire cart
  clearCart() {
    this.cartItems.set([]);
    localStorage.removeItem("cart");
  }

  // Format price for display
  formatPrice(price: number): string {
    return `$${price.toLocaleString("es-AR")}`;
  }

  // Private methods
  private getPriceNumeric(price: string | number): number {
    // Handle when price is already a number
    if (typeof price === "number") {
      return price;
    }

    // Convert string price (e.g., "$2.500") to number
    return parseFloat(
      price.replace(/[$\s]/g, "").replace(/\./g, "").replace(",", "."),
    );
  }

  private saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cartItems()));
  }

  private loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        // Ensure all items have priceNumeric properly set
        const validatedCart = parsedCart.map((item: CartItem) => {
          if (item.priceNumeric === undefined || item.priceNumeric === null) {
            item.priceNumeric = this.getPriceNumeric(item.price);
          }
          return item;
        });

        this.cartItems.set(validatedCart);
      } catch (e) {
        console.error("Failed to parse saved cart:", e);
        localStorage.removeItem("cart");
      }
    }
  }
}
