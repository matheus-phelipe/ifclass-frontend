import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="visible" class="alert alert-success d-flex align-items-center position-fixed top-0 end-0 m-3" role="alert" style="z-index: 1050; min-width: 300px;">
      <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
        <use xlink:href="#check-circle-fill"/>
      </svg>
      <div>{{ message }}</div>
    </div>
  `,
  styles: []
})
export class AlertComponent {
  @Input() message: string | null = null;
  visible = false;

  show(message: string, duration = 3000) {
    this.message = message;
    this.visible = true;

    setTimeout(() => {
      this.visible = false;
      this.message = null;
    }, duration);
  }
}
