import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],  
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent implements AfterViewInit {
  @Input() id: string = '';
  @Input() title: string = 'Mensagem';
  @Input() message: string = '';

  @Output() closed = new EventEmitter<void>();

  @ViewChild('modalRef', { static: false }) modalRef!: ElementRef;

  private bsModal: any;

  ngAfterViewInit(): void {
    this.bsModal = new bootstrap.Modal(this.modalRef.nativeElement);

    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.closed.emit(); // <-- EMITE quando fechar
    });
  }

  public open(): void {
    this.bsModal.show();
  }

  public close(): void {
    this.bsModal.hide();
  }
}
