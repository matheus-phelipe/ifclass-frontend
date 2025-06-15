import { Component, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common'; // NgClass é necessário para classes dinâmicas

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgIf, NgClass], // Adicionado NgClass aos imports
  template: `
    <!-- A classe do alerta agora é dinâmica com [ngClass] -->
    <div *ngIf="visible" 
         class="alert d-flex align-items-center position-fixed top-0 end-0 m-3 shadow-lg" 
         [ngClass]="alertClass"
         role="alert" 
         style="z-index: 1050; min-width: 300px;">
      
      <!-- O ícone também muda de acordo com o tipo -->
      <i class="bi me-2 fs-4" [ngClass]="iconClass"></i>
      <div>{{ message }}</div>
    </div>

    <!-- Definição dos ícones do Bootstrap no template para fácil referência -->
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
      <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
      </symbol>
      <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
      </symbol>
    </svg>
  `,
  styles: [`
    .alert {
      border-radius: 0.5rem;
      border-left-width: 5px;
    }
  `]
})
export class AlertComponent {
  message: string | null = null;
  visible = false;
  
  // Propriedades para controlar o estilo dinâmico
  alertClass = 'alert-success';
  iconClass = 'bi-check-circle-fill';

  // O tipo pode ser 'success' ou qualquer outra classe do Bootstrap (ex: 'danger', 'warning')
  show(message: string, duration = 3000, tipo: 'success' | 'danger' | 'warning' | 'info' = 'success') {
    this.message = message;
    
    // Define a classe do alerta e do ícone com base no tipo
    this.alertClass = `alert-${tipo}`;
    
    if (tipo === 'success') {
      this.iconClass = 'bi-check-circle-fill';
    } else if (tipo === 'danger') {
      this.iconClass = 'bi-exclamation-triangle-fill';
    } // Adicione outras condições para 'warning', 'info', etc., se necessário.

    this.visible = true;

    setTimeout(() => {
      this.visible = false;
    }, duration);
  }
}