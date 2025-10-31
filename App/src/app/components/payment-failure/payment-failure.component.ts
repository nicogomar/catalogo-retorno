import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payment-container">
      <div class="payment-card failure">
        <div class="icon-container">
          <svg class="failure-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1>Pago Rechazado</h1>
        <p class="subtitle">No se pudo procesar tu pago</p>

        @if (loading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Verificando información del pago...</p>
          </div>
        } @else {
          @if (pago) {
            <div class="payment-details">
              <div class="detail-row">
                <span class="label">Número de Pedido:</span>
                <span class="value">#{{ pago.pedido_id }}</span>
              </div>
              @if (pago.mercadopago_payment_id) {
                <div class="detail-row">
                  <span class="label">ID de Pago:</span>
                  <span class="value">{{ pago.mercadopago_payment_id }}</span>
                </div>
              }
              @if (pago.monto) {
                <div class="detail-row">
                  <span class="label">Monto:</span>
                  <span class="value amount">{{ formatCurrency(pago.monto) }}</span>
                </div>
              }
              <div class="detail-row">
                <span class="label">Estado:</span>
                <span class="value status failure-status">{{ formatEstado(pago.estado) }}</span>
              </div>
            </div>
          }

          <div class="error-box">
            <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="error-text">
              <p><strong>¿Por qué fue rechazado?</strong></p>
              <p>El pago puede haber sido rechazado por varios motivos:</p>
              <ul>
                <li>Fondos insuficientes en la tarjeta</li>
                <li>Datos de tarjeta incorrectos</li>
                <li>Límite de compra excedido</li>
                <li>Tarjeta vencida o bloqueada</li>
              </ul>
            </div>
          </div>

          <div class="info-box">
            <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="info-text">
              <p><strong>¿Qué puedes hacer?</strong></p>
              <p>• Verifica los datos de tu tarjeta</p>
              <p>• Intenta con otro método de pago</p>
              <p>• Contacta a tu banco para más información</p>
              <p>• Intenta realizar el pago nuevamente</p>
            </div>
          </div>
        }

        <div class="actions">
          <button class="btn-primary" (click)="tryAgain()">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Intentar de Nuevo
          </button>
          <button class="btn-secondary" (click)="goToHome()">
            Volver al Inicio
          </button>
          @if (supportPhone || supportEmail) {
            <button class="btn-tertiary" (click)="contactSupport()">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contactar Soporte
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

    .payment-card.failure {
      border-top: 6px solid #dc3545;
    }

    .icon-container {
      margin-bottom: 24px;
    }

    .failure-icon {
      width: 80px;
      height: 80px;
      color: #dc3545;
      margin: 0 auto;
      animation: shake 0.5s ease-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
      20%, 40%, 60%, 80% { transform: translateX(10px); }
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
      border-top: 4px solid #f5576c;
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
      color: #dc3545;
      font-size: 18px;
    }

    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .failure-status {
      background: #f8d7da;
      color: #721c24;
    }

    .error-box {
      display: flex;
      gap: 16px;
      background: #fff5f5;
      border: 1px solid #fc8181;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
      text-align: left;
    }

    .error-icon {
      width: 24px;
      height: 24px;
      color: #e53e3e;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .error-text {
      flex: 1;
    }

    .error-text p {
      margin: 0 0 12px;
      color: #c53030;
      font-size: 14px;
      line-height: 1.5;
    }

    .error-text ul {
      margin: 8px 0 0 20px;
      padding: 0;
      color: #742a2a;
    }

    .error-text li {
      margin: 4px 0;
      font-size: 13px;
    }

    .error-text strong {
      font-weight: 600;
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

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 32px;
    }

    .btn-primary,
    .btn-secondary,
    .btn-tertiary {
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
      background: #dc3545;
      color: white;
    }

    .btn-primary:hover {
      background: #c82333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    }

    .btn-secondary {
      background: transparent;
      color: #dc3545;
      border: 2px solid #dc3545;
    }

    .btn-secondary:hover {
      background: #fff5f5;
    }

    .btn-tertiary {
      background: #667eea;
      color: white;
    }

    .btn-tertiary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

      .failure-icon {
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

      .error-box,
      .info-box {
        flex-direction: column;
        gap: 12px;
      }

      .error-text ul {
        margin-left: 0;
        padding-left: 20px;
      }
    }
  `]
})
export class PaymentFailureComponent implements OnInit {
  pago: any = null;
  loading = true;
  error: string | null = null;
  paymentId: string | null = null;
  externalReference: string | null = null;
  supportPhone = ''; // Add your support phone
  supportEmail = ''; // Add your support email

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'];
      this.externalReference = params['external_reference'];
      const collectionStatus = params['collection_status'];

      console.log('Payment Failure - Query params:', {
        paymentId: this.paymentId,
        externalReference: this.externalReference,
        collectionStatus
      });

      if (this.externalReference) {
        this.loadPaymentInfo();
      } else {
        this.loading = false;
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
        this.loading = false;
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

  tryAgain(): void {
    // Navigate back to cart or home to try again
    this.router.navigate(['/']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  contactSupport(): void {
    if (this.supportEmail) {
      window.location.href = `mailto:${this.supportEmail}?subject=Problema con pago&body=ID de pago: ${this.paymentId || 'N/A'}%0AReferencia: ${this.externalReference || 'N/A'}`;
    } else if (this.supportPhone) {
      window.location.href = `tel:${this.supportPhone}`;
    }
  }
}
