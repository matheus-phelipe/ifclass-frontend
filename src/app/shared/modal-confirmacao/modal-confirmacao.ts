import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-confirmacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirmacao.html',
  styleUrls: ['./modal-confirmacao.css']
})
export class ModalConfirmacaoComponent implements AfterViewInit {
  @Input() message: string = 'Deseja continuar?';

  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  @ViewChild('modalRef', { static: false }) modalRef!: ElementRef;

  private bsModal: any;

  ngAfterViewInit(): void {
    this.bsModal = new bootstrap.Modal(this.modalRef.nativeElement);

    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.canceled.emit();
    });
  }

  open() {
    this.bsModal.show();
  }

  close() {
    this.bsModal.hide();
  }

  onConfirm() {
    this.confirmed.emit();
    this.close();
  }
}
