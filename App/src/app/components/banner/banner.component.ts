import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-banner",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./banner.component.html",
  styleUrl: "./banner.component.css",
})
export class BannerComponent implements OnInit, OnDestroy {
  @Input() bannerImages: string | string[] = "";
  currentImageIndex: number = 0;
  private autoplayInterval: any = null;

  ngOnInit(): void {
    console.log('Banner images input:', this.bannerImages);
    console.log('Banner images array:', this.getBannerImages());
    console.log('Has multiple images:', this.hasMultipleImages());
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private startAutoplay(): void {
    // Solo iniciar auto-play si hay múltiples imágenes
    console.log('Starting autoplay, has multiple:', this.hasMultipleImages());
    if (this.hasMultipleImages()) {
      this.autoplayInterval = setInterval(() => {
        console.log('Autoplay: changing image from', this.currentImageIndex);
        this.nextImage();
      }, 2000); // 2 segundos
    }
  }

  private stopAutoplay(): void {
    console.log('Stopping autoplay');
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  getBannerImages(): string[] {
    if (Array.isArray(this.bannerImages)) {
      return this.bannerImages;
    }
    
    // Si es un string, separar por comas
    if (typeof this.bannerImages === 'string' && this.bannerImages.trim()) {
      return this.bannerImages
        .split(',')
        .map(url => url.trim())
        .filter(url => url !== '');
    }
    
    return [];
  }

  getPrimaryImage(): string {
    const images = this.getBannerImages();
    return images.length > 0 ? images[0] : "assets/images/default-product.svg";
  }

  getCurrentImage(): string {
    const images = this.getBannerImages();
    return images.length > 0 ? images[this.currentImageIndex] : "assets/images/default-product.svg";
  }

  nextImage(): void {
    const images = this.getBannerImages();
    console.log('nextImage called, images length:', images.length);
    if (images.length <= 1) return;
    
    const oldIndex = this.currentImageIndex;
    this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
    console.log('Image changed from', oldIndex, 'to', this.currentImageIndex);
  }

  previousImage(): void {
    const images = this.getBannerImages();
    if (images.length <= 1) return;
    this.currentImageIndex = this.currentImageIndex === 0 ? images.length - 1 : this.currentImageIndex - 1;
  }

  goToImage(index: number): void {
    const images = this.getBannerImages();
    if (index >= 0 && index < images.length) {
      this.currentImageIndex = index;
      // Reiniciar auto-play cuando el usuario selecciona una imagen manualmente
      this.stopAutoplay();
      this.startAutoplay();
    }
  }

  hasMultipleImages(): boolean {
    return this.getBannerImages().length > 1;
  }
}
