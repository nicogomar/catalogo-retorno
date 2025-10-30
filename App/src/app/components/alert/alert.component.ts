import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="alert"
      class="alert-container"
      [ngClass]="{'alert-visible': alert.visible}">
      <div class="alert" [ngClass]="'alert-' + alert.type">
        <div class="alert-icon" *ngIf="alert.icon">
          <!-- Check Icon for Success -->
          <svg *ngIf="alert.icon === 'check-circle'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>

          <!-- Exclamation Circle for Error -->
          <svg *ngIf="alert.icon === 'exclamation-circle'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>

          <!-- Exclamation Triangle for Warning -->
          <svg *ngIf="alert.icon === 'exclamation-triangle'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>

          <!-- Info Circle for Info -->
          <svg *ngIf="alert.icon === 'info-circle'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 102 0v-5a1 1 0 00-2 0v5z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="alert-message">{{ alert.message }}</div>
        <button class="alert-close" (click)="closeAlert()">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .alert-container {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      z-index: 9999;
      transform: translateY(-100px);
      opacity: 0;
      transition: all 0.3s ease-in-out;
    }

    .alert-visible {
      transform: translateY(0);
      opacity: 1;
    }

    .alert {
      display: flex;
      align-items: center;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 10px;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border-left: 5px solid #28a745;
    }

    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 5px solid #dc3545;
    }

    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
      border-left: 5px solid #ffc107;
    }

    .alert-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left: 5px solid #17a2b8;
    }

    .alert-icon {
      margin-right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alert-message {
      flex: 1;
      font-size: 16px;
    }

    .alert-close {
      background: transparent;
      border: none;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
    }

    .alert-close:hover {
      opacity: 1;
    }
  `]
})
export class AlertComponent implements OnInit, OnDestroy {
  alert: Alert | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.subscription = this.alertService.getAlert().subscribe(alert => {
      this.alert = alert;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeAlert(): void {
    this.alertService.hide();
  }
}
