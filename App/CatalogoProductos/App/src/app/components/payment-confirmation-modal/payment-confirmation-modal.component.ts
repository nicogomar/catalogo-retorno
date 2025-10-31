import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-payment-confirmation-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal($event)">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Confirmar Método de Pago</h2>
        </div>

        <div class="modal-content">
          <div class="icon-container">
            <span class="icon">💳</span>
          </div>

          <p class="message">¡Tu pedido ha sido registrado exitosamente!</p>

          <p class="question">¿Cómo deseas realizar el pago?</p>

          <div class="info-box">
            <p>
              <strong>💳 Pagar ahora:</strong> Serás redirigido a MercadoPago
              para pagar con tarjeta de crédito/débito
            </p>
            <p>
              <strong>💵 Pagar al recibir:</strong> Pagarás en efectivo cuando
              te entreguemos el pedido
            </p>
          </div>

          <div class="button-group">
            <button class="btn btn-primary" (click)="confirmPayment()">
              <span class="btn-icon">💳</span>
              Ir a MercadoPago
            </button>
            <button class="btn btn-secondary" (click)="changeToContraEntrega()">
              <span class="btn-icon">💵</span>
              Pagar Contra Entrega
            </button>
          </div>
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
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 0.2s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-container {
        background-color: #fff;
        width: 90%;
        max-width: 500px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .modal-header {
        padding: 20px 24px;
        background-color: #4a1d4a;
        color: white;
        text-align: center;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .modal-content {
        padding: 24px;
      }

      .icon-container {
        text-align: center;
        margin-bottom: 16px;
      }

      .icon {
        font-size: 64px;
        display: inline-block;
        animation: bounce 1s ease-in-out;
      }

      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .message {
        text-align: center;
        font-size: 16px;
        color: #333;
        margin-bottom: 16px;
        font-weight: 500;
      }

      .question {
        text-align: center;
        font-size: 18px;
        color: #333;
        margin-bottom: 24px;
        line-height: 1.5;
      }

      .question strong {
        color: #4a1d4a;
      }

      .info-box {
        background-color: #f8f4ee;
        border-left: 4px solid #4a1d4a;
        padding: 16px;
        margin-bottom: 24px;
        border-radius: 4px;
      }

      .info-box p {
        margin: 8px 0;
        font-size: 14px;
        color: #555;
      }

      .info-box p:first-child {
        margin-top: 0;
      }

      .info-box p:last-child {
        margin-bottom: 0;
      }

      .info-box strong {
        color: #4a1d4a;
      }

      .button-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px 20px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
      }

      .btn-icon {
        font-size: 24px;
        margin-right: 10px;
      }

      .btn-primary {
        background-color: #4a1d4a;
        color: white;
      }

      .btn-primary:hover {
        background-color: #234731;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(74, 29, 74, 0.3);
      }

      .btn-primary:active {
        transform: translateY(0);
      }

      .btn-secondary {
        background-color: #f0f0f0;
        color: #333;
        border: 2px solid #ddd;
      }

      .btn-secondary:hover {
        background-color: #e0e0e0;
        border-color: #4a1d4a;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .btn-secondary:active {
        transform: translateY(0);
      }

      @media (max-width: 600px) {
        .modal-container {
          width: 95%;
          margin: 20px;
        }

        .modal-content {
          padding: 20px;
        }

        .icon {
          font-size: 48px;
        }

        .question {
          font-size: 16px;
        }

        .btn {
          padding: 12px 16px;
          font-size: 15px;
        }

        .btn-icon {
          font-size: 20px;
        }
      }

      @media (max-width: 400px) {
        .button-group {
          gap: 10px;
        }

        .info-box {
          padding: 12px;
        }

        .info-box p {
          font-size: 13px;
        }
      }
    `,
  ],
})
export class PaymentConfirmationModalComponent {
  @Input() isOpen = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() changePaymentMethod = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();

  confirmPayment() {
    this.confirm.emit();
    this.close();
  }

  changeToContraEntrega() {
    this.changePaymentMethod.emit();
    this.close();
  }

  close() {
    this.isOpen = false;
    this.closeEvent.emit();
  }

  closeModal(event: MouseEvent) {
    // Don't allow closing by clicking outside - user must make a choice
    // if (event.target === event.currentTarget) {
    //   this.close();
    // }
  }
}
