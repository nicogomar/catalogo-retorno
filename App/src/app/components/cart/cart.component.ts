import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CartService, CartItem } from "../../services/cart.service";
import { CustomerModalComponent } from "../customer-modal/customer-modal.component";
import { AlertService } from "../../services/alert.service";
import { AlertComponent } from "../alert/alert.component";
import { PedidoService, NuevoPedido } from "../../services/pedido.service";
import { PagoService, NuevoPago, PagoItem } from "../../services/pago.service";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerModalComponent, AlertComponent],
  template: `
    <div class="cart-modal" [class.is-open]="isOpen">
      <div class="cart-container">
        <div class="cart-header">
          <h2>Carrito de Compras</h2>
          <button class="close-button" (click)="close()">×</button>
        </div>

        <app-alert></app-alert>

        <div class="cart-content">
          @if (cartService.getCartItems()().length === 0) {
            <div class="empty-cart">
              <p>Su carrito está vacío</p>
            </div>
          } @else {
            <div class="cart-items">
              @for (
                item of cartService.getCartItems()();
                track item;
                let i = $index
              ) {
                <div class="cart-item">
                  <img
                    [src]="item.image"
                    [alt]="item.name"
                    class="item-image"
                  />
                  <div class="item-details">
                    <h3>{{ item.name }}</h3>
                    <p class="item-weight">{{ item.weight }}</p>
                    <p class="item-price">{{ item.price }}</p>
                  </div>
                  <div class="item-quantity">
                    <button
                      class="quantity-btn"
                      (click)="updateQuantity(i, item.quantity - 1)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      [ngModel]="item.quantity"
                      (ngModelChange)="updateQuantity(i, $event)"
                      min="1"
                      class="quantity-input"
                    />
                    <button
                      class="quantity-btn"
                      (click)="updateQuantity(i, item.quantity + 1)"
                    >
                      +
                    </button>
                  </div>
                  <button class="remove-btn" (click)="removeItem(i)">×</button>
                </div>
              }
            </div>

            <div class="cart-summary">
              <div class="cart-total">
                <span>Total:</span>
                <span>{{
                  cartService.formatPrice(cartService.totalPrice())
                }}</span>
              </div>
              <button class="checkout-btn" (click)="checkout()">
                Finalizar Compra
              </button>
            </div>

            <!-- Customer Information Modal -->
            <app-customer-modal
              [isOpen]="isCustomerModalOpen"
              (closeEvent)="closeCustomerModal()"
              (orderSubmitted)="handleOrderSubmission($event)"
            >
            </app-customer-modal>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cart-modal {
        position: fixed;
        top: 0;
        right: -100%;
        width: 100%;
        max-width: 400px;
        height: 100vh;
        height: 100dvh;
        background-color: #f8f4ee;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
        transition: right 0.3s ease-in-out;
        z-index: 1001;
        overflow: hidden;
        box-sizing: border-box;
      }

      .cart-modal.is-open {
        right: 0;
      }

      .cart-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #eaeaea;
      }

      .cart-header h2 {
        margin: 0;
        font-size: 20px;
        color: #4a1d4a;
      }

      .close-button {
        background: transparent;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }

      .cart-content {
        flex-grow: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;
        width: 100%;
        box-sizing: border-box;
        max-width: 100%;
        overflow-y: auto;
      }

      .empty-cart {
        text-align: center;
        margin-top: 40px;
        color: #666;
      }

      .cart-items {
        flex-grow: 1;
        margin-bottom: 20px;
        overflow-y: auto;
        max-height: calc(100vh - 280px);
      }

      .cart-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #eaeaea;
        position: relative;
        flex-wrap: wrap;
        width: 100%;
        box-sizing: border-box;
      }

      .item-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 10px;
      }

      .item-details {
        flex-grow: 1;
        min-width: 0;
        max-width: calc(100% - 130px);
      }

      .item-details h3 {
        margin: 0 0 5px;
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-weight {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .item-price {
        margin: 5px 0 0;
        font-weight: 500;
        color: #4a1d4a;
      }

      .item-quantity {
        display: flex;
        align-items: center;
        margin: 0 10px 0 auto;
      }

      .quantity-btn {
        width: 22px;
        height: 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #eaeaea;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
      }

      .quantity-btn:hover {
        background-color: #ddd;
      }

      .quantity-input {
        width: 30px;
        text-align: center;
        margin: 0 3px;
        border: 1px solid #eaeaea;
        border-radius: 4px;
        padding: 2px 0;
      }

      .remove-btn {
        background: transparent;
        border: none;
        color: #999;
        font-size: 18px;
        cursor: pointer;
        padding: 0 5px;
      }

      .remove-btn:hover {
        color: #d9534f;
      }

      .cart-summary {
        margin-top: auto;
        border-top: 1px solid #eaeaea;
        padding: 20px;
        padding-bottom: max(20px, env(safe-area-inset-bottom));
        background-color: #f8f4ee;
        position: sticky;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      }

      .cart-total {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        font-size: 18px;
        font-weight: 500;
      }

      .checkout-btn {
        width: 100%;
        padding: 12px;
        background-color: #4a1d4a;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .checkout-btn:hover {
        background-color: #234731;
      }

      @media (max-width: 480px) {
        .cart-modal {
          max-width: 100%;
          right: -100%;
          width: 100vw;
        }

        .cart-modal.is-open {
          right: 0;
        }

        .cart-container {
          width: 100%;
          padding: 0;
        }

        .cart-content {
          padding: 12px;
          width: 100%;
          overflow-y: auto;
          height: calc(100dvh - 60px);
        }

        .cart-header {
          padding: 12px 15px;
          width: 100%;
          box-sizing: border-box;
        }

        .cart-item {
          padding: 12px 0;
        }

        .item-image {
          width: 40px;
          height: 40px;
          margin-right: 8px;
        }

        .item-details {
          max-width: calc(100% - 110px);
        }

        .item-details h3 {
          font-size: 14px;
        }

        .item-weight,
        .item-price {
          font-size: 12px;
        }

        .cart-items {
          max-height: calc(100dvh - 280px);
          overflow-y: auto;
          margin-bottom: 10px;
          padding-bottom: 20px;
        }

        .item-quantity {
          margin: 0 2px 0 auto;
        }

        .quantity-btn {
          width: 20px;
          height: 20px;
          font-size: 14px;
        }

        .quantity-input {
          width: 25px;
          font-size: 12px;
          padding: 1px 0;
          margin: 0 2px;
        }

        .remove-btn {
          font-size: 16px;
          padding: 0 2px;
        }

        .empty-cart {
          width: 100%;
          text-align: center;
          padding: 40px 0;
        }

        .cart-summary {
          padding: 18px 15px;
          padding-bottom: max(25px, calc(20px + env(safe-area-inset-bottom)));
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: #f8f4ee;
          z-index: 1000;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
          width: 100%;
          box-sizing: border-box;
        }

        .cart-total {
          font-size: 16px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .checkout-btn {
          padding: 16px 12px;
          font-size: 17px;
          font-weight: 600;
          min-height: 52px;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(74, 29, 74, 0.4);
          margin-bottom: 8px;
        }

        .checkout-btn:active {
          transform: scale(0.98);
          box-shadow: 0 1px 4px rgba(74, 29, 74, 0.3);
        }
      }
    `,
  ],
})
export class CartComponent {
  isOpen = false;
  isCustomerModalOpen = false;

  constructor(
    public cartService: CartService,
    private alertService: AlertService,
    private pedidoService: PedidoService,
    private pagoService: PagoService,
  ) {}

  open() {
    this.isOpen = true;
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  close() {
    this.isOpen = false;
    document.body.style.overflow = ""; // Restore scrolling
  }

  updateQuantity(index: number, quantity: number) {
    if (quantity > 0) {
      this.cartService.updateQuantity(index, quantity);
    } else {
      this.removeItem(index);
    }
  }

  removeItem(index: number) {
    this.cartService.removeItem(index);
  }

  checkout() {
    // Open customer information modal
    this.isCustomerModalOpen = true;
  }

  closeCustomerModal() {
    this.isCustomerModalOpen = false;
  }

  handleOrderSubmission(orderData: any) {
    // Transform cart items to match ItemPedido interface
    const productos = orderData.items.map((item: CartItem) => ({
      id: item.id,
      nombre: item.name,
      precio: item.priceNumeric,
      quantity: item.quantity,
      peso: item.weight,
      img_url: item.image,
    }));

    // Get payment method from order data
    const paymentMethod = orderData.customer.paymentMethod || "contra_entrega";

    // Prepare the order data for the database
    const pedidoData: NuevoPedido = {
      nombre_comercio: orderData.customer.name,
      telefóno: orderData.customer.phone,
      email: orderData.customer.email,
      localidad: orderData.customer.location,
      productos: productos, // Transformed items stored as JSON
      detalles: orderData.customer.details, // Add the details field
      estado: "COBRAR", // Set default status to COBRAR
      metodo_pago: paymentMethod, // Add payment method
    };

    // Mostrar mensaje de procesamiento según el método de pago
    if (paymentMethod === "mercadopago") {
      this.alertService.showSuccess(
        "Procesando su pedido y generando link de pago...",
      );
    } else {
      this.alertService.showSuccess("Procesando su pedido...");
    }

    // Save the order to the database
    this.pedidoService.createPedido(pedidoData).subscribe({
      next: (pedido) => {
        console.log("Pedido guardado exitosamente:", pedido);

        // If payment method is MercadoPago, create payment preference
        if (paymentMethod === "mercadopago") {
          // Transform cart items to MercadoPago format
          const pagoItems: PagoItem[] = orderData.items.map(
            (item: CartItem) => ({
              title: item.name,
              description: `${item.weight} - ${item.name}`,
              picture_url: item.image,
              quantity: item.quantity,
              unit_price: item.priceNumeric,
              currency_id: "ARS",
            }),
          );

          // Prepare payment data
          const pagoData: NuevoPago = {
            pedido_id: pedido.id!,
            items: pagoItems,
            payer: {
              name: orderData.customer.name.split(" ")[0],
              surname:
                orderData.customer.name.split(" ").slice(1).join(" ") ||
                orderData.customer.name,
              email: orderData.customer.email,
              phone: {
                area_code: orderData.customer.phone.substring(0, 3),
                number: orderData.customer.phone.substring(3),
              },
            },
            external_reference: `PEDIDO-${pedido.id}-${Date.now()}`,
          };

          // Create payment and redirect
          this.pagoService.createPago(pagoData).subscribe({
            next: (pagoResponse) => {
              console.log("Pago creado exitosamente:", pagoResponse);

              // Clear cart
              this.cartService.clearCart();

              // Close modals
              this.closeCustomerModal();
              this.close();

              // Show success message
              this.alertService.showSuccess(
                "¡Pedido creado! Redirigiendo a MercadoPago para completar el pago...",
              );

              // Redirect to MercadoPago after a short delay
              setTimeout(() => {
                this.pagoService.redirectToMercadoPago(pagoResponse.init_point);
              }, 1500);
            },
            error: (error) => {
              console.error("Error al crear el pago:", error);
              this.alertService.showError(
                `Hubo un error al generar el link de pago: ${error.message || "Error desconocido"}. Por favor, inténtelo de nuevo.`,
              );
            },
          });
        } else {
          // Payment method is "contra_entrega" - no MercadoPago redirect
          // Clear cart
          this.cartService.clearCart();

          // Close modals
          this.closeCustomerModal();
          this.close();

          // Show success message
          this.alertService.showSuccess(
            "¡Pedido creado exitosamente! Recibirás una confirmación por email. El pago se realizará contra entrega.",
          );
        }
      },
      error: (error) => {
        console.error("Error al procesar el pedido:", error);
        this.alertService.showError(
          `Hubo un error al procesar su pedido: ${error.message || "Error desconocido"}. Por favor, inténtelo de nuevo.`,
        );
      },
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
