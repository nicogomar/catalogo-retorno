import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConfig } from '../config';

/**
 * Servicio para gestionar la configuración de la aplicación
 * Permite cambiar dinámicamente colores, títulos y otros parámetros
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<typeof AppConfig>(AppConfig);
  public config$ = this.configSubject.asObservable();

  constructor() {
    this.initializeCssVariables();
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): typeof AppConfig {
    return this.configSubject.value;
  }

  /**
   * Actualiza la configuración completa
   */
  updateConfig(newConfig: Partial<typeof AppConfig>): void {
    const updatedConfig = { ...this.configSubject.value, ...newConfig };
    this.configSubject.next(updatedConfig);
    this.updateCssVariables(updatedConfig);
  }

  /**
   * Actualiza un color específico
   */
  updateColor(colorPath: string, value: string): void {
    const config = this.getConfig();
    const keys = colorPath.split('.');
    let obj: any = config;

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
    this.updateConfig(config);
  }

  /**
   * Actualiza un título específico
   */
  updateTitle(titlePath: string, value: string): void {
    const config = this.getConfig();
    const keys = titlePath.split('.');
    let obj: any = config;

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
    this.updateConfig(config);
  }

  /**
   * Inicializa las variables CSS con los valores de configuración
   */
  private initializeCssVariables(): void {
    this.updateCssVariables(AppConfig);
  }

  /**
   * Actualiza las variables CSS en el DOM
   */
  private updateCssVariables(config: typeof AppConfig): void {
    const root = document.documentElement;

    // Actualizar colores
    if (config.colors) {
      Object.entries(config.colors).forEach(([key, value]) => {
        const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      });
    }

    // Actualizar título de la página
    if (config.titles?.pageTitle) {
      document.title = config.titles.pageTitle;
      const titleElement = document.getElementById('page-title');
      if (titleElement) {
        titleElement.textContent = config.titles.pageTitle;
      }
    }
  }

  /**
   * Obtiene un color específico
   */
  getColor(colorPath: string): string {
    const keys = colorPath.split('.');
    let value: any = this.getConfig();

    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        console.warn(`Color no encontrado: ${colorPath}`);
        return '#000000';
      }
    }

    return value;
  }

  /**
   * Obtiene un título específico
   */
  getTitle(titlePath: string): string {
    const keys = titlePath.split('.');
    let value: any = this.getConfig();

    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        console.warn(`Título no encontrado: ${titlePath}`);
        return '';
      }
    }

    return value;
  }
}
