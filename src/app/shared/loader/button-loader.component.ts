import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ButtonType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="buttonType"
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      (click)="handleClick()">
      
      <!-- Loading Spinner -->
      <span *ngIf="loading" class="button-spinner" [class]="'spinner-' + size"></span>
      
      <!-- Icon (when not loading) -->
      <i *ngIf="!loading && icon" [class]="icon" class="button-icon"></i>
      
      <!-- Text -->
      <span class="button-text" [class.loading]="loading">
        {{ loading ? loadingText : text }}
      </span>
    </button>
  `,
  styleUrls: ['./button-loader.component.css']
})
export class ButtonLoaderComponent {
  @Input() text = 'Button';
  @Input() loadingText = 'Carregando...';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: ButtonType = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() icon?: string;
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;
  @Input() outline = false;
  
  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const classes = ['btn-loader'];
    
    // Type
    classes.push(`btn-${this.type}`);
    
    // Size
    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }
    
    // Full width
    if (this.fullWidth) {
      classes.push('btn-block');
    }
    
    // Loading state
    if (this.loading) {
      classes.push('btn-loading');
    }
    
    return classes.join(' ');
  }

  handleClick(): void {
    if (!this.loading && !this.disabled) {
      this.clicked.emit();
    }
  }
}
