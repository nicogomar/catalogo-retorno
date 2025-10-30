import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CartService } from "../../services/cart.service";

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
  selector: "app-product-description",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header with title and close button -->
        <div class="modal-header">
          <h2 class="product-title">{{ product?.name }}</h2>
          <button class="close-button" (click)="closeModal()">
            <span>×</span>
          </button>
        </div>

        <!-- Product image -->
        <div class="product-image-container">
          <img
            [src]="product?.detailImage || product?.image"
            [alt]="product?.name"
            class="product-detail-image"
          />
        </div>

        <!-- Product info section -->
        <div class="product-info-row">
          <div class="info-item">
            <span class="info-label">Peso: </span>
            <span class="info-value">{{ product?.weight }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Precio: </span>
            <span class="info-value">{{ product?.price }}</span>
          </div>
        </div>

        <!-- Description section -->
        <div class="product-description-section">
          <h3 class="section-title">Descripción</h3>
          <p class="description-text">{{ product?.description }}</p>
        </div>

        <!-- Quantity and add to cart -->
        <div class="cart-actions">
          <div class="quantity-selector">
            <button class="quantity-btn" (click)="decreaseQuantity()">-</button>
            <input
              type="number"
              [(ngModel)]="quantity"
              min="1"
              class="quantity-input"
            />
            <button class="quantity-btn" (click)="increaseQuantity()">+</button>
          </div>
          <button class="add-to-cart-btn" (click)="addToCart()">
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Modal backdrop - full screen with semi-transparent background */
      .modal-backdrop {
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
      }

      /* Modal container */
      .modal-container {
        background-color: #f8f4ee;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
      }

      /* Modal header */
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #eaeaea;
      }

      .product-title {
        font-size: 22px;
        font-weight: 600;
        color: #222;
        margin: 0;
      }

      .close-button {
        background: transparent;
        border: none;
        font-size: 28px;
        line-height: 1;
        cursor: pointer;
        color: #666;
      }

      .close-button:hover {
        color: #333;
      }

      /* Product image styles */
      .product-image-container {
        width: 100%;
        height: 240px;
        overflow: hidden;
      }

      .product-detail-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* Product info row */
      .product-info-row {
        display: flex;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #eaeaea;
      }

      .info-item {
        display: flex;
        gap: 4px;
      }

      .info-label {
        font-weight: 500;
        color: #555;
      }

      .info-value {
        font-weight: 600;
        color: #222;
      }

      /* Description section */
      .product-description-section {
        padding: 16px 20px 24px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0 0 12px 0;
      }

      .description-text {
        margin: 0;
        line-height: 1.5;
        color: #555;
      }

      /* Cart Actions */
      .cart-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 16px 20px 24px;
        border-top: 1px solid #eaeaea;
      }

      .quantity-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      }

      .quantity-btn {
        width: 36px;
        height: 36px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .quantity-btn:hover {
        background-color: #e0e0e0;
      }

      .quantity-input {
        width: 60px;
        text-align: center;
        margin: 0 10px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }

      .add-to-cart-btn {
        background-color: #2d5a3d;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 12px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        width: 100%;
      }

      .add-to-cart-btn:hover {
        background-color: #234731;
      }

      /* Responsive adjustments */
      @media (max-width: 480px) {
        .modal-container {
          width: 95%;
        }

        .product-title {
          font-size: 20px;
        }

        .product-image-container {
          height: 200px;
        }
      }
    `,
  ],
})
export class ProductDescriptionComponent {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  quantity: number = 1;

  constructor(private cartService: CartService) {}

  closeModal(): void {
    this.close.emit();
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product && this.quantity > 0) {
      this.cartService.addToCart(this.product, this.quantity);
      this.close.emit(); // Close the modal after adding to cart
    }
  }
}
