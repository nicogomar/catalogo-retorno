import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carousel-container" *ngIf="images && images.length > 0">
      <div class="carousel-main">
        <div class="carousel-image-wrapper">
          <img 
            [src]="currentImage" 
            [alt]="'Image ' + (currentIndex + 1)"
            class="carousel-image"
            (error)="onImageError($event)"
          />
          
          <!-- Navigation arrows -->
          @if (images.length > 1) {
            <button class="carousel-nav prev" (click)="previous()" [disabled]="isTransitioning">
              ‹
            </button>
            <button class="carousel-nav next" (click)="next()" [disabled]="isTransitioning">
              ›
            </button>
          }
        </div>
        
        <!-- Indicators -->
        @if (images.length > 1) {
          <div class="carousel-indicators">
            @for (image of images; track image; let i = $index) {
              <button 
                class="indicator" 
                [class.active]="i === currentIndex"
                (click)="goToSlide(i)"
              ></button>
            }
          </div>
        }
      </div>
      
      <!-- Thumbnails -->
      @if (showThumbnails && images.length > 1) {
        <div class="carousel-thumbnails">
          @for (image of images; track image; let i = $index) {
            <div 
              class="thumbnail"
              [class.active]="i === currentIndex"
              (click)="goToSlide(i)"
            >
              <img 
                [src]="image" 
                [alt]="'Thumbnail ' + (i + 1)"
                (error)="onThumbnailError($event)"
              />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .carousel-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .carousel-main {
      position: relative;
      background: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
    }

    .carousel-image-wrapper {
      position: relative;
      width: 100%;
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 8px;
      background: #000;
    }

    .carousel-image {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 8px;
    }

    .carousel-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 10;
    }

    .carousel-nav:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.7);
    }

    .carousel-nav:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .carousel-nav.prev {
      left: 10px;
    }

    .carousel-nav.next {
      right: 10px;
    }

    .carousel-indicators {
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
    }

    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .indicator.active {
      background: white;
      transform: scale(1.2);
    }

    .carousel-thumbnails {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      overflow-x: auto;
      padding: 10px 0;
    }

    .thumbnail {
      flex: 0 0 auto;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .thumbnail:hover {
      border-color: #4a1d4a;
    }

    .thumbnail.active {
      border-color: #4a1d4a;
      transform: scale(1.1);
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media (max-width: 768px) {
      .carousel-image-wrapper {
        height: 350px;
      }

      .carousel-nav {
        width: 35px;
        height: 35px;
        font-size: 18px;
      }

      .carousel-nav.prev {
        left: 5px;
      }

      .carousel-nav.next {
        right: 5px;
      }

      .thumbnail {
        width: 50px;
        height: 50px;
      }
    }
  `]
})
export class ImageCarouselComponent {
  @Input() images: string[] = [];
  @Input() showThumbnails: boolean = true;
  @Input() autoPlay: boolean = true;
  @Input() autoPlayInterval: number = 2000;
  
  @Output() imageChange = new EventEmitter<string>();
  @Output() indexChange = new EventEmitter<number>();

  currentIndex: number = 0;
  isTransitioning: boolean = false;
  private autoPlayTimer: any;

  get currentImage(): string {
    return this.images[this.currentIndex] || '';
  }

  ngOnInit(): void {
    if (this.autoPlay && this.images.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  next(): void {
    if (this.isTransitioning || this.images.length <= 1) return;
    
    // Pausar auto-reproducción cuando el usuario interactúa
    this.pauseAutoPlay();
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.emitChanges();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  previous(): void {
    if (this.isTransitioning || this.images.length <= 1) return;
    
    // Pausar auto-reproducción cuando el usuario interactúa
    this.pauseAutoPlay();
    
    this.isTransitioning = true;
    this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
    this.emitChanges();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    // Pausar auto-reproducción cuando el usuario interactúa
    this.pauseAutoPlay();
    
    this.isTransitioning = true;
    this.currentIndex = index;
    this.emitChanges();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  private pauseAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private startAutoPlay(): void {
    // No iniciar si ya hay un timer activo
    if (this.autoPlayTimer) return;
    
    this.autoPlayTimer = setInterval(() => {
      // Solo avanzar si no está en transición y hay múltiples imágenes
      if (!this.isTransitioning && this.images.length > 1) {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.emitChanges();
      }
    }, this.autoPlayInterval);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private emitChanges(): void {
    this.imageChange.emit(this.currentImage);
    this.indexChange.emit(this.currentIndex);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/img/default-product.jpg';
  }

  onThumbnailError(event: any): void {
    event.target.src = 'assets/img/default-product.jpg';
  }
}
