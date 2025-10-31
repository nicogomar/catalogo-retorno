import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payment-container">
      <div class="payment-card success">
        <div class="icon-container">
          <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1>¡Pago Exitoso!</h1>
        <p class="subtitle">Tu pedido ha sido procesado correctamente</p>

        @if (loading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Cargando información del pago...</p>
          </div>
        } @else if (pago) {
          <div class="payment-details">
            <div class="detail-row">
              <span class="label">Número de Pedido:</span>
              <span class="value">#{{ pago.pedido_id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">ID de Pago:</span>
              <span class="value">{{ pago.mercadopago_payment_id || 'Procesando...' }}</span>
            </div>
            @if (pago.monto) {
              <div class="detail-row">
                <span class="label">Monto:</span>
                <span class="value amount">{{ formatCurrency(pago.monto) }}</span>
              </div>
            }
            <div class="detail-row">
              <span class="label">Estado:</span>
              <span class="value status success-status">{{ formatEstado(pago.estado) }}</span>
            </div>
            @if (pago.fecha_aprobacion) {
              <div class="detail-row">
                <span class="label">Fecha:</span>
                <span class="value">{{ formatDate(pago.fecha_aprobacion) }}</span>
              </div>
            }
          </div>

          <div class="info-box">
            <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="info-text">
              <p><strong>¿Qué sigue?</strong></p>
              <p>Recibirás un correo electrónico con la confirmación de tu pedido y los detalles del envío.</p>
            </div>
          </div>
        } @else if (error) {
          <div class="error-message">
            <p>{{ error }}</p>
          </div>
        }

        <div class="actions">
          <button class="btn-primary" (click)="goToHome()">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al Inicio
          </button>
          @if (pago) {
            <button class="btn-secondary" (click)="viewOrder()">
              Ver Detalles del Pedido
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .payment-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }

    .payment-card.success {
      border-top: 6px solid #28a745;
    }

    .icon-container {
      margin-bottom: 24px;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      color: #28a745;
      margin: 0 auto;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    h1 {
      color: #2d3748;
      font-size: 32px;
      margin: 0 0 12px;
      font-weight: 700;
    }

    .subtitle {
      color: #718096;
      font-size: 18px;
      margin: 0 0 32px;
    }

    .loading {
      padding: 40px 20px;
      text-align: center;
    }

    .spinner {
      border: 4px solid #f3f4f6;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .payment-details {
      background: #f7fafc;
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
      text-align: left;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      color: #718096;
      font-weight: 500;
      font-size: 14px;
    }

    .value {
      color: #2d3748;
      font-weight: 600;
      font-size: 14px;
    }

    .value.amount {
      color: #28a745;
      font-size: 18px;
    }

    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .success-status {
      background: #d4edda;
      color: #155724;
    }

    .info-box {
      display: flex;
      gap: 16px;
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
      text-align: left;
    }

    .info-icon {
      width: 24px;
      height: 24px;
      color: #1890ff;
      flex-shrink: 0;
    }

    .info-text {
      flex: 1;
    }

    .info-text p {
      margin: 0 0 8px;
      color: #0050b3;
      font-size: 14px;
      line-height: 1.5;
    }

    .info-text p:last-child {
      margin-bottom: 0;
    }

    .info-text strong {
      font-weight: 600;
    }

    .error-message {
      background: #fff5f5;
      border: 1px solid #fc8181;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
      color: #c53030;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 32px;
    }

    .btn-primary,
    .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-secondary:hover {
      background: #f7fafc;
    }

    .btn-icon {
      width: 20px;
      height: 20px;
    }

    @media (max-width: 768px) {
      .payment-container {
        padding: 16px;
      }

      .payment-card {
        padding: 24px;
      }

      h1 {
        font-size: 24px;
      }

      .subtitle {
        font-size: 16px;
      }

      .success-icon {
        width: 60px;
        height: 60px;
      }

      .payment-details {
        padding: 16px;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .info-box {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  pago: any = null;
  loading = true;
  error: string | null = null;
  paymentId: string | null = null;
  externalReference: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    // Get query parameters from URL
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'];
      this.externalReference = params['external_reference'];
      const collectionStatus = params['collection_status'];
      const preferenceId = params['preference_id'];

      console.log('Payment Success - Query params:', {
        paymentId: this.paymentId,
        externalReference: this.externalReference,
        collectionStatus,
        preferenceId
      });

      if (this.externalReference) {
        this.loadPaymentInfo();
      } else if (this.paymentId) {
        this.loadPaymentByMercadoPagoId();
      } else {
        this.loading = false;
        this.error = 'No se encontró información del pago.';
      }
    });
  }

  loadPaymentInfo(): void {
    if (!this.externalReference) return;

    this.pagoService.getPagoByExternalReference(this.externalReference).subscribe({
      next: (pago) => {
        this.pago = pago;
        this.loading = false;
        console.log('Payment info loaded:', pago);
      },
      error: (error) => {
        console.error('Error loading payment info:', error);
        this.error = 'No se pudo cargar la información del pago.';
        this.loading = false;
      }
    });
  }

  loadPaymentByMercadoPagoId(): void {
    if (!this.paymentId) return;

    this.pagoService.getMercadoPagoPaymentInfo(this.paymentId).subscribe({
      next: (info) => {
        console.log('MercadoPago payment info:', info);
        // Try to load local payment record using external reference
        if (info.external_reference) {
          this.externalReference = info.external_reference;
          this.loadPaymentInfo();
        } else {
          this.loading = false;
          this.error = 'Pago procesado pero no se encontró registro local.';
        }
      },
      error: (error) => {
        console.error('Error loading MercadoPago payment info:', error);
        this.loading = false;
        this.error = 'No se pudo verificar el pago en MercadoPago.';
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  formatEstado(estado: string): string {
    return this.pagoService.formatEstado(estado as any);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  viewOrder(): void {
    if (this.pago && this.pago.pedido_id) {
      // Navigate to order details page (you'll need to create this route)
      this.router.navigate(['/pedidos', this.pago.pedido_id]);
    }
  }
}
