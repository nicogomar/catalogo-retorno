import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CartService, CartItem } from "../../services/cart.service";
import { CustomerModalComponent } from "../customer-modal/customer-modal.component";
import { AlertService } from "../../services/alert.service";
import { AlertComponent } from "../alert/alert.component";
import { PedidoService, NuevoPedido } from "../../services/pedido.service";
import { PagoService } from "../../services/pago.service";
import { PaymentConfirmationModalComponent } from "../payment-confirmation-modal/payment-confirmation-modal.component";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomerModalComponent,
    AlertComponent,
    PaymentConfirmationModalComponent,
  ],
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

            <!-- Payment Confirmation Modal -->
            <app-payment-confirmation-modal
              [isOpen]="isPaymentConfirmationModalOpen"
              (confirm)="proceedToMercadoPago()"
              (changePaymentMethod)="changeToContraEntrega()"
              (closeEvent)="closePaymentConfirmationModal()"
            >
            </app-payment-confirmation-modal>
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
  isPaymentConfirmationModalOpen = false;

  // Store payment data temporarily
  private tempPaymentData: any = null;
  private tempPedidoData: any = null;

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
    console.log("Processing order submission:", orderData);

    // Transform cart items to match ItemPedido interface
    const productos = orderData.items.map((item: CartItem) => ({
      id: item.id,
      nombre: item.name,
      precio: item.priceNumeric,
      quantity: item.quantity,
      peso: item.weight,
      img_url: item.image,
    }));

    // Prepare the order data for the database
    // Note: metodo_pago will be set AFTER user confirms in the modal
    const pedidoData: NuevoPedido = {
      nombre_comercio: orderData.customer.name,
      telefóno: orderData.customer.phone,
      email: orderData.customer.email,
      localidad: orderData.customer.location,
      productos: productos, // Transformed items stored as JSON
      detalles: orderData.customer.details, // Add the details field
      estado: "Pendiente", // Set default status to Pendiente
      metodo_pago: "contra_entrega", // Default, will be updated based on user choice
    };

    // Save the order to the database FIRST, then ask user how they want to pay
    this.pedidoService.createPedido(pedidoData).subscribe({
      next: (pedido) => {
        console.log("Pedido guardado exitosamente:", pedido);

        // Store pedido temporarily
        this.tempPedidoData = pedido;

        // Try to create MercadoPago preference proactively
        // (in case user chooses to pay online)
        this.createMercadoPagoPreference(pedido, orderData);
      },
      error: (error) => {
        console.error("Error al guardar el pedido:", error);
        this.alertService.showError(
          `Hubo un error al procesar su pedido: ${error.message || "Error desconocido"}. Por favor, inténtelo de nuevo.`,
        );
      },
    });
  }

  createMercadoPagoPreference(pedido: any, orderData: any) {
    // Transform items to MercadoPago format
    const items = orderData.items.map((item: CartItem) => ({
      title: item.name,
      description: `${item.weight} - ${item.name}`,
      picture_url: item.image,
      quantity: item.quantity,
      currency_id: "ARS",
      unit_price: item.priceNumeric,
    }));

    // Prepare payer information
    const payer = {
      name: orderData.customer.name.split(" ")[0] || orderData.customer.name,
      surname: orderData.customer.name.split(" ").slice(1).join(" ") || "",
      email: orderData.customer.email,
      phone: {
        area_code: orderData.customer.phone.substring(0, 3),
        number: orderData.customer.phone.substring(3),
      },
    };

    // Create payment preference
    const pagoData = {
      pedido_id: pedido.id,
      items: items,
      payer: payer,
    };

    this.pagoService.createPago(pagoData).subscribe({
      next: (response: any) => {
        console.log("Pago creado exitosamente:", response);

        // Store payment data temporarily
        this.tempPaymentData = response;

        // Close customer modal and show payment confirmation modal
        this.closeCustomerModal();
        this.isPaymentConfirmationModalOpen = true;
      },
      error: (error: any) => {
        console.error("Error al crear el pago:", error);
        this.alertService.showError(
          `Error al procesar el pago: ${error.message || "Error desconocido"}. Tu pedido fue guardado pero no se pudo iniciar el pago.`,
        );
        this.close();
      },
    });
  }

  closePaymentConfirmationModal() {
    this.isPaymentConfirmationModalOpen = false;
  }

  proceedToMercadoPago() {
    // User confirmed - update pedido to mercadopago and redirect
    if (this.tempPaymentData && this.tempPedidoData) {
      // Update pedido method to mercadopago
      this.pedidoService
        .updatePedido(this.tempPedidoData.id, {
          metodo_pago: "mercadopago",
        })
        .subscribe({
          next: (updatedPedido) => {
            console.log("Pedido actualizado a mercadopago:", updatedPedido);

            this.alertService.showSuccess(
              "Redirigiendo a MercadoPago para completar el pago...",
            );

            // Clear cart and redirect
            this.cartService.clearCart();

            if (
              this.tempPaymentData.data &&
              this.tempPaymentData.data.init_point
            ) {
              window.location.href = this.tempPaymentData.data.init_point;
            } else if (this.tempPaymentData.init_point) {
              window.location.href = this.tempPaymentData.init_point;
            } else {
              console.error(
                "No init_point found in response:",
                this.tempPaymentData,
              );
              this.alertService.showError(
                "Error: No se pudo obtener el link de pago",
              );
              this.close();
            }
          },
          error: (error: any) => {
            console.error("Error al actualizar el pedido:", error);
            this.alertService.showError(
              "Error al actualizar el método de pago. Por favor, contacta con soporte.",
            );
          },
        });
    }
  }

  changeToContraEntrega() {
    // User chose contra_entrega - pedido already has this as default, just confirm
    if (this.tempPedidoData) {
      console.log(
        "Usuario eligió contra entrega, pedido ya guardado con ese método",
      );
      this.alertService.showSuccess(
        "¡Gracias por su compra! Su pedido ha sido realizado con éxito. Pagarás al recibir la entrega.",
      );
      this.cartService.clearCart();
      this.close();
      // Clean up temporary data
      this.tempPaymentData = null;
      this.tempPedidoData = null;
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
