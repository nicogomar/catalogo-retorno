import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CartService, CartItem } from "../../services/cart.service";

@Component({
  selector: "app-customer-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal($event)">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Completar información de contacto</h2>
          <button class="close-button" (click)="close()">×</button>
        </div>

        <div class="modal-content">
          <form [formGroup]="customerForm" (ngSubmit)="submitOrder()">
            <div class="form-group">
              <label for="name">Nombre/Comercio:</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="form-control"
                [ngClass]="{ invalid: submitted && f['name'].errors }"
              />
              <div *ngIf="submitted && f['name'].errors" class="error-message">
                <div *ngIf="f['name'].errors['required']">
                  El nombre es obligatorio
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="phone">Teléfono:</label>
              <input
                type="tel"
                id="phone"
                formControlName="phone"
                class="form-control"
                [ngClass]="{ invalid: submitted && f['phone'].errors }"
              />
              <div *ngIf="submitted && f['phone'].errors" class="error-message">
                <div *ngIf="f['phone'].errors['required']">
                  El teléfono es obligatorio
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email:</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="form-control"
                [ngClass]="{ invalid: submitted && f['email'].errors }"
              />
              <div *ngIf="submitted && f['email'].errors" class="error-message">
                <div *ngIf="f['email'].errors['required']">
                  El email es obligatorio
                </div>
                <div *ngIf="f['email'].errors['email']">
                  Ingrese un email válido
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="location">Localidad:</label>
              <select
                id="location"
                formControlName="location"
                class="form-control"
                [ngClass]="{ invalid: submitted && f['location'].errors }"
              >
                <option value="">Seleccione un departamento</option>
                <option
                  *ngFor="let department of departments"
                  [value]="department"
                >
                  {{ department }}
                </option>
              </select>
              <div
                *ngIf="submitted && f['location'].errors"
                class="error-message"
              >
                <div *ngIf="f['location'].errors['required']">
                  La localidad es obligatoria
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="details">Detalles:</label>
              <textarea
                id="details"
                formControlName="details"
                class="form-control"
                rows="3"
                placeholder="Información adicional sobre el pedido..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Método de pago:</label>
              <div class="payment-method-options">
                <label class="payment-option">
                  <input
                    type="radio"
                    formControlName="paymentMethod"
                    value="mercadopago"
                  />
                  <div class="payment-option-content">
                    <span class="payment-title">💳 Pago Online (MercadoPago)</span>
                    <span class="payment-description">Paga ahora con tarjeta de crédito/débito</span>
                  </div>
                </label>
                <label class="payment-option">
                  <input
                    type="radio"
                    formControlName="paymentMethod"
                    value="contra_entrega"
                  />
                  <div class="payment-option-content">
                    <span class="payment-title">💵 Pago Contra Entrega</span>
                    <span class="payment-description">Paga en efectivo al recibir tu pedido</span>
                  </div>
                </label>
              </div>
              <div *ngIf="submitted && f['paymentMethod'].errors" class="error-message">
                <div *ngIf="f['paymentMethod'].errors['required']">
                  Debe seleccionar un método de pago
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn">Realizar pedido</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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
        z-index: 1002;
        padding: 20px;
        overflow-y: auto;
      }

      .modal-container {
        background-color: #fff;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        margin: auto;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background-color: #f8f4ee;
        border-bottom: 1px solid #eaeaea;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 18px;
        color: #4a1d4a;
      }

      .close-button {
        background: transparent;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }

      .modal-content {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        transition: border-color 0.3s;
      }

      .form-control:focus {
        outline: none;
        border-color: #4a1d4a;
      }

      .form-control.invalid {
        border-color: #dc3545;
      }

      .error-message {
        color: #dc3545;
        font-size: 14px;
        margin-top: 4px;
      }

      .form-actions {
        margin-top: 24px;
      }

      .submit-btn {
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

      .submit-btn:hover {
        background-color: #234731;
      }

      .payment-method-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .payment-option {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        border: 2px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .payment-option:hover {
        border-color: #4a1d4a;
        background-color: #f8f4ee;
      }

      .payment-option input[type="radio"] {
        margin-top: 4px;
        margin-right: 12px;
        cursor: pointer;
      }

      .payment-option input[type="radio"]:checked + .payment-option-content {
        color: #4a1d4a;
      }

      .payment-option:has(input[type="radio"]:checked) {
        border-color: #4a1d4a;
        background-color: #f8f4ee;
      }

      .payment-option-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }

      .payment-title {
        font-weight: 600;
        font-size: 16px;
        color: #333;
      }

      .payment-description {
        font-size: 14px;
        color: #666;
      }

      @media (max-width: 600px) {
        .modal-overlay {
          padding: 10px;
          align-items: flex-start;
        }

        .modal-container {
          width: 100%;
          max-height: 95vh;
          margin-top: 10px;
        }

        .modal-content {
          padding: 15px;
        }

        .modal-header h2 {
          font-size: 16px;
        }

        .payment-option {
          padding: 12px;
        }

        .payment-title {
          font-size: 14px;
        }

        .payment-description {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class CustomerModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() orderSubmitted = new EventEmitter<any>();

  customerForm!: FormGroup;
  submitted = false;

  // List of Uruguay's 19 departments
  departments: string[] = [
    "Artigas",
    "Canelones",
    "Cerro Largo",
    "Colonia",
    "Durazno",
    "Flores",
    "Florida",
    "Lavalleja",
    "Maldonado",
    "Montevideo",
    "Paysandú",
    "Río Negro",
    "Rivera",
    "Rocha",
    "Salto",
    "San José",
    "Soriano",
    "Tacuarembó",
    "Treinta y Tres",
  ];

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  // Initialize the form with validation
  private initForm() {
    this.customerForm = this.formBuilder.group({
      name: ["", [Validators.required]],
      phone: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      location: ["", [Validators.required]],
      details: [""],
      paymentMethod: ["mercadopago", [Validators.required]],
    });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.customerForm.controls;
  }

  // Close the modal
  close() {
    this.isOpen = false;
    this.closeEvent.emit();
    this.resetForm();
  }

  // Prevent clicks on the modal from closing it
  closeModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  // Reset the form
  resetForm() {
    this.submitted = false;
    this.customerForm.reset();
  }

  // Submit the order
  submitOrder() {
    this.submitted = true;

    // Stop if the form is invalid
    if (this.customerForm.invalid) {
      return;
    }

    // Create order object with form data and cart items
    const order = {
      customer: this.customerForm.value,
      items: this.cartService.getCartItems()(),
      totalPrice: this.cartService.totalPrice(),
      date: new Date(),
    };

    // Emit the order data
    this.orderSubmitted.emit(order);

    // Close modal and clear cart after successful submission
    this.close();
    this.cartService.clearCart();
  }
}
