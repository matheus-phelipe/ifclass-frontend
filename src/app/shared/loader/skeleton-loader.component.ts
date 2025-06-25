import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type SkeletonType = 'text' | 'card' | 'list' | 'table' | 'avatar' | 'image' | 'custom';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [class]="containerClasses">
      <!-- Text Skeleton -->
      <ng-container *ngIf="type === 'text'">
        <div class="skeleton-line"
             *ngFor="let line of linesArray; let i = index"
             [style.width]="getLineWidth(i)"
             [class]="'skeleton-line-' + size">
        </div>
      </ng-container>

      <!-- Card Skeleton -->
      <ng-container *ngIf="type === 'card'">
        <div class="skeleton-card" [class]="'skeleton-card-' + size">
          <div class="skeleton-card-header">
            <div class="skeleton-avatar" [class]="'skeleton-avatar-' + size"></div>
            <div class="skeleton-card-title">
              <div class="skeleton-line" [class]="'skeleton-line-' + size" style="width: 60%;"></div>
              <div class="skeleton-line" [class]="'skeleton-line-' + size" style="width: 40%;"></div>
            </div>
          </div>
          <div class="skeleton-card-body">
            <div class="skeleton-line" 
                 *ngFor="let line of [1,2,3]; let i = index"
                 [class]="'skeleton-line-' + size"
                 [style.width]="getCardLineWidth(i)">
            </div>
          </div>
          <div class="skeleton-card-footer" *ngIf="showFooter">
            <div class="skeleton-button" [class]="'skeleton-button-' + size"></div>
            <div class="skeleton-button" [class]="'skeleton-button-' + size"></div>
          </div>
        </div>
      </ng-container>

      <!-- List Skeleton -->
      <ng-container *ngIf="type === 'list'">
        <div class="skeleton-list-item"
             *ngFor="let item of itemsArray"
             [class]="'skeleton-list-item-' + size">
          <div class="skeleton-avatar" [class]="'skeleton-avatar-' + size"></div>
          <div class="skeleton-list-content">
            <div class="skeleton-line" [class]="'skeleton-line-' + size" style="width: 70%;"></div>
            <div class="skeleton-line" [class]="'skeleton-line-' + size" style="width: 50%;"></div>
          </div>
          <div class="skeleton-list-action">
            <div class="skeleton-button" [class]="'skeleton-button-' + size"></div>
          </div>
        </div>
      </ng-container>

      <!-- Table Skeleton -->
      <ng-container *ngIf="type === 'table'">
        <div class="skeleton-table">
          <!-- Header -->
          <div class="skeleton-table-header">
            <div class="skeleton-table-cell"
                 *ngFor="let col of columnsArray"
                 [class]="'skeleton-table-cell-' + size">
              <div class="skeleton-line" [class]="'skeleton-line-' + size" style="width: 80%;"></div>
            </div>
          </div>
          <!-- Rows -->
          <div class="skeleton-table-row"
               *ngFor="let row of rowsArray"
               [class]="'skeleton-table-row-' + size">
            <div class="skeleton-table-cell"
                 *ngFor="let col of columnsArray"
                 [class]="'skeleton-table-cell-' + size">
              <div class="skeleton-line" [class]="'skeleton-line-' + size" [style.width]="getTableCellWidth()"></div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Avatar Skeleton -->
      <ng-container *ngIf="type === 'avatar'">
        <div class="skeleton-avatar" [class]="'skeleton-avatar-' + size"></div>
      </ng-container>

      <!-- Image Skeleton -->
      <ng-container *ngIf="type === 'image'">
        <div class="skeleton-image" 
             [class]="'skeleton-image-' + size"
             [style.width]="imageWidth"
             [style.height]="imageHeight">
        </div>
      </ng-container>

      <!-- Custom Skeleton -->
      <ng-container *ngIf="type === 'custom'">
        <ng-content></ng-content>
      </ng-container>
    </div>
  `,
  styleUrls: ['./skeleton-loader.component.css']
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonType = 'text';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() lines = 3;
  @Input() items = 5;
  @Input() columns = 4;
  @Input() rows = 5;
  @Input() showFooter = true;
  @Input() imageWidth = '100%';
  @Input() imageHeight = '200px';
  @Input() animated = true;
  @Input() rounded = true;

  get linesArray(): number[] {
    return Array.from({ length: this.lines }, (_, i) => i);
  }

  get itemsArray(): number[] {
    return Array.from({ length: this.items }, (_, i) => i);
  }

  get columnsArray(): number[] {
    return Array.from({ length: this.columns }, (_, i) => i);
  }

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  get containerClasses(): string {
    const classes = ['skeleton-wrapper'];
    
    if (this.animated) {
      classes.push('skeleton-animated');
    }
    
    if (this.rounded) {
      classes.push('skeleton-rounded');
    }
    
    return classes.join(' ');
  }

  getLineWidth(index: number): string {
    const widths = ['100%', '85%', '70%', '90%', '60%'];
    return widths[index % widths.length];
  }

  getCardLineWidth(index: number): string {
    const widths = ['100%', '75%', '85%'];
    return widths[index % widths.length];
  }

  getTableCellWidth(): string {
    const widths = ['60%', '80%', '70%', '90%', '65%'];
    return widths[Math.floor(Math.random() * widths.length)];
  }
}
