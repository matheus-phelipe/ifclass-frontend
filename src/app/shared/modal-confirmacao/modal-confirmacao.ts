import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

declare var bootstrap: any;

// NOVO: Define os tipos de modal que podemos ter
type ModalType = 'danger' | 'primary' | 'success';

@Component({
  selector: 'app-modal-confirmacao',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './modal-confirmacao.html',
  styleUrls: ['./modal-confirmacao.css']
})
export class ModalConfirmacaoComponent implements AfterViewInit {
  @Input() title: string = 'Confirmação';
  @Input() message: string = 'Deseja continuar?';
  
  // NOVO: Input para controlar o tipo do modal
  @Input() type: ModalType = 'primary';

  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  @ViewChild('modalRef') modalRef!: ElementRef;

  private bsModal: any;

  ngAfterViewInit(): void {
    if (this.modalRef) {
      this.bsModal = new bootstrap.Modal(this.modalRef.nativeElement);
      this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
        // Apenas emite o 'canceled' se o usuário realmente fechar (não ao confirmar)
        if (!this.confirmedEmitted) {
          this.canceled.emit();
        }
        this.confirmedEmitted = false; // Reseta para a próxima abertura
      });
    }
  }

  // Método open atualizado para receber os parâmetros
  public open(type: ModalType = 'primary', title: string, message: string): void {
    this.type = type;
    this.title = title;
    this.message = message;
    if (this.bsModal) {
      this.bsModal.show();
    }
  }

  public close(): void {
    if (this.bsModal) {
      this.bsModal.hide();
    }
  }

  private confirmedEmitted = false;
  onConfirm(): void {
    this.confirmedEmitted = true; // Marca que a confirmação foi emitida
    this.confirmed.emit();
    this.close();
  }

  // Getters para classes dinâmicas no template
  get headerClass(): string {
    return `bg-${this.type}`;
  }

  get confirmButtonClass(): string {
    return `btn-${this.type}`;
  }
  
  get iconClass(): string {
    switch (this.type) {
      case 'danger': return 'bi-exclamation-triangle-fill';
      case 'success': return 'bi-check-circle-fill';
      default: return 'bi-question-circle-fill';
    }
  }
}