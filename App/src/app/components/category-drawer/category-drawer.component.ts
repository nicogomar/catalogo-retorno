import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentesTextos } from '../../personalizacion';

export interface Category {
  name: string;
  count: number;
}

@Component({
  selector: 'app-category-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-drawer.component.html',
  styleUrl: './category-drawer.component.css'
})
export class CategoryDrawerComponent {
  @Input() isOpen: boolean = false;
  @Input() categories: Category[] = [];
  @Input() selectedCategory: string | null = null;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() categorySelected = new EventEmitter<string | null>();

  // Textos centralizados
  textos = ComponentesTextos;

  onCloseDrawer(): void {
    this.closeDrawer.emit();
  }

  onCategorySelect(category: string | null): void {
    this.categorySelected.emit(category);
    this.onCloseDrawer();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCloseDrawer();
    }
  }

  getTotalCount(): number {
    return this.categories.reduce((total, category) => total + category.count, 0);
  }
}
