import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';

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
export class ModalConfirmacaoComponent implements AfterViewInit, OnChanges {
  @Input() title: string = 'Confirmação';
  @Input() message: string = 'Deseja continuar?';
  
  // NOVO: Input para controlar o tipo do modal
  @Input() type: ModalType = 'primary';
  @Input() isVisible: boolean = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  
  private confirmAction: (() => void) | null = null;

  @ViewChild('modalRef') modalRef!: ElementRef;

  private bsModal: any;

  ngAfterViewInit(): void {
    if (this.modalRef) {
      this.bsModal = new bootstrap.Modal(this.modalRef.nativeElement);
      this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
        // Apenas emite o 'canceled' se o usuário realmente fechar (não ao confirmar)
        if (!this.confirmedEmitted) {
          this.onCancel.emit();
        }
        this.confirmedEmitted = false; // Reseta para a próxima abertura
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.bsModal) {
      if (changes['isVisible'].currentValue) {
        this.bsModal.show();
      } else {
        this.bsModal.hide();
      }
    }
  }

  // Método open atualizado para receber os parâmetros E a ação de callback
  public open(type: ModalType = 'primary', title: string, message: string, action: () => void): void {
    this.type = type;
    this.title = title;
    this.message = message;
    this.confirmAction = action; // Armazena a ação a ser executada
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
  confirm(): void {
    this.confirmedEmitted = true;
    if (this.confirmAction) {
      this.confirmAction(); // Executa a ação armazenada
    } else {
      this.onConfirm.emit(); // Emite o evento se não há callback
    }
    this.close();
  }

  cancel(): void {
    this.onCancel.emit();
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