import { Component } from "@angular/core";
import { CardComponent } from "../components/card.component";

@Component({
  selector: "app-demo-card",
  standalone: true,
  imports: [CardComponent],
  template: `
    <div class="demo-container">
      <h2>Producto Destacado</h2>
      <div class="card-wrapper">
        <app-card
          productImage="assets/images/corte-premium.jpg"
          productName="Corte Premium de Carne"
          productWeight="1kg"
          productPrice="$12.900"
        >
        </app-card>
        <app-card
          productImage="assets/images/corte-premium.jpg"
          productName="Corte Premium de Carne"
          productWeight="1kg"
          productPrice="$12.900"
        >
        </app-card>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }

      h2 {
        color: #4a1d4a;
        margin-bottom: 20px;
      }

      .card-wrapper {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        padding: 20px;
        justify-items: center;
      }
    `,
  ],
})
export class DemoCardComponent {
  // This component simply displays a single card with hard-coded values
}
