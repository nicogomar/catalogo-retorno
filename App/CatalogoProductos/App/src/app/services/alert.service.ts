import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: string;
  visible: boolean;
  autoDismiss?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private defaultDismissTime = 3000; // 3 seconds
  private alertSubject = new BehaviorSubject<Alert | null>(null);

  constructor() { }

  // Get the current alert as an Observable
  getAlert(): Observable<Alert | null> {
    return this.alertSubject.asObservable();
  }

  // Show a success alert
  showSuccess(message: string, autoDismiss = true): void {
    this.show({
      type: 'success',
      message,
      icon: 'check-circle',
      visible: true,
      autoDismiss
    });
  }

  // Show an error alert
  showError(message: string, autoDismiss = true): void {
    this.show({
      type: 'error',
      message,
      icon: 'exclamation-circle',
      visible: true,
      autoDismiss
    });
  }

  // Show a warning alert
  showWarning(message: string, autoDismiss = true): void {
    this.show({
      type: 'warning',
      message,
      icon: 'exclamation-triangle',
      visible: true,
      autoDismiss
    });
  }

  // Show an info alert
  showInfo(message: string, autoDismiss = true): void {
    this.show({
      type: 'info',
      message,
      icon: 'info-circle',
      visible: true,
      autoDismiss
    });
  }

  // Hide the current alert
  hide(): void {
    const currentAlert = this.alertSubject.value;
    if (currentAlert) {
      this.alertSubject.next({ ...currentAlert, visible: false });
      // After a short transition period, set to null
      setTimeout(() => {
        this.alertSubject.next(null);
      }, 300);
    }
  }

  // Private method to show alerts
  private show(alert: Alert): void {
    this.alertSubject.next(alert);

    if (alert.autoDismiss) {
      setTimeout(() => {
        this.hide();
      }, this.defaultDismissTime);
    }
  }
}
