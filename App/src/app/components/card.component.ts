import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.css"],
})
export class CardComponent {
  @Input() productImage: string | string[] = "";
  @Input() productName: string = "";
  @Input() productWeight: string = "";
  @Input() productPrice: string = "";
  @Input() productId: number = 0;
  @Output() cardClick = new EventEmitter<number>();

  // Getter para obtener la primera imagen del producto
  get displayImage(): string {
    if (Array.isArray(this.productImage)) {
      return this.productImage.length > 0 ? this.productImage[0] : 'assets/images/default-product.svg';
    }
    return this.productImage || 'assets/images/default-product.svg';
  }

  onCardClick(): void {
    console.log("Card clicked with ID:", this.productId);
    this.cardClick.emit(this.productId);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-product.svg';
    console.warn(`Failed to load image: ${this.displayImage}, using fallback`);
  }
}
