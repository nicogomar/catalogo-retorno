import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppConfig } from '../../config';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible) {
      <a
        [href]="whatsappLink"
        target="_blank"
        class="whatsapp-float"
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="white"
            d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 8.135-2.135c2.369 1.228 5.021 1.885 7.865 1.885 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-5.245 1.377 1.401-5.197-0.314-0.518c-1.396-2.278-2.132-4.903-2.132-7.6 0-7.989 6.511-14.5 14.5-14.5s14.5 6.511 14.5 14.5-6.511 14.5-14.5 14.5zM21.803 18.731c-0.397-0.199-2.348-1.158-2.713-1.291s-0.629-0.199-0.894 0.199c-0.265 0.397-1.026 1.291-1.258 1.556s-0.463 0.298-0.861 0.099c-0.397-0.199-1.678-0.618-3.197-1.973-1.182-1.054-1.98-2.357-2.212-2.754s-0.025-0.611 0.174-0.811c0.179-0.178 0.397-0.463 0.596-0.695s0.265-0.397 0.397-0.662c0.132-0.265 0.066-0.497-0.033-0.695s-0.894-2.148-1.225-2.943c-0.322-0.776-0.649-0.67-0.894-0.683-0.231-0.012-0.497-0.015-0.762-0.015s-0.695 0.099-1.060 0.497c-0.364 0.397-1.391 1.357-1.391 3.314s1.424 3.845 1.623 4.11c0.199 0.265 2.807 4.285 6.802 6.009 0.95 0.411 1.692 0.655 2.27 0.839 0.955 0.303 1.824 0.26 2.513 0.158 0.767-0.115 2.348-0.96 2.68-1.887s0.331-1.723 0.232-1.887c-0.099-0.165-0.364-0.265-0.762-0.463z"
          />
        </svg>
      </a>
    }
  `,
  styles: [
    `
      .whatsapp-float {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background-color: #25d366;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transition: all 0.3s ease;
        text-decoration: none;
      }

      .whatsapp-float:hover {
        background-color: #20ba5a;
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .whatsapp-float svg {
        width: 35px;
        height: 35px;
      }

      @media (max-width: 768px) {
        .whatsapp-float {
          width: 50px;
          height: 50px;
          bottom: 15px;
          right: 15px;
        }

        .whatsapp-float svg {
          width: 30px;
          height: 30px;
        }
      }
    `,
  ],
})
export class WhatsappFloatComponent implements OnInit {
  isVisible: boolean = false;
  whatsappLink: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Solo mostrar en la página principal (ruta raíz)
    this.router.events.subscribe(() => {
      this.isVisible = this.router.url === '/';
    });

    // Verificar la ruta inicial
    this.isVisible = this.router.url === '/';

    // Construir el link de WhatsApp
    this.whatsappLink = `https://wa.me/${AppConfig.contact.whatsapp.replace(/\D/g, '')}`;
  }
}
