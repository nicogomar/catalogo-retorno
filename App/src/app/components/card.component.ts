import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./card.html",
  styleUrls: ["./Card.css"],
})
export class CardComponent {
  @Input() productImage: string = "";
  @Input() productName: string = "";
  @Input() productWeight: string = "";
  @Input() productPrice: string = "";
  @Input() productId: number = 0;
  @Output() cardClick = new EventEmitter<number>();

  onCardClick(): void {
    console.log("Card clicked with ID:", this.productId);
    this.cardClick.emit(this.productId);
  }
}
