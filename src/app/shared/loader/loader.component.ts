import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type LoaderType = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'inline';
export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay Loader -->
    <div class="loader-overlay" *ngIf="show && !inline" [class.transparent]="transparent">
      <div class="loader-content">
        <div [ngSwitch]="type" class="loader-wrapper" [class]="'loader-' + size">
          <!-- Spinner -->
          <div *ngSwitchCase="'spinner'" class="loader-spinner"></div>

          <!-- Dots -->
          <div *ngSwitchCase="'dots'" class="loader-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>

          <!-- Pulse -->
          <div *ngSwitchCase="'pulse'" class="loader-pulse"></div>

          <!-- Default Spinner -->
          <div *ngSwitchDefault class="loader-spinner"></div>
        </div>

        <div class="loader-text" *ngIf="text">{{ text }}</div>
      </div>
    </div>

    <!-- Inline Loader -->
    <div *ngIf="show && inline" [ngSwitch]="type" class="loader-inline" [class]="'loader-' + size">
      <!-- Spinner -->
      <div *ngSwitchCase="'spinner'" class="loader-spinner-inline"></div>

      <!-- Dots -->
      <div *ngSwitchCase="'dots'" class="loader-dots-inline">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>

      <!-- Pulse -->
      <div *ngSwitchCase="'pulse'" class="loader-pulse-inline"></div>

      <!-- Default Spinner -->
      <div *ngSwitchDefault class="loader-spinner-inline"></div>
    </div>

    <!-- Skeleton Loader -->
    <div *ngIf="show && type === 'skeleton'" class="skeleton-loader" [class]="'skeleton-' + size">
      <div class="skeleton-item" *ngFor="let item of skeletonItems"></div>
    </div>
  `,
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  @Input() show = false;
  @Input() type: LoaderType = 'spinner';
  @Input() size: LoaderSize = 'md';
  @Input() text?: string;
  @Input() inline = false;
  @Input() transparent = false;
  @Input() skeletonItems = [1, 2, 3]; // Para skeleton loader
}