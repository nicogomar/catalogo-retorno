import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-payment-pending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payment-container">
      <div class="payment-card pending">
        <div class="icon-container">
          <svg class="pending-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1>Pago Pendiente</h1>
        <p class="subtitle">Tu pago está siendo procesado</p>

        @if (loading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Verificando estado del pago...</p>
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
                <span class="value status pending-status">{{ formatEstado(pago.estado) }}</span>
              </div>
              @if (pago.created_at) {
                <div class="detail-row">
                  <span class="label">Fecha de solicitud:</span>
                  <span class="value">{{ formatDate(pago.created_at) }}</span>
                </div>
              }
            </div>
          }

          <div class="warning-box">
            <svg class="warning-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="warning-text">
              <p><strong>¿Por qué está pendiente?</strong></p>
              <p>Tu pago está siendo procesado. Esto puede deberse a:</p>
              <ul>
                <li>Pago con efectivo en puntos de pago</li>
                <li>Transferencia bancaria pendiente de acreditación</li>
                <li>Verificación adicional requerida por el banco</li>
                <li>Procesamiento en horario no bancario</li>
              </ul>
            </div>
          </div>

          <div class="info-box">
            <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="info-text">
              <p><strong>¿Qué sucede ahora?</strong></p>
              <p>• El pago puede tardar hasta 48 horas en procesarse</p>
              <p>• Recibirás un email cuando se confirme el pago</p>
              <p>• Puedes verificar el estado en cualquier momento</p>
              <p>• Tu pedido se procesará una vez confirmado el pago</p>
            </div>
          </div>

          <div class="timeline">
            <h3>Proceso de tu pago</h3>
            <div class="timeline-item completed">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h4>Pedido creado</h4>
                <p>Tu pedido fue registrado exitosamente</p>
              </div>
            </div>
            <div class="timeline-item active">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h4>Pago en proceso</h4>
                <p>Esperando confirmación del pago</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h4>Pago confirmado</h4>
                <p>Una vez aprobado, procesaremos tu pedido</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h4>Pedido enviado</h4>
                <p>Recibirás información de seguimiento</p>
              </div>
            </div>
          </div>
        }

        <div class="actions">
          <button class="btn-primary" (click)="checkStatus()">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Verificar Estado
          </button>
          <button class="btn-secondary" (click)="goToHome()">
            Volver al Inicio
          </button>
          @if (pago) {
            <button class="btn-tertiary" (click)="viewOrder()">
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
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

    .payment-card.pending {
      border-top: 6px solid #ffc107;
    }

    .icon-container {
      margin-bottom: 24px;
    }

    .pending-icon {
      width: 80px;
      height: 80px;
      color: #ffc107;
      margin: 0 auto;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
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
      border-top: 4px solid #ffc107;
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
      color: #ffc107;
      font-size: 18px;
    }

    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .pending-status {
      background: #fff3cd;
      color: #856404;
    }

    .warning-box {
      display: flex;
      gap: 16px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
      text-align: left;
    }

    .warning-icon {
      width: 24px;
      height: 24px;
      color: #f59e0b;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .warning-text {
      flex: 1;
    }

    .warning-text p {
      margin: 0 0 12px;
      color: #856404;
      font-size: 14px;
      line-height: 1.5;
    }

    .warning-text ul {
      margin: 8px 0 0 20px;
      padding: 0;
      color: #856404;
    }

    .warning-text li {
      margin: 4px 0;
      font-size: 13px;
    }

    .warning-text strong {
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

    .timeline {
      margin: 32px 0;
      text-align: left;
    }

    .timeline h3 {
      margin: 0 0 24px;
      color: #2d3748;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
      padding-bottom: 24px;
    }

    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 11px;
      top: 24px;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }

    .timeline-item.completed::after {
      background: #28a745;
    }

    .timeline-item.active::after {
      background: #ffc107;
    }

    .timeline-marker {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid #e2e8f0;
      background: white;
      flex-shrink: 0;
      z-index: 1;
    }

    .timeline-item.completed .timeline-marker {
      border-color: #28a745;
      background: #28a745;
    }

    .timeline-item.active .timeline-marker {
      border-color: #ffc107;
      background: #ffc107;
      animation: pulse-marker 2s ease-in-out infinite;
    }

    @keyframes pulse-marker {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4); }
      50% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
    }

    .timeline-content {
      flex: 1;
      padding-top: 2px;
    }

    .timeline-content h4 {
      margin: 0 0 4px;
      color: #2d3748;
      font-size: 16px;
      font-weight: 600;
    }

    .timeline-content p {
      margin: 0;
      color: #718096;
      font-size: 14px;
    }

    .timeline-item.completed .timeline-content h4 {
      color: #28a745;
    }

    .timeline-item.active .timeline-content h4 {
      color: #ffc107;
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
      background: #ffc107;
      color: #2d3748;
    }

    .btn-primary:hover {
      background: #e0a800;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
    }

    .btn-secondary {
      background: transparent;
      color: #ffc107;
      border: 2px solid #ffc107;
    }

    .btn-secondary:hover {
      background: #fff3cd;
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

      .pending-icon {
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

      .warning-box,
      .info-box {
        flex-direction: column;
        gap: 12px;
      }

      .warning-text ul {
        margin-left: 0;
        padding-left: 20px;
      }

      .timeline {
        margin: 24px 0;
      }

      .timeline h3 {
        font-size: 16px;
      }

      .timeline-item {
        gap: 12px;
        padding-bottom: 20px;
      }

      .timeline-marker {
        width: 20px;
        height: 20px;
      }

      .timeline-item:not(:last-child)::after {
        left: 9px;
        top: 20px;
      }

      .timeline-content h4 {
        font-size: 14px;
      }

      .timeline-content p {
        font-size: 12px;
      }
    }
  `]
})
export class PaymentPendingComponent implements OnInit {
  pago: any = null;
  loading = true;
  error: string | null = null;
  paymentId: string | null = null;
  externalReference: string | null = null;

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

      console.log('Payment Pending - Query params:', {
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

  checkStatus(): void {
    this.loading = true;
    this.loadPaymentInfo();
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  viewOrder(): void {
    if (this.pago && this.pago.pedido_id) {
      this.router.navigate(['/pedidos', this.pago.pedido_id]);
    }
  }
}
